/**
 * Analytics
 * Retrieve analytics data for WhatsApp Business Account
 * @module analytics
 */

import type { HTTPClient } from '../client/http.js';
import type {
  AnalyticsParams,
  AnalyticsData,
  ConversationAnalyticsParams,
  ConversationAnalyticsResponse,
} from '../types/analytics.js';

/**
 * Analytics API
 * Provides methods to retrieve conversation and message analytics
 */
export class AnalyticsAPI {
  constructor(
    private httpClient: HTTPClient,
    private wabaId: string,
  ) {}

  /**
   * Get conversation analytics (legacy method)
   * 
   * @deprecated Use getConversationAnalyticsV2() for more detailed analytics
   * 
   * Retrieves conversation analytics including conversation starts,
   * conversation types, and conversation costs.
   * 
   * @param params - Analytics query parameters
   * @returns Conversation analytics data
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics
   */
  async getConversationAnalytics(params: AnalyticsParams): Promise<AnalyticsData> {
    const queryParams = new URLSearchParams();

    queryParams.append('start', params.start.toString());
    queryParams.append('end', params.end.toString());

    if (params.granularity) {
      queryParams.append('granularity', params.granularity);
    }

    if (params.phone_numbers) {
      queryParams.append('phone_numbers', JSON.stringify(params.phone_numbers));
    }

    if (params.product_types) {
      queryParams.append('product_types', JSON.stringify(params.product_types));
    }

    if (params.country_codes) {
      queryParams.append('country_codes', JSON.stringify(params.country_codes));
    }

    return this.httpClient.get<AnalyticsData>(`${this.wabaId}/conversation_analytics?${queryParams.toString()}`);
  }

  /**
   * Get detailed conversation analytics with dimensions
   * 
   * Retrieves conversation analytics with support for:
   * - Multiple dimensions (conversation_type, conversation_direction, country, phone)
   * - Conversation types filtering
   * - Conversation directions filtering
   * - Granular breakdowns by type and direction
   * 
   * @param params - Conversation analytics parameters
   * @returns Detailed conversation analytics
   * 
   * @example
   * ```typescript
   * // Get analytics grouped by conversation type and direction
   * const analytics = await client.analytics.getConversationAnalyticsV2({
   *   start: 1656661480,
   *   end: 1674859480,
   *   granularity: 'MONTHLY',
   *   conversation_directions: ['business_initiated'],
   *   dimensions: ['conversation_type', 'conversation_direction']
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics
   */
  async getConversationAnalyticsV2(
    params: ConversationAnalyticsParams
  ): Promise<ConversationAnalyticsResponse> {
    // Build the fields parameter for Graph API
    const fieldsParams: string[] = [];

    fieldsParams.push(`start(${params.start})`);
    fieldsParams.push(`end(${params.end})`);

    if (params.granularity) {
      fieldsParams.push(`granularity(${params.granularity})`);
    }

    if (params.phone_numbers && params.phone_numbers.length > 0) {
      fieldsParams.push(`phone_numbers([${params.phone_numbers.map(p => `"${p}"`).join(',')}])`);
    } else {
      fieldsParams.push('phone_numbers([])');
    }

    if (params.country_codes && params.country_codes.length > 0) {
      fieldsParams.push(`country_codes([${params.country_codes.map(c => `"${c}"`).join(',')}])`);
    }

    if (params.conversation_types && params.conversation_types.length > 0) {
      fieldsParams.push(
        `conversation_types([${params.conversation_types.map(t => `"${t}"`).join(',')}])`
      );
    }

    if (params.conversation_directions && params.conversation_directions.length > 0) {
      fieldsParams.push(
        `conversation_directions([${params.conversation_directions.map(d => `"${d}"`).join(',')}])`
      );
    }

    if (params.dimensions && params.dimensions.length > 0) {
      fieldsParams.push(`dimensions([${params.dimensions.map(d => `"${d}"`).join(',')}])`);
    }

    if (params.metric_type) {
      fieldsParams.push(`metric_type(${params.metric_type})`);
    }

    const fields = `conversation_analytics.${fieldsParams.join('.')}`;
    const endpoint = `${this.wabaId}?fields=${encodeURIComponent(fields)}`;

    return this.httpClient.get<ConversationAnalyticsResponse>(endpoint);
  }

  /**
   * Get message analytics
   * 
   * Retrieves message-level analytics including messages sent,
   * delivered, and read.
   * 
   * @param params - Analytics query parameters
   * @returns Message analytics data
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics
   */
  async getMessageAnalytics(params: AnalyticsParams): Promise<AnalyticsData> {
    const queryParams = new URLSearchParams();

    queryParams.append('start', params.start.toString());
    queryParams.append('end', params.end.toString());

    if (params.granularity) {
      queryParams.append('granularity', params.granularity);
    }

    if (params.phone_numbers) {
      queryParams.append('phone_numbers', JSON.stringify(params.phone_numbers));
    }

    return this.httpClient.get<AnalyticsData>(`${this.wabaId}/analytics?${queryParams.toString()}`);
  }

  /**
   * Alias for getConversationAnalytics - Get analytics data
   * @param params - Analytics query parameters
   * @returns Analytics data
   */
  async getAnalytics(params: AnalyticsParams): Promise<AnalyticsData> {
    return this.getConversationAnalytics(params);
  }
}
