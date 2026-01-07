/**
 * @wazapin/wa-sdk
 *
 * TypeScript SDK for WhatsApp Business Cloud API
 * Gold standard quality - Framework & Runtime Agnostic
 */

// Export all types
export type * from "./types/index.js";
export type * from "./types/oauth.js";

// Export error classes
export {
  APIError,
  NetworkError,
  RateLimitError,
  ValidationError,
  WhatsAppError,
} from "./types/errors.js";

// Export validation
export * as schemas from "./validation/schemas/index.js";
export { Validator } from "./validation/validator.js";

// Export WhatsAppClient
export { WhatsAppClient } from "./client/WhatsAppClient.js";

// Export messaging helpers
export { getMediaUrl } from "./messaging/media-helper.js";

// Export OAuth helpers for Embedded Signup
export {
  OAuthHelper,
  debugToken,
  exchangeCodeForToken,
  extractWABAIds,
  generateBasicOAuthUrl,
  generateSignupUrl,
  generateStateToken,
  parseCallbackUrl,
} from "./oauth/index.js";

// Export Embedded Signup Flow
export {
  EmbeddedSignupFlow,
  completeOnboarding,
  fetchPhoneDetails,
  fetchWABADetails,
  // Low-level API functions for granular control
  fetchWABAPhoneNumbers,
} from "./embedded-signup/index.js";

// Export Embedded Signup types
export type {
  FetchOptions,
  WABADetails,
  WABAPhoneNumber,
} from "./embedded-signup/index.js";

// Export Session Logging helpers (for frontend postMessage handling)
export {
  createSessionLogger,
  parseSessionEvent,
  isSuccessEvent,
  isCancelEvent,
  isErrorEvent,
} from "./embedded-signup/session-logger.js";

export type { SessionLoggerConfig } from "./embedded-signup/session-logger.js";
