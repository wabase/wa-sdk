/**
 * OAuth Token Exchange for Meta API
 * 
 * Handles exchanging OAuth authorization codes for access tokens
 * 
 * @see https://developers.facebook.com/docs/facebook-login/guides/access-tokens
 */

import type {
  ExchangeCodeParams,
  ExchangeCodeResult,
  MetaOAuthTokenResponse,
  OAuthError,
} from '../types/oauth.js';

/**
 * Default API version for Meta Graph API
 */
const DEFAULT_API_VERSION = 'v21.0';

/**
 * Create an OAuth error with Meta-specific details
 */
function createOAuthError(
  message: string,
  code: string,
  metaError?: MetaOAuthTokenResponse['error'],
  httpStatus?: number
): OAuthError {
  const error = new Error(message) as OAuthError;
  error.name = 'OAuthError';
  error.code = code;
  error.metaError = metaError;
  error.httpStatus = httpStatus;
  return error;
}

/**
 * Exchange OAuth authorization code for access token
 * 
 * This is the standard OAuth 2.0 code exchange flow. The returned access token
 * is a short-lived user token that can be used to make API calls on behalf
 * of the user who authorized the app.
 * 
 * @param params - Token exchange parameters
 * @returns Access token and metadata
 * @throws OAuthError if the exchange fails
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await exchangeCodeForToken({
 *     code: 'AQB...',
 *     appId: '1234567890',
 *     appSecret: 'abc123...',
 *     redirectUri: 'https://example.com/callback',
 *   });
 *   
 *   console.log('Access token:', result.accessToken);
 *   console.log('Expires in:', result.expiresIn, 'seconds');
 * } catch (error) {
 *   if (error.code === 'CODE_ALREADY_USED') {
 *     console.error('This authorization code has already been used');
 *   }
 * }
 * ```
 * 
 * @see https://developers.facebook.com/docs/facebook-login/guides/access-tokens#apptokens
 */
export async function exchangeCodeForToken(
  params: ExchangeCodeParams
): Promise<ExchangeCodeResult> {
  const {
    code,
    appId,
    appSecret,
    redirectUri,
    apiVersion = DEFAULT_API_VERSION,
    fetch: customFetch = fetch,
  } = params;

  // Build token endpoint URL
  // Note: redirect_uri is optional for embedded signup popup flow (Tech Provider onboarding)
  // See: https://developers.facebook.com/docs/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider
  const tokenUrl = new URL(`https://graph.facebook.com/${apiVersion}/oauth/access_token`);
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  if (redirectUri) {
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
  }
  tokenUrl.searchParams.set('code', code);

  // Make the request
  const response = await customFetch(tokenUrl.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  // Parse response
  let data: MetaOAuthTokenResponse;
  try {
    data = await response.json() as MetaOAuthTokenResponse;
  } catch {
    throw createOAuthError(
      'Failed to parse token response',
      'PARSE_ERROR',
      undefined,
      response.status
    );
  }

  // Check for errors
  if (!response.ok || data.error) {
    const metaError = data.error;
    
    // Map common error subcodes to specific error codes
    let errorCode = 'TOKEN_EXCHANGE_FAILED';
    let errorMessage = metaError?.message || 'Failed to exchange authorization code';
    
    if (metaError?.error_subcode === 36009) {
      errorCode = 'CODE_ALREADY_USED';
      errorMessage = 'This authorization code has already been used. Please restart the signup process.';
    } else if (metaError?.error_subcode === 36007) {
      errorCode = 'CODE_EXPIRED';
      errorMessage = 'This authorization code has expired. Please restart the signup process.';
    } else if (metaError?.code === 100) {
      errorCode = 'INVALID_PARAMETER';
      errorMessage = metaError.message || 'Invalid parameter in token request';
    }
    
    throw createOAuthError(errorMessage, errorCode, metaError, response.status);
  }

  // Validate response
  if (!data.access_token) {
    throw createOAuthError(
      'No access token in response',
      'NO_TOKEN',
      undefined,
      response.status
    );
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || 'bearer',
    expiresIn: data.expires_in,
  };
}

/**
 * Debug an access token to get information about it
 * 
 * This retrieves information about the token including:
 * - App ID and name
 * - User ID
 * - Scopes granted
 * - Expiration time
 * - For embedded signup: WABA IDs in granular_scopes
 * 
 * @param inputToken - Token to debug
 * @param accessToken - Access token to authenticate the request (usually System User Token)
 * @param options - Additional options
 * @returns Token debug information
 * 
 * @example
 * ```typescript
 * const info = await debugToken(
 *   businessToken,
 *   systemUserToken
 * );
 * 
 * // Get WABA IDs from embedded signup
 * const wabaIds = info.data.granular_scopes
 *   ?.find(s => s.scope === 'whatsapp_business_management')
 *   ?.target_ids || [];
 * ```
 */
export async function debugToken(
  inputToken: string,
  accessToken: string,
  options?: {
    apiVersion?: string;
    fetch?: typeof fetch;
  }
): Promise<{
  data: {
    app_id: string;
    type: string;
    application: string;
    data_access_expires_at: number;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
    granular_scopes?: Array<{
      scope: string;
      target_ids?: string[];
    }>;
    user_id: string;
  };
}> {
  const {
    apiVersion = DEFAULT_API_VERSION,
    fetch: customFetch = fetch,
  } = options || {};

  const debugUrl = new URL(`https://graph.facebook.com/${apiVersion}/debug_token`);
  debugUrl.searchParams.set('input_token', inputToken);
  debugUrl.searchParams.set('access_token', accessToken);

  const response = await customFetch(debugUrl.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: MetaOAuthTokenResponse['error'] };
    throw createOAuthError(
      errorData?.error?.message || 'Failed to debug token',
      'DEBUG_TOKEN_FAILED',
      errorData?.error,
      response.status
    );
  }

  return response.json() as Promise<{
    data: {
      app_id: string;
      type: string;
      application: string;
      data_access_expires_at: number;
      expires_at: number;
      is_valid: boolean;
      scopes: string[];
      granular_scopes?: Array<{
        scope: string;
        target_ids?: string[];
      }>;
      user_id: string;
    };
  }>;
}

/**
 * Extract WABA IDs from debug token response
 * 
 * Convenience function to extract WABA IDs from the granular_scopes
 * returned by debugToken.
 * 
 * @param debugResponse - Response from debugToken
 * @returns Array of WABA IDs, or empty array if none found
 */
export function extractWABAIds(debugResponse: {
  data: {
    granular_scopes?: Array<{
      scope: string;
      target_ids?: string[];
    }>;
  };
}): string[] {
  return debugResponse.data.granular_scopes
    ?.find(s => s.scope === 'whatsapp_business_management')
    ?.target_ids || [];
}
