import type { WhatsAppClient } from "../client/index.js";
import type { WebhookMedia } from "../types/webhooks.js";

/**
 * Get media download URL with automatic fallback
 * 
 * @param media - Media object from webhook
 * @param client - WhatsApp client instance
 * @returns Download URL for the media
 * 
 * @remarks
 * - v23.0+: If `media.url` is present, returns it directly (no API call)
 * - v20.0-v22.0: If `media.url` is absent, fetches URL via API call
 * 
 * @example
 * ```typescript
 * const image = webhook.entry[0].changes[0].value.messages?.[0].image;
 * if (image) {
 *   const url = await getMediaUrl(image, client);
 *   console.log('Download from:', url);
 * }
 * ```
 */
export async function getMediaUrl(
  media: WebhookMedia,
  client: WhatsAppClient
): Promise<string> {
  // Try webhook URL first (v23.0+ optimization)
  if (media.url && media.url.trim()) {
    return media.url;
  }

  // Fallback to API call (v20.0-v22.0 compatibility)
  const response = await client.media.getUrl(media.id);
  return response.url;
}
