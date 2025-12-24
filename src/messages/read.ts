/**
 * Mark message as read functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { SuccessResponse } from '../types/responses.js';

/**
 * Mark a message as read
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID
 * @param messageId - Message ID to mark as read
 * @returns Success response
 */
export async function markAsRead(
  client: HTTPClient,
  phoneNumberId: string,
  messageId: string
): Promise<SuccessResponse> {
  // Build request payload
  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  // Send request
  await client.post(`${phoneNumberId}/messages`, payload);

  return { success: true };
}

/**
 * Mark a message as read with optional typing indicator
 * This follows the WhatsApp Business API pattern where typing_indicator
 * can be combined with mark-as-read in a single request.
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID
 * @param messageId - Message ID to mark as read
 * @param showTyping - Whether to show typing indicator (auto-dismisses after 25s or on response)
 * @returns Success response
 */
export async function markAsReadWithTyping(
  client: HTTPClient,
  phoneNumberId: string,
  messageId: string,
  showTyping: boolean = false
): Promise<SuccessResponse> {
  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  // Add typing indicator if requested
  if (showTyping) {
    payload.typing_indicator = {
      type: 'text',
    };
  }

  // Send request
  await client.post(`${phoneNumberId}/messages`, payload);

  return { success: true };
}
