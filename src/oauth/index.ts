/**
 * OAuth Module for Meta Embedded Signup
 * 
 * Provides utilities for OAuth authentication flow used in WhatsApp Embedded Signup.
 * 
 * @module oauth
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 * 
 * @example
 * ```typescript
 * import { OAuthHelper } from '@wabase/wa-sdk';
 * 
 * const oauth = new OAuthHelper();
 * 
 * // Generate signup URL
 * const { url, state } = oauth.generateSignupUrl({
 *   appId: 'YOUR_APP_ID',
 *   configId: 'YOUR_CONFIG_ID',
 *   redirectUri: 'https://example.com/callback',
 * });
 * 
 * // After user completes signup and redirects back
 * const { accessToken } = await oauth.exchangeCodeForToken({
 *   code: 'AUTH_CODE_FROM_CALLBACK',
 *   appId: 'YOUR_APP_ID',
 *   appSecret: 'YOUR_APP_SECRET',
 *   redirectUri: 'https://example.com/callback',
 * });
 * ```
 */

import type {
  GenerateSignupUrlParams,
  GenerateSignupUrlResult,
  ExchangeCodeParams,
  ExchangeCodeResult,
} from '../types/oauth.js';

import {
  generateSignupUrl,
  generateBasicOAuthUrl,
  generateStateToken,
  parseCallbackUrl,
} from './url-builder.js';

import {
  exchangeCodeForToken,
  debugToken,
  extractWABAIds,
} from './token-exchange.js';

// Re-export types
export type * from '../types/oauth.js';

// Re-export functions
export {
  generateSignupUrl,
  generateBasicOAuthUrl,
  generateStateToken,
  parseCallbackUrl,
  exchangeCodeForToken,
  debugToken,
  extractWABAIds,
};

/**
 * OAuth Helper class for Meta Embedded Signup
 * 
 * Provides a convenient object-oriented interface for OAuth operations.
 * All methods are also available as standalone functions.
 * 
 * @example
 * ```typescript
 * const oauth = new OAuthHelper();
 * 
 * // Step 1: Generate signup URL
 * const { url, state } = oauth.generateSignupUrl({
 *   appId: '1234567890',
 *   configId: '9876543210',
 *   redirectUri: 'https://example.com/callback',
 * });
 * 
 * // Store state for CSRF verification
 * await db.storeState(state, { expiresAt: Date.now() + 10 * 60 * 1000 });
 * 
 * // Step 2: Exchange code for token (after callback)
 * const { accessToken } = await oauth.exchangeCodeForToken({
 *   code: authCode,
 *   appId: '1234567890',
 *   appSecret: 'your_app_secret',
 *   redirectUri: 'https://example.com/callback',
 * });
 * 
 * // Step 3: Debug token to get WABA IDs
 * const wabaIds = await oauth.getWABAIds(accessToken, systemUserToken);
 * ```
 */
export class OAuthHelper {
  private defaultApiVersion: string;
  private customFetch?: typeof fetch;

  constructor(options?: {
    /** Default API version to use (default: v21.0) */
    apiVersion?: string;
    /** Custom fetch implementation (for Cloudflare Workers compatibility) */
    fetch?: typeof fetch;
  }) {
    this.defaultApiVersion = options?.apiVersion || 'v21.0';
    this.customFetch = options?.fetch;
  }

  /**
   * Generate a cryptographically secure state token for CSRF protection
   */
  generateStateToken(): string {
    return generateStateToken();
  }

  /**
   * Generate Meta Embedded Signup URL
   * 
   * @param params - URL generation parameters
   * @returns Object containing the URL and state token
   */
  generateSignupUrl(params: GenerateSignupUrlParams): GenerateSignupUrlResult {
    return generateSignupUrl({
      ...params,
      apiVersion: params.apiVersion || this.defaultApiVersion,
    });
  }

  /**
   * Generate a simple OAuth URL without embedded signup extras
   */
  generateBasicOAuthUrl(params: {
    appId: string;
    redirectUri: string;
    scopes?: string[];
    state?: string;
  }): GenerateSignupUrlResult {
    return generateBasicOAuthUrl({
      ...params,
      apiVersion: this.defaultApiVersion,
    });
  }

  /**
   * Parse OAuth callback URL to extract code and state
   */
  parseCallbackUrl(callbackUrl: string): {
    code?: string;
    state?: string;
    error?: string;
    errorDescription?: string;
  } {
    return parseCallbackUrl(callbackUrl);
  }

  /**
   * Exchange OAuth authorization code for access token
   * 
   * @param params - Token exchange parameters
   * @returns Access token and metadata
   */
  async exchangeCodeForToken(params: ExchangeCodeParams): Promise<ExchangeCodeResult> {
    return exchangeCodeForToken({
      ...params,
      apiVersion: params.apiVersion || this.defaultApiVersion,
      fetch: params.fetch || this.customFetch,
    });
  }

  /**
   * Debug an access token to get information about it
   * 
   * @param inputToken - Token to debug
   * @param accessToken - Access token to authenticate the request
   */
  async debugToken(inputToken: string, accessToken: string): ReturnType<typeof debugToken> {
    return debugToken(inputToken, accessToken, {
      apiVersion: this.defaultApiVersion,
      fetch: this.customFetch,
    });
  }

  /**
   * Get WABA IDs from an OAuth token (convenience method)
   * 
   * Combines debugToken and extractWABAIds for a simpler API.
   * 
   * @param businessToken - Business token from OAuth code exchange
   * @param systemUserToken - System User Token for debugging
   * @returns Array of WABA IDs
   */
  async getWABAIds(businessToken: string, systemUserToken: string): Promise<string[]> {
    const debugResponse = await this.debugToken(businessToken, systemUserToken);
    return extractWABAIds(debugResponse);
  }
}
