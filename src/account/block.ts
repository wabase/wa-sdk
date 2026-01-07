/**
 * Block/Unblock Phone Numbers API
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#block
 */

import type { HTTPClient } from '../client/http.js';
import type { BlockResponse } from '../types/account.js';

/**
 * Block a phone number from contacting this business number
 * 
 * Prevents the specified phone number from sending messages
 * to your business. Blocked numbers can be unblocked later.
 * 
 * @param client - HTTP client instance
 * @param phoneNumberId - Your business phone number ID
 * @param phoneNumber - Phone number to block (E.164 format recommended)
 * @returns Success confirmation
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#block
 * 
 * @example
 * ```typescript
 * await blockPhoneNumber(client, '1234567890', '+15551234567');
 * ```
 */
export async function blockPhoneNumber(
  client: HTTPClient,
  phoneNumberId: string,
  phoneNumber: string
): Promise<BlockResponse> {
  return client.post<BlockResponse>(`/${phoneNumberId}/block`, {
    phone_number: phoneNumber,
  });
}

/**
 * Unblock a previously blocked phone number
 * 
 * Allows the specified phone number to send messages to your
 * business again after being blocked.
 * 
 * @param client - HTTP client instance
 * @param phoneNumberId - Your business phone number ID
 * @param phoneNumber - Phone number to unblock (E.164 format recommended)
 * @returns Success confirmation
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#unblock
 * 
 * @example
 * ```typescript
 * await unblockPhoneNumber(client, '1234567890', '+15551234567');
 * ```
 */
export async function unblockPhoneNumber(
  client: HTTPClient,
  phoneNumberId: string,
  phoneNumber: string
): Promise<BlockResponse> {
  return client.post<BlockResponse>(`/${phoneNumberId}/unblock`, {
    phone_number: phoneNumber,
  });
}
