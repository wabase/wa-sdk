/**
 * Flow Deprecation Method
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#deprecate-flow
 */

import type { HTTPClient } from '../client/http.js';
import type { FlowDeprecationResponse } from '../types/flows.js';

/**
 * Deprecate a published flow
 * 
 * Marks a published flow as deprecated. Deprecated flows can no longer
 * be used to send messages, but existing conversations using the flow
 * will continue to work. This is useful for phasing out old flows.
 * 
 * @param client - HTTP client instance
 * @param flowId - Flow ID to deprecate
 * @returns Deprecation confirmation with timestamp
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#deprecate-flow
 * 
 * @example
 * ```typescript
 * const result = await deprecateFlow(client, '1234567890');
 * console.log(`Flow deprecated at: ${new Date(result.deprecated_at)}`);
 * ```
 */
export async function deprecateFlow(
  client: HTTPClient,
  flowId: string
): Promise<FlowDeprecationResponse> {
  const response = await client.post<{ success: boolean }>(
    `/${flowId}/deprecate`,
    {}
  );
  
  return {
    success: response.success,
    flow_id: flowId,
    deprecated_at: Date.now(),
  } satisfies FlowDeprecationResponse;
}
