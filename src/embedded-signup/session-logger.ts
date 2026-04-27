/**
 * Embedded Signup Session Logger
 * 
 * Helper for capturing Meta Embedded Signup events via postMessage.
 * Use this to track successful completions, abandonments, and errors.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation
 * 
 * @example
 * ```typescript
 * import { createSessionLogger } from '@wabase/wa-sdk';
 * 
 * // In your React component
 * useEffect(() => {
 *   const handler = createSessionLogger({
 *     onSuccess: (data) => {
 *       console.log('Signup completed:', data.waba_id, data.phone_number_id);
 *       // Send to your backend
 *     },
 *     onCancel: (data) => {
 *       console.log('User abandoned at:', data.current_step);
 *     },
 *     onError: (data) => {
 *       console.error('Signup error:', data.error_message);
 *     },
 *   });
 *   
 *   window.addEventListener('message', handler);
 *   return () => window.removeEventListener('message', handler);
 * }, []);
 * ```
 */

import type {
  EmbeddedSignupCancelData,
  EmbeddedSignupErrorData,
  EmbeddedSignupSessionEvent,
  EmbeddedSignupSuccessData,
} from '../types/embedded-signup-session.js';

/**
 * Configuration for session logger callbacks
 */
export interface SessionLoggerConfig {
  /** Called when user successfully completes embedded signup */
  onSuccess?: (data: EmbeddedSignupSuccessData, event: EmbeddedSignupSessionEvent) => void | Promise<void>;
  /** Called when user abandons/cancels the signup flow */
  onCancel?: (data: EmbeddedSignupCancelData, event: EmbeddedSignupSessionEvent) => void | Promise<void>;
  /** Called when user encounters and reports an error */
  onError?: (data: EmbeddedSignupErrorData, event: EmbeddedSignupSessionEvent) => void | Promise<void>;
  /** Called for any WA_EMBEDDED_SIGNUP event (raw handler) */
  onEvent?: (event: EmbeddedSignupSessionEvent) => void | Promise<void>;
  /** Enable debug logging to console */
  debug?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseUnknownSessionEvent(data: unknown): EmbeddedSignupSessionEvent | null {
  const parsed: unknown = typeof data === 'string' ? JSON.parse(data) : data;

  if (isRecord(parsed) && parsed.type === 'WA_EMBEDDED_SIGNUP') {
    return parsed as unknown as EmbeddedSignupSessionEvent;
  }

  return null;
}

function reportAsyncCallbackError(callbackResult: void | Promise<void>, label: string): void {
  if (callbackResult instanceof Promise) {
    void callbackResult.catch((err: unknown) => {
      console.error(`[SessionLogger] ${label} callback error:`, err);
    });
  }
}

function debugLog(enabled: boolean, message: string, data?: unknown): void {
  if (enabled) {
    // eslint-disable-next-line no-console -- Optional frontend debugging helper.
    console.log(message, data);
  }
}

/**
 * Create a message event handler for Meta Embedded Signup session logging
 * 
 * @param config - Callback configuration
 * @returns Event handler function to use with window.addEventListener('message', handler)
 */
export function createSessionLogger(config: SessionLoggerConfig): (event: MessageEvent) => void {
  const { onSuccess, onCancel, onError, onEvent, debug = false } = config;

  return function handleMessage(event: MessageEvent): void {
    // Security: Only accept messages from facebook.com
    if (!event.origin.endsWith('facebook.com')) {
      return;
    }

    let data: EmbeddedSignupSessionEvent | null;

    try {
      data = parseUnknownSessionEvent(event.data);
    } catch {
      // Non-JSON message from Facebook, ignore
      debugLog(debug, '[SessionLogger] Non-JSON message:', event.data);
      return;
    }

    // Only handle WA_EMBEDDED_SIGNUP events
    if (!data) {
      return;
    }

    debugLog(debug, '[SessionLogger] Received event:', data);

    // Call raw event handler
    if (onEvent) {
      try {
        reportAsyncCallbackError(onEvent(data), 'onEvent');
      } catch (err) {
        console.error('[SessionLogger] onEvent error:', err);
      }
    }

    // Route to specific handlers based on event type
    if (data.event === 'CANCEL') {
      // CANCEL can be either abandonment or error
      const eventData = data.data;

      if (eventData && 'error_message' in eventData && 'error_id' in eventData) {
        // User reported an error
        debugLog(debug, '[SessionLogger] Error reported:', eventData);
        if (onError) {
          try {
            reportAsyncCallbackError(onError(eventData, data), 'onError');
          } catch (err) {
            console.error('[SessionLogger] onError callback error:', err);
          }
        }
      } else if (eventData && 'current_step' in eventData) {
        // User abandoned the flow
        debugLog(debug, '[SessionLogger] Flow abandoned at:', eventData.current_step);
        if (onCancel) {
          try {
            reportAsyncCallbackError(onCancel(eventData, data), 'onCancel');
          } catch (err) {
            console.error('[SessionLogger] onCancel callback error:', err);
          }
        }
      }
    } else if (
      data.event === 'FINISH' ||
      data.event === 'FINISH_ONLY_WABA' ||
      data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
    ) {
      // Successful completion
      const successData = data.data as EmbeddedSignupSuccessData;
      debugLog(debug, '[SessionLogger] Signup completed:', {
          event: data.event,
          wabaId: successData?.waba_id,
          phoneNumberId: successData?.phone_number_id,
          businessId: successData?.business_id,
        });
      if (onSuccess && successData) {
        try {
          reportAsyncCallbackError(onSuccess(successData, data), 'onSuccess');
        } catch (err) {
          console.error('[SessionLogger] onSuccess callback error:', err);
        }
      }
    }
  };
}

/**
 * Parse a raw MessageEvent to extract embedded signup session data
 * 
 * @param event - MessageEvent from window.addEventListener('message', ...)
 * @returns Parsed session event or null if not a valid embedded signup event
 */
export function parseSessionEvent(event: MessageEvent): EmbeddedSignupSessionEvent | null {
  // Security: Only accept messages from facebook.com
  if (!event.origin.endsWith('facebook.com')) {
    return null;
  }

  try {
    return parseUnknownSessionEvent(event.data);
  } catch {
    // Non-JSON message
  }

  return null;
}

/**
 * Check if a session event indicates successful completion
 */
export function isSuccessEvent(event: EmbeddedSignupSessionEvent): boolean {
  return (
    event.event === 'FINISH' ||
    event.event === 'FINISH_ONLY_WABA' ||
    event.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
  );
}

/**
 * Check if a session event indicates user abandonment
 */
export function isCancelEvent(event: EmbeddedSignupSessionEvent): boolean {
  return event.event === 'CANCEL' && 'current_step' in (event.data || {});
}

/**
 * Check if a session event indicates an error
 */
export function isErrorEvent(event: EmbeddedSignupSessionEvent): boolean {
  return event.event === 'CANCEL' && 'error_message' in (event.data || {});
}
