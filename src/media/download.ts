/**
 * Media download functionality
 */

import type { HTTPClient } from '../client/http.js';
import type {
  MediaDownloadResponse,
  MediaUrlResponse,
  SuccessResponse,
} from '../types/responses.js';

/**
 * Get media URL from WhatsApp
 *
 * @param client - HTTP client instance
 * @param mediaId - Media ID to get URL for
 * @returns Media URL response with metadata
 */
export async function getMediaUrl(
  client: HTTPClient,
  mediaId: string
): Promise<MediaUrlResponse> {
  interface MediaUrlApiResponse {
    url: string;
    mime_type: string;
    sha256: string;
    file_size: number;
    id: string;
    messaging_product: string;
  }

  const response = await client.get<MediaUrlApiResponse>(mediaId);

  return {
    url: response.url,
    mimeType: response.mime_type,
    sha256: response.sha256,
    fileSize: response.file_size,
  };
}

/**
 * Download media from WhatsApp
 *
 * @param client - HTTP client instance
 * @param mediaId - Media ID to download
 * @returns Media download response with file buffer and metadata
 */
export async function downloadMedia(
  client: HTTPClient,
  mediaId: string
): Promise<MediaDownloadResponse> {
  // First, get the media URL
  const mediaInfo = await getMediaUrl(client, mediaId);

  // Download the file from the URL
  // Note: The URL requires the same access token
  const accessToken = client['accessToken'];
  const response = await fetch(mediaInfo.url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Media download failed: ${response.statusText}`);
  }

  // Get the file buffer
  const arrayBuffer = await response.arrayBuffer();

  // Check if we're in Node.js or browser environment
  let buffer: Buffer | Blob;
  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    buffer = Buffer.from(arrayBuffer);
  } else {
    // Browser environment
    buffer = new Blob([arrayBuffer], { type: mediaInfo.mimeType });
  }

  return {
    buffer,
    mimeType: mediaInfo.mimeType,
    sha256: mediaInfo.sha256,
    fileSize: mediaInfo.fileSize,
  };
}

/**
 * Delete media from WhatsApp
 *
 * @param client - HTTP client instance
 * @param mediaId - Media ID to delete
 * @returns Success response
 */
export async function deleteMedia(
  client: HTTPClient,
  mediaId: string
): Promise<SuccessResponse> {
  return client.delete<SuccessResponse>(mediaId);
}
