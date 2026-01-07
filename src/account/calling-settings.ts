/**
 * Calling Settings API
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#calling-settings
 */

import type { HTTPClient } from '../client/http.js';
import type { CallingSettings, UpdateCallingSettingsParams } from '../types/account.js';

/**
 * Get voice calling settings for a phone number
 * 
 * Retrieves the current calling configuration including
 * whether calling is enabled and webhook URL.
 * 
 * @param client - HTTP client instance
 * @param phoneNumberId - Business phone number ID
 * @returns Current calling settings
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#calling-settings
 * 
 * @example
 * ```typescript
 * const settings = await getCallingSettings(client, '1234567890');
 * console.log(`Calling enabled: ${settings.calling_enabled}`);
 * ```
 */
export async function getCallingSettings(
  client: HTTPClient,
  phoneNumberId: string
): Promise<CallingSettings> {
  return client.get<CallingSettings>(`/${phoneNumberId}/calling_settings`);
}

/**
 * Update voice calling settings for a phone number
 * 
 * Configure whether voice calling is enabled and set
 * the webhook URL for call events.
 * 
 * @param client - HTTP client instance
 * @param phoneNumberId - Business phone number ID
 * @param params - Settings to update (partial updates allowed)
 * @returns Updated calling settings
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#calling-settings
 * 
 * @example
 * ```typescript
 * await updateCallingSettings(client, '1234567890', {
 *   calling_enabled: true,
 *   calling_webhook_url: 'https://your-webhook.com/calls'
 * });
 * ```
 */
export async function updateCallingSettings(
  client: HTTPClient,
  phoneNumberId: string,
  params: UpdateCallingSettingsParams
): Promise<CallingSettings> {
  return client.post<CallingSettings>(
    `/${phoneNumberId}/calling_settings`,
    params
  );
}
