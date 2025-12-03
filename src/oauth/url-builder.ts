/**
 * OAuth URL Builder for Meta Embedded Signup
 * 
 * Generates properly formatted OAuth URLs for WhatsApp Embedded Signup flow
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation
 */

import type { GenerateSignupUrlParams, GenerateSignupUrlResult } from '../types/oauth.js';

/**
 * Default API version for Meta Graph API
 */
const DEFAULT_API_VERSION = 'v21.0';

/**
 * Generate a cryptographically secure state token for CSRF protection
 * 
 * @returns Random UUID string
 */
export function generateStateToken(): string {
  // Use crypto.randomUUID if available (Node 19+, modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate Meta Embedded Signup URL
 * 
 * Creates a properly formatted OAuth URL for the WhatsApp Embedded Signup flow.
 * This URL should be opened in a popup window or redirect.
 * 
 * @param params - URL generation parameters
 * @returns Object containing the URL and state token
 * 
 * @example
 * ```typescript
 * const { url, state } = generateSignupUrl({
 *   appId: '1234567890',
 *   configId: '9876543210',
 *   redirectUri: 'https://example.com/callback',
 * });
 * 
 * // Store state for CSRF verification
 * sessionStorage.setItem('oauth_state', state);
 * 
 * // Open signup in popup
 * window.open(url, 'waba_signup', 'width=600,height=700');
 * ```
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation#step-1--generate-an-oauth-url
 */
export function generateSignupUrl(params: GenerateSignupUrlParams): GenerateSignupUrlResult {
  const {
    appId,
    configId,
    redirectUri,
    state = generateStateToken(),
    apiVersion = DEFAULT_API_VERSION,
    featureType = 'whatsapp_business_app_onboarding',
    sessionInfoVersion = '3',
    extraParams = {},
  } = params;

  // Build extras object for embedded signup configuration
  const extras = {
    setup: {}, // Required empty object for setup config
    featureType,
    sessionInfoVersion,
  };

  // Build URL parameters
  const urlParams = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    config_id: configId,
    override_default_response_type: 'true', // Ensure code response type
    extras: JSON.stringify(extras),
    ...extraParams,
  });

  // Use facebook.com/dialog/oauth for Tech Provider flow
  const url = `https://www.facebook.com/${apiVersion}/dialog/oauth?${urlParams.toString()}`;

  return { url, state };
}

/**
 * Generate a simple OAuth URL without embedded signup extras
 * 
 * Use this for basic OAuth flows that don't need embedded signup configuration.
 * 
 * @param params - Basic OAuth parameters
 * @returns Object containing the URL and state token
 */
export function generateBasicOAuthUrl(params: {
  appId: string;
  redirectUri: string;
  scopes?: string[];
  state?: string;
  apiVersion?: string;
}): GenerateSignupUrlResult {
  const {
    appId,
    redirectUri,
    scopes = ['whatsapp_business_management', 'whatsapp_business_messaging'],
    state = generateStateToken(),
    apiVersion = DEFAULT_API_VERSION,
  } = params;

  const urlParams = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: scopes.join(','),
  });

  const url = `https://www.facebook.com/${apiVersion}/dialog/oauth?${urlParams.toString()}`;

  return { url, state };
}

/**
 * Parse OAuth callback URL to extract code and state
 * 
 * @param callbackUrl - Full callback URL with query parameters
 * @returns Object containing code and state, or error details
 * 
 * @example
 * ```typescript
 * const result = parseCallbackUrl(window.location.href);
 * 
 * if (result.error) {
 *   console.error('OAuth error:', result.error);
 * } else {
 *   // Verify state and exchange code
 *   if (result.state === savedState) {
 *     const token = await exchangeCodeForToken({ code: result.code, ... });
 *   }
 * }
 * ```
 */
export function parseCallbackUrl(callbackUrl: string): {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
} {
  const url = new URL(callbackUrl);
  const params = url.searchParams;

  const error = params.get('error');
  if (error) {
    return {
      error,
      errorDescription: params.get('error_description') || undefined,
    };
  }

  return {
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
  };
}
