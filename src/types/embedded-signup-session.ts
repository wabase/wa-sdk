/**
 * Embedded Signup Session Types
 * 
 * Types for Meta Embedded Signup session logging via postMessage.
 * These events are sent from Meta's popup to the parent window.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation
 */

/**
 * Session event from Meta postMessage
 */
export interface EmbeddedSignupSessionEvent {
  type: 'WA_EMBEDDED_SIGNUP';
  event: EmbeddedSignupEventType;
  data: EmbeddedSignupSuccessData | EmbeddedSignupCancelData | EmbeddedSignupErrorData;
}

/**
 * Event types for embedded signup
 */
export type EmbeddedSignupEventType =
  | 'FINISH'                                    // Cloud API flow completed
  | 'FINISH_ONLY_WABA'                          // Completed without phone number
  | 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'   // Completed with WA Business App number
  | 'CANCEL';                                   // User cancelled or error

/**
 * Successful completion data
 * Sent when user completes the embedded signup flow
 * 
 * NOTE: For CoEx flow (FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING), 
 * phone_number_id is NOT included - must be fetched via WABA API
 */
export interface EmbeddedSignupSuccessData {
  /** Business customer's phone number ID (optional for CoEx flow) */
  phone_number_id?: string;
  /** Business customer's WhatsApp Business Account ID */
  waba_id: string;
  /** Business customer's business portfolio ID */
  business_id: string;
  /** Business customer's ad account IDs (optional) */
  ad_account_ids?: string[];
  /** Business customer's Facebook Page IDs (optional) */
  page_ids?: string[];
  /** Business customer's dataset IDs (optional) */
  dataset_ids?: string[];
}

/**
 * Abandoned flow data
 * Sent when user cancels/abandons the signup flow
 */
export interface EmbeddedSignupCancelData {
  /** Screen where user abandoned the flow */
  current_step: EmbeddedSignupStep;
}

/**
 * Error data
 * Sent when user encounters and reports an error
 */
export interface EmbeddedSignupErrorData {
  /** Error description text displayed to user */
  error_message: string;
  /** Error ID for support reference */
  error_id: string;
  /** Unique session ID for support reference */
  session_id: string;
  /** Unix timestamp when error was reported */
  timestamp: string;
}

/**
 * Possible steps where user can abandon the flow
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/flow-errors
 */
export type EmbeddedSignupStep =
  | 'BUSINESS_SELECTION'       // Selecting Facebook Business account
  | 'WABA_SELECTION'           // Selecting/creating WABA
  | 'WABA_CREATION'            // Creating new WABA
  | 'PHONE_NUMBER_SELECTION'   // Selecting phone number
  | 'PHONE_NUMBER_SETUP'       // Setting up phone number
  | 'PHONE_NUMBER_VERIFICATION'// Verifying phone number
  | 'DISPLAY_NAME_SETUP'       // Setting display name
  | 'DISPLAY_NAME_REVIEW'      // Display name under review
  | 'PERMISSIONS_REVIEW'       // Reviewing permissions
  | 'CATALOG_SELECTION'        // Selecting catalog (if applicable)
  | 'TERMS_ACCEPTANCE'         // Accepting terms
  | 'FINAL_CONFIRMATION';      // Final confirmation screen

/**
 * FB.login response structure
 */
export interface FBLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    /** Exchangeable authorization code (30 second TTL) */
    code: string;
    /** User ID */
    userID?: string;
    /** Access token (if using token response type) */
    accessToken?: string;
    /** Token expiration */
    expiresIn?: number;
  };
}

/**
 * FB.login options for embedded signup
 */
export interface FBLoginOptions {
  /** Facebook Login for Business configuration ID */
  config_id: string;
  /** Response type - use 'code' for server-side exchange */
  response_type: 'code' | 'token';
  /** Must be true when using code response type */
  override_default_response_type: boolean;
  /** Extra configuration */
  extras: {
    setup: Record<string, unknown>;
    featureType?: string;
    sessionInfoVersion?: string;
  };
}

/**
 * Type guard to check if data is success data
 * NOTE: Only checks for waba_id since phone_number_id is optional in CoEx flow
 */
export function isSuccessData(data: unknown): data is EmbeddedSignupSuccessData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'waba_id' in data
  );
}

/**
 * Type guard to check if data is cancel data
 */
export function isCancelData(data: unknown): data is EmbeddedSignupCancelData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'current_step' in data &&
    !('error_message' in data)
  );
}

/**
 * Type guard to check if data is error data
 */
export function isErrorData(data: unknown): data is EmbeddedSignupErrorData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error_message' in data &&
    'error_id' in data
  );
}
