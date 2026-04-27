/**
 * Embedded Signup Module
 * 
 * High-level APIs for WhatsApp Embedded Signup onboarding flow.
 * 
 * @module embedded-signup
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 * 
 * @example
 * ```typescript
 * import { EmbeddedSignupFlow, OAuthHelper } from '@wabase/wa-sdk';
 * 
 * // Step 1: Generate signup URL
 * const oauth = new OAuthHelper();
 * const { url, state } = oauth.generateSignupUrl({
 *   appId: 'YOUR_APP_ID',
 *   configId: 'YOUR_CONFIG_ID',
 *   redirectUri: 'https://example.com/callback',
 * });
 * 
 * // Store state for CSRF verification
 * await db.storeState(state, { userId, expiresAt: Date.now() + 10 * 60 * 1000 });
 * 
 * // Open signup in popup
 * window.open(url, 'waba_signup', 'width=600,height=700');
 * 
 * // Step 2: Handle callback
 * const flow = new EmbeddedSignupFlow({
 *   systemUserToken: 'YOUR_SYSTEM_USER_TOKEN',
 * });
 * 
 * const result = await flow.complete({
 *   code: callbackCode,
 *   state: callbackState,
 *   appId: 'YOUR_APP_ID',
 *   appSecret: 'YOUR_APP_SECRET',
 *   redirectUri: 'https://example.com/callback',
 *   options: {
 *     autoSubscribeWebhooks: true,
 *     autoRegisterPhone: true,
 *   },
 * });
 * 
 * // Done! Use the credentials
 * console.log('WABA ID:', result.wabaId);
 * console.log('Phone Number ID:', result.phoneNumberId);
 * console.log('Display Name:', result.displayName);
 * console.log('PIN:', result.pin); // Save this securely!
 * ```
 */

export {
    EmbeddedSignupFlow,
    completeOnboarding, fetchPhoneDetails,
    fetchWABADetails,
    // Low-level API functions for granular control
    fetchWABAPhoneNumbers, type FetchOptions, type WABADetails,
    // Types
    type WABAPhoneNumber
} from './flow.js';

// Session logging (for frontend postMessage handling)
export {
    createSessionLogger,
    parseSessionEvent,
    isSuccessEvent,
    isCancelEvent,
    isErrorEvent,
    type SessionLoggerConfig,
} from './session-logger.js';
