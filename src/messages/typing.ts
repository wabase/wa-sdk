/**
 * Typing Indicators (API v24.0)
 * Send typing indicators to show activity status
 * @module messages/typing
 */

import type { HTTPClient } from "../client/http.js";

/**
 * Typing state for v24.0 API
 */
export type TypingState = "composing";

/**
 * Parameters for sending typing indicator
 */
export interface SendTypingIndicatorParams {
  /**
   * Recipient phone number (without + prefix)
   * Example: "628123456789" or "14155551234"
   */
  to: string;
  /**
   * Typing state: "composing" only
   * (Fire-and-forget: auto-hides after 15 seconds)
   */
  state: TypingState;
}

/**
 * Typing Indicator API (v24.0)
 * Provides methods to send typing indicators
 */
export class TypingIndicatorAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Send typing indicator (v24.0 format)
   *
   * Sends a typing indicator using the new v24.0 API format.
   * The indicator automatically disappears after 15 seconds.
   * No need to send "stop" - fire-and-forget pattern.
   *
   * @param params - Typing indicator parameters
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/business-messaging/whatsapp-typing-indicators/
   */
  async sendTypingIndicator(
    params: SendTypingIndicatorParams,
  ): Promise<{ success: boolean }> {
    await this.httpClient.post<void>(`${this.phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: params.to,
      type: "typing",
      typing: {
        state: params.state,
      },
    });

    return { success: true };
  }
}
