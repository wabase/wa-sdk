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
 * import { createSessionLogger } from '@wazapin/wa-sdk';
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

    let data: EmbeddedSignupSessionEvent;

    try {
      // Parse the event data (can be string or object)
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      // Non-JSON message from Facebook, ignore
      if (debug) {
        console.log('[SessionLogger] Non-JSON message:', event.data);
      }
      return;
    }

    // Only handle WA_EMBEDDED_SIGNUP events
    if (data?.type !== 'WA_EMBEDDED_SIGNUP') {
      return;
    }

    if (debug) {
      console.log('[SessionLogger] Received event:', data);
    }

    // Call raw event handler
    if (onEvent) {
      try {
        onEvent(data);
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
        if (debug) {
          console.log('[SessionLogger] Error reported:', eventData);
        }
        if (onError) {
          try {
            onError(eventData as EmbeddedSignupErrorData, data);
          } catch (err) {
            console.error('[SessionLogger] onError callback error:', err);
          }
        }
      } else if (eventData && 'current_step' in eventData) {
        // User abandoned the flow
        if (debug) {
          console.log('[SessionLogger] Flow abandoned at:', (eventData as EmbeddedSignupCancelData).current_step);
        }
        if (onCancel) {
          try {
            onCancel(eventData as EmbeddedSignupCancelData, data);
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
      if (debug) {
        console.log('[SessionLogger] Signup completed:', {
          event: data.event,
          wabaId: successData?.waba_id,
          phoneNumberId: successData?.phone_number_id,
          businessId: successData?.business_id,
        });
      }
      if (onSuccess && successData) {
        try {
          onSuccess(successData, data);
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
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    
    if (data?.type === 'WA_EMBEDDED_SIGNUP') {
      return data as EmbeddedSignupSessionEvent;
    }
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
