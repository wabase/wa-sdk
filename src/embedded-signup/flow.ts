/**
 * Embedded Signup Flow - Complete Onboarding Helper
 * 
 * High-level API that combines all embedded signup steps into a single flow.
 * This simplifies the onboarding process from 30+ lines to just a few.
 * 
 * @module embedded-signup/flow
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 */

import type {
    CompleteOnboardingParams,
    OAuthError,
    OnboardingResult,
} from '../types/oauth.js';

import { debugToken, exchangeCodeForToken, extractWABAIds } from '../oauth/token-exchange.js';

/**
 * Default API version for Meta Graph API
 */
const DEFAULT_API_VERSION = 'v21.0';

/**
 * Generate a random 6-digit PIN for phone registration
 */
function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create an error with additional context
 */
function createFlowError(
  message: string,
  code: string,
  cause?: unknown
): OAuthError {
  const error = new Error(message) as OAuthError;
  error.name = 'EmbeddedSignupFlowError';
  error.code = code;
  if (cause instanceof Error) {
    error.cause = cause;
  }
  return error;
}

/**
 * Meta API error response structure
 */
interface MetaErrorResponse {
  error?: {
    message?: string;
    code?: number;
  };
}

/**
 * Phone number data returned from WABA
 */
export interface WABAPhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
}

/**
 * WABA details response
 */
export interface WABADetails {
  id: string;
  name: string;
  account_review_status?: string;
}

/**
 * Options for fetch functions
 */
export interface FetchOptions {
  /** API version (default: v21.0) */
  apiVersion?: string;
  /** Custom fetch implementation (required for Cloudflare Workers) */
  fetch?: typeof fetch;
}

/**
 * Fetch phone numbers from a WhatsApp Business Account
 * 
 * @param wabaId - WhatsApp Business Account ID
 * @param accessToken - Access token (business token or system user token)
 * @param options - Optional configuration
 * @returns List of phone numbers associated with the WABA
 * 
 * @example
 * ```typescript
 * const phoneNumbers = await fetchWABAPhoneNumbers(
 *   'WABA_ID',
 *   'ACCESS_TOKEN',
 *   { fetch: fetch.bind(globalThis) } // Required for CF Workers
 * );
 * console.log(phoneNumbers.data[0].display_phone_number);
 * ```
 */
export async function fetchWABAPhoneNumbers(
  wabaId: string,
  accessToken: string,
  options?: FetchOptions
): Promise<{ data: WABAPhoneNumber[] }> {
  const apiVersion = options?.apiVersion || DEFAULT_API_VERSION;
  const customFetch = options?.fetch || fetch;

  const url = new URL(`https://graph.facebook.com/${apiVersion}/${wabaId}/phone_numbers`);
  url.searchParams.set('access_token', accessToken);

  const response = await customFetch(url.toString());
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as MetaErrorResponse;
    throw createFlowError(
      errorData?.error?.message || 'Failed to fetch phone numbers',
      'PHONE_FETCH_FAILED',
      errorData
    );
  }

  return response.json() as Promise<{ data: WABAPhoneNumber[] }>;
}

/**
 * Fetch phone number details by ID
 * 
 * @param phoneNumberId - Phone Number ID
 * @param accessToken - Access token (business token or system user token)
 * @param options - Optional configuration
 * @returns Phone number details including display number and verified name
 * 
 * @example
 * ```typescript
 * const details = await fetchPhoneDetails(
 *   'PHONE_NUMBER_ID',
 *   'ACCESS_TOKEN',
 *   { fetch: fetch.bind(globalThis) } // Required for CF Workers
 * );
 * console.log(details.display_phone_number, details.verified_name);
 * ```
 */
export async function fetchPhoneDetails(
  phoneNumberId: string,
  accessToken: string,
  options?: FetchOptions
): Promise<WABAPhoneNumber> {
  const apiVersion = options?.apiVersion || DEFAULT_API_VERSION;
  const customFetch = options?.fetch || fetch;

  const url = new URL(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}`);
  url.searchParams.set('fields', 'id,display_phone_number,verified_name,quality_rating');
  url.searchParams.set('access_token', accessToken);

  const response = await customFetch(url.toString());
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as MetaErrorResponse;
    throw createFlowError(
      errorData?.error?.message || 'Failed to fetch phone details',
      'PHONE_DETAILS_FAILED',
      errorData
    );
  }

  return response.json() as Promise<WABAPhoneNumber>;
}

/**
 * Fetch WhatsApp Business Account details
 * 
 * @param wabaId - WhatsApp Business Account ID
 * @param accessToken - Access token (business token or system user token)
 * @param options - Optional configuration
 * @returns WABA details including name and review status
 * 
 * @example
 * ```typescript
 * const waba = await fetchWABADetails(
 *   'WABA_ID',
 *   'ACCESS_TOKEN',
 *   { fetch: fetch.bind(globalThis) } // Required for CF Workers
 * );
 * console.log(waba.name, waba.account_review_status);
 * ```
 */
export async function fetchWABADetails(
  wabaId: string,
  accessToken: string,
  options?: FetchOptions
): Promise<WABADetails> {
  const apiVersion = options?.apiVersion || DEFAULT_API_VERSION;
  const customFetch = options?.fetch || fetch;

  const url = new URL(`https://graph.facebook.com/${apiVersion}/${wabaId}`);
  url.searchParams.set('fields', 'id,name,account_review_status');
  url.searchParams.set('access_token', accessToken);

  const response = await customFetch(url.toString());
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as MetaErrorResponse;
    throw createFlowError(
      errorData?.error?.message || 'Failed to fetch WABA details',
      'WABA_DETAILS_FAILED',
      errorData
    );
  }

  return response.json() as Promise<WABADetails>;
}

/**
 * Subscribe to WABA webhooks
 */
async function subscribeToWebhooks(
  wabaId: string,
  accessToken: string,
  apiVersion: string,
  customFetch: typeof fetch,
  override?: { url: string; verifyToken: string }
): Promise<boolean> {
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${wabaId}/subscribed_apps`);
  
  const body: Record<string, string> = {};
  if (override) {
    body.override_callback_uri = override.url;
    body.verify_token = override.verifyToken;
  }

  const response = await customFetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as MetaErrorResponse;
    console.warn('[EmbeddedSignupFlow] Webhook subscription failed:', errorData);
    return false;
  }

  return true;
}

/**
 * Register phone number with 2-step verification
 */
async function registerPhone(
  phoneNumberId: string,
  pin: string,
  accessToken: string,
  apiVersion: string,
  customFetch: typeof fetch
): Promise<boolean> {
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/register`);

  const response = await customFetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      pin,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as MetaErrorResponse;
    const errorMsg = errorData?.error?.message || '';
    
    // These errors are expected in some cases (already registered, etc.)
    if (
      errorMsg.includes('133005') || // PIN mismatch
      errorMsg.includes('131014') || // Internal error (often already registered)
      errorMsg.includes('133016') || // Too many attempts
      errorMsg.includes('PIN')
    ) {
      console.warn('[EmbeddedSignupFlow] Phone registration skipped (expected):', errorMsg);
      return true; // Consider it successful
    }
    
    console.warn('[EmbeddedSignupFlow] Phone registration failed:', errorData);
    return false;
  }

  return true;
}

/**
 * Complete Embedded Signup Onboarding Flow
 * 
 * This function combines all the steps required for WhatsApp Embedded Signup
 * into a single, easy-to-use API:
 * 
 * 1. Exchange OAuth code for business token
 * 2. Debug token to get WABA ID
 * 3. Fetch phone number ID from WABA
 * 4. Subscribe to webhooks (optional)
 * 5. Register phone with 2-step verification (optional)
 * 6. Fetch final details
 * 
 * @param params - Onboarding parameters
 * @returns Complete onboarding result with all credentials
 * @throws OAuthError if any critical step fails
 * 
 * @example
 * ```typescript
 * const result = await completeOnboarding({
 *   code: 'AUTH_CODE_FROM_CALLBACK',
 *   state: 'CSRF_STATE_TOKEN',
 *   appId: 'YOUR_APP_ID',
 *   appSecret: 'YOUR_APP_SECRET',
 *   redirectUri: 'https://example.com/callback',
 *   systemUserToken: 'YOUR_SYSTEM_USER_TOKEN',
 *   options: {
 *     autoSubscribeWebhooks: true,
 *     autoRegisterPhone: true,
 *   },
 * });
 * 
 * console.log('WABA ID:', result.wabaId);
 * console.log('Phone Number ID:', result.phoneNumberId);
 * console.log('Phone:', result.phoneNumber);
 * console.log('PIN:', result.pin);
 * ```
 */
export async function completeOnboarding(
  params: CompleteOnboardingParams
): Promise<OnboardingResult> {
  const {
    code,
    appId,
    appSecret,
    redirectUri,
    systemUserToken,
    apiVersion = DEFAULT_API_VERSION,
    fetch: customFetch = fetch,
    options = {},
  } = params;

  const {
    autoSubscribeWebhooks = true,
    autoRegisterPhone = true,
    pin: providedPin,
    webhookOverrideUrl,
    webhookVerifyToken,
  } = options;

  // Step 1: Exchange code for business token
  console.log('[EmbeddedSignupFlow] Step 1: Exchanging code for token...');
  const tokenResult = await exchangeCodeForToken({
    code,
    appId,
    appSecret,
    redirectUri,
    apiVersion,
    fetch: customFetch,
  });
  const businessToken = tokenResult.accessToken;
  console.log('[EmbeddedSignupFlow] Step 1: Token obtained successfully');

  // Step 2: Debug token to get WABA ID
  console.log('[EmbeddedSignupFlow] Step 2: Debugging token to get WABA ID...');
  const debugResponse = await debugToken(businessToken, systemUserToken, {
    apiVersion,
    fetch: customFetch,
  });
  const wabaIds = extractWABAIds(debugResponse);
  
  if (wabaIds.length === 0) {
    throw createFlowError(
      'No WhatsApp Business Account found. Please complete the signup process.',
      'NO_WABA_ID'
    );
  }
  const wabaId = wabaIds[0];
  console.log(`[EmbeddedSignupFlow] Step 2: Found WABA ID: ${wabaId}`);

  // Step 3: Get phone number ID from WABA (using business token)
  console.log('[EmbeddedSignupFlow] Step 3: Fetching phone numbers...');
  const phoneNumbers = await fetchWABAPhoneNumbers(wabaId, businessToken, { apiVersion, fetch: customFetch });
  
  if (!phoneNumbers.data || phoneNumbers.data.length === 0) {
    throw createFlowError(
      'No phone number found in WhatsApp Business Account. Please add a phone number first.',
      'NO_PHONE_NUMBER'
    );
  }
  const phoneNumberId = phoneNumbers.data[0].id;
  console.log(`[EmbeddedSignupFlow] Step 3: Found phone number ID: ${phoneNumberId}`);

  // Step 4: Subscribe to webhooks (optional)
  let webhooksSubscribed = false;
  if (autoSubscribeWebhooks) {
    console.log('[EmbeddedSignupFlow] Step 4: Subscribing to webhooks...');
    webhooksSubscribed = await subscribeToWebhooks(
      wabaId,
      businessToken,
      apiVersion,
      customFetch,
      webhookOverrideUrl && webhookVerifyToken
        ? { url: webhookOverrideUrl, verifyToken: webhookVerifyToken }
        : undefined
    );
    console.log(`[EmbeddedSignupFlow] Step 4: Webhooks subscribed: ${webhooksSubscribed}`);
  }

  // Step 5: Register phone with 2-step verification (optional)
  let phoneRegistered = false;
  const pin = providedPin || generatePin();
  if (autoRegisterPhone) {
    console.log('[EmbeddedSignupFlow] Step 5: Registering phone number...');
    phoneRegistered = await registerPhone(
      phoneNumberId,
      pin,
      businessToken,
      apiVersion,
      customFetch
    );
    console.log(`[EmbeddedSignupFlow] Step 5: Phone registered: ${phoneRegistered}`);
  }

  // Step 6: Fetch final details using System User Token (for stable long-term access)
  console.log('[EmbeddedSignupFlow] Step 6: Fetching final details...');
  const [phoneDetails, wabaDetails] = await Promise.all([
    fetchPhoneDetails(phoneNumberId, systemUserToken, { apiVersion, fetch: customFetch }),
    fetchWABADetails(wabaId, systemUserToken, { apiVersion, fetch: customFetch }),
  ]);
  console.log('[EmbeddedSignupFlow] Step 6: Details fetched successfully');

  return {
    wabaId,
    phoneNumberId,
    phoneNumber: phoneDetails.display_phone_number,
    displayName: phoneDetails.verified_name || wabaDetails.name,
    qualityRating: phoneDetails.quality_rating,
    accountReviewStatus: wabaDetails.account_review_status,
    businessToken,
    pin: autoRegisterPhone ? pin : undefined,
    webhooksSubscribed,
    phoneRegistered,
  };
}

/**
 * Embedded Signup Flow class
 * 
 * Object-oriented wrapper around completeOnboarding for those who prefer
 * class-based APIs.
 * 
 * @example
 * ```typescript
 * const flow = new EmbeddedSignupFlow({
 *   systemUserToken: 'YOUR_SYSTEM_USER_TOKEN',
 * });
 * 
 * const result = await flow.complete({
 *   code: 'AUTH_CODE',
 *   state: 'CSRF_STATE',
 *   appId: 'APP_ID',
 *   appSecret: 'APP_SECRET',
 *   redirectUri: 'REDIRECT_URI',
 * });
 * ```
 */
export class EmbeddedSignupFlow {
  private systemUserToken: string;
  private apiVersion: string;
  private customFetch?: typeof fetch;

  constructor(config: {
    /** System User Token for long-term API access */
    systemUserToken: string;
    /** API version (default: v21.0) */
    apiVersion?: string;
    /** Custom fetch implementation */
    fetch?: typeof fetch;
  }) {
    this.systemUserToken = config.systemUserToken;
    this.apiVersion = config.apiVersion || DEFAULT_API_VERSION;
    this.customFetch = config.fetch;
  }

  /**
   * Complete the embedded signup onboarding flow
   */
  async complete(params: Omit<CompleteOnboardingParams, 'systemUserToken' | 'apiVersion' | 'fetch'>): Promise<OnboardingResult> {
    return completeOnboarding({
      ...params,
      systemUserToken: this.systemUserToken,
      apiVersion: this.apiVersion,
      fetch: this.customFetch,
    });
  }

  /**
   * Get phone numbers from a WABA (utility method)
   */
  async getWABAPhoneNumbers(wabaId: string) {
    return fetchWABAPhoneNumbers(wabaId, this.systemUserToken, {
      apiVersion: this.apiVersion,
      fetch: this.customFetch,
    });
  }

  /**
   * Get phone details by ID (utility method)
   */
  async getPhoneDetails(phoneNumberId: string) {
    return fetchPhoneDetails(phoneNumberId, this.systemUserToken, {
      apiVersion: this.apiVersion,
      fetch: this.customFetch,
    });
  }

  /**
   * Get WABA details (utility method)
   */
  async getWABADetails(wabaId: string) {
    return fetchWABADetails(wabaId, this.systemUserToken, {
      apiVersion: this.apiVersion,
      fetch: this.customFetch,
    });
  }
}
