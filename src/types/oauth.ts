/**
 * OAuth Types for Meta Embedded Signup
 * 
 * Types for OAuth authentication flow used in WhatsApp Embedded Signup
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 */

/**
 * Parameters for generating Meta Embedded Signup URL
 */
export interface GenerateSignupUrlParams {
  /** Meta App ID */
  appId: string;
  /** Embedded Signup Configuration ID from Meta Business Suite */
  configId: string;
  /** OAuth redirect URI (must be registered in Meta App settings) */
  redirectUri: string;
  /** CSRF state token (auto-generated if not provided) */
  state?: string;
  /** API version to use (default: v21.0) */
  apiVersion?: string;
  /** Additional URL parameters */
  extraParams?: Record<string, string>;
  /** Feature type for embedded signup */
  featureType?: 'whatsapp_embedded_signup' | 'whatsapp_business_app_onboarding';
  /** Session info version (default: 3) */
  sessionInfoVersion?: string;
}

/**
 * Result of generating signup URL
 */
export interface GenerateSignupUrlResult {
  /** Full URL to redirect user for signup */
  url: string;
  /** State token (for CSRF verification on callback) */
  state: string;
}

/**
 * Parameters for exchanging OAuth code for access token
 */
export interface ExchangeCodeParams {
  /** Authorization code from OAuth callback */
  code: string;
  /** Meta App ID */
  appId: string;
  /** Meta App Secret */
  appSecret: string;
  /** OAuth redirect URI (required for redirect flow, optional for embedded signup popup) */
  redirectUri?: string;
  /** API version to use (default: v21.0) */
  apiVersion?: string;
  /** Custom fetch implementation (for Cloudflare Workers compatibility) */
  fetch?: typeof fetch;
}

/**
 * Result of OAuth code exchange
 */
export interface ExchangeCodeResult {
  /** Access token for API calls */
  accessToken: string;
  /** Token type (usually "bearer") */
  tokenType: string;
  /** Token expiration time in seconds (optional) */
  expiresIn?: number;
}

/**
 * Raw response from Meta OAuth token endpoint
 */
export interface MetaOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

/**
 * Parameters for complete embedded signup onboarding flow
 */
export interface CompleteOnboardingParams {
  /** Authorization code from OAuth callback */
  code: string;
  /** State token for CSRF verification */
  state: string;
  /** Meta App ID */
  appId: string;
  /** Meta App Secret */
  appSecret: string;
  /** OAuth redirect URI */
  redirectUri: string;
  /** System User Token for long-term API access */
  systemUserToken: string;
  /** API version to use (default: v21.0) */
  apiVersion?: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Onboarding options */
  options?: OnboardingOptions;
}

/**
 * Options for onboarding flow
 */
export interface OnboardingOptions {
  /** Automatically subscribe to WABA webhooks (default: true) */
  autoSubscribeWebhooks?: boolean;
  /** Automatically register phone number with 2-step verification (default: true) */
  autoRegisterPhone?: boolean;
  /** Custom 6-digit PIN for phone registration (auto-generated if not provided) */
  pin?: string;
  /** Override webhook callback URL for this WABA */
  webhookOverrideUrl?: string;
  /** Webhook verification token (required if webhookOverrideUrl is set) */
  webhookVerifyToken?: string;
}

/**
 * Result of complete onboarding flow
 */
export interface OnboardingResult {
  /** WhatsApp Business Account ID */
  wabaId: string;
  /** Phone Number ID for API calls */
  phoneNumberId: string;
  /** Display phone number (e.g., +1 234 567 8900) */
  phoneNumber: string;
  /** Verified display name */
  displayName: string;
  /** Quality rating of the phone number */
  qualityRating?: string;
  /** WABA account review status */
  accountReviewStatus?: string;
  /** Business token from OAuth (short-lived) */
  businessToken: string;
  /** 6-digit PIN if phone was registered */
  pin?: string;
  /** Whether webhooks were subscribed */
  webhooksSubscribed: boolean;
  /** Whether phone was registered */
  phoneRegistered: boolean;
}

/**
 * Error details from Meta API
 */
export interface MetaAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

/**
 * OAuth error with Meta-specific details
 */
export interface OAuthError extends Error {
  code: string;
  metaError?: MetaAPIError;
  httpStatus?: number;
}
