/**
 * Analytics
 * Retrieve analytics data for WhatsApp Business Account
 * @module analytics
 */

import type { HTTPClient } from "../client/http.js";
import type {
  AnalyticsParams,
  AnalyticsData,
  ConversationAnalyticsParams,
  ConversationAnalyticsResponse,
  PricingAnalyticsParams,
  PricingAnalyticsResponse,
  TemplateAnalyticsParams,
  TemplateAnalyticsResponse,
  TemplateGroupAnalyticsParams,
  TemplateGroupAnalyticsResponse,
} from "../types/analytics.js";
import { ValidationError } from "../types/errors.js";

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
    params: ConversationAnalyticsParams,
  ): Promise<ConversationAnalyticsResponse> {
    // Build the fields parameter for Graph API
    const fieldsParams: string[] = [];

    fieldsParams.push(`start(${params.start})`);
    fieldsParams.push(`end(${params.end})`);

    if (params.granularity) {
      fieldsParams.push(`granularity(${params.granularity})`);
    }

    if (params.phone_numbers && params.phone_numbers.length > 0) {
      fieldsParams.push(
        `phone_numbers([${params.phone_numbers.map((p) => `"${p}"`).join(",")}])`,
      );
    } else {
      fieldsParams.push("phone_numbers([])");
    }

    if (params.country_codes && params.country_codes.length > 0) {
      fieldsParams.push(
        `country_codes([${params.country_codes.map((c) => `"${c}"`).join(",")}])`,
      );
    }

    if (params.conversation_types && params.conversation_types.length > 0) {
      fieldsParams.push(
        `conversation_types([${params.conversation_types.map((t) => `"${t}"`).join(",")}])`,
      );
    }

    if (
      params.conversation_directions &&
      params.conversation_directions.length > 0
    ) {
      fieldsParams.push(
        `conversation_directions([${params.conversation_directions.map((d) => `"${d}"`).join(",")}])`,
      );
    }

    if (params.dimensions && params.dimensions.length > 0) {
      fieldsParams.push(
        `dimensions([${params.dimensions.map((d) => `"${d}"`).join(",")}])`,
      );
    }

    if (params.metric_type) {
      fieldsParams.push(`metric_type(${params.metric_type})`);
    }

    const fields = `conversation_analytics.${fieldsParams.join(".")}`;
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

    queryParams.append("start", params.start.toString());
    queryParams.append("end", params.end.toString());

    if (params.granularity) {
      queryParams.append("granularity", params.granularity);
    }

    if (params.phone_numbers) {
      queryParams.append("phone_numbers", JSON.stringify(params.phone_numbers));
    }

    return this.httpClient.get<AnalyticsData>(
      `${this.wabaId}/analytics?${queryParams.toString()}`,
    );
  }

  /**
   * Get pricing analytics
   *
   * Get pricing breakdowns for messages delivered within a specified date range.
   * Includes volume tier information for cost tracking.
   *
   * @param params - Pricing analytics parameters
   * @returns Pricing analytics data with volume tiers
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics#pricing-analytics
   *
   * @example
   * ```typescript
   * const pricing = await client.analytics.getPricingAnalytics({
   *   start: 1748761200,
   *   end: 1749687703,
   *   granularity: 'DAILY',
   *   dimensions: ['PRICING_CATEGORY', 'TIER', 'COUNTRY']
   * });
   * ```
   */
  async getPricingAnalytics(
    params: PricingAnalyticsParams,
  ): Promise<PricingAnalyticsResponse> {
    // Build the fields parameter for Graph API
    const fieldsParams: string[] = [];

    fieldsParams.push(`start(${params.start})`);
    fieldsParams.push(`end(${params.end})`);
    fieldsParams.push(`granularity(${params.granularity})`);

    if (params.phone_numbers && params.phone_numbers.length > 0) {
      fieldsParams.push(
        `phone_numbers([${params.phone_numbers.map((p) => `"${p}"`).join(",")}])`,
      );
    }

    if (params.country_codes && params.country_codes.length > 0) {
      fieldsParams.push(
        `country_codes([${params.country_codes.map((c) => `"${c}"`).join(",")}])`,
      );
    }

    if (params.metric_types && params.metric_types.length > 0) {
      fieldsParams.push(
        `metric_types([${params.metric_types.map((m) => `"${m}"`).join(",")}])`,
      );
    }

    if (params.pricing_types && params.pricing_types.length > 0) {
      fieldsParams.push(
        `pricing_types([${params.pricing_types.map((t) => `"${t}"`).join(",")}])`,
      );
    }

    if (params.pricing_categories && params.pricing_categories.length > 0) {
      fieldsParams.push(
        `pricing_categories([${params.pricing_categories.map((c) => `"${c}"`).join(",")}])`,
      );
    }

    if (params.dimensions && params.dimensions.length > 0) {
      fieldsParams.push(
        `dimensions([${params.dimensions.map((d) => `"${d}"`).join(",")}])`,
      );
    }

    const fields = `pricing_analytics.${fieldsParams.join(".")}`;
    const endpoint = `${this.wabaId}?fields=${encodeURIComponent(fields)}`;

    return this.httpClient.get<PricingAnalyticsResponse>(endpoint);
  }

  /**
   * Get template analytics
   *
   * Track individual template performance including sent, delivered, read, and clicked metrics.
   * Requires template analytics to be enabled on WABA.
   *
   * @param params - Template analytics parameters
   * @returns Template analytics data with click and cost metrics
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics#template-analytics
   *
   * @example
   * ```typescript
   * const templates = await client.analytics.getTemplateAnalytics({
   *   start: 1656661480,
   *   end: 1674859480,
   *   granularity: 'DAILY',
   *   template_ids: ['template_id_1', 'template_id_2']
   * });
   * ```
   */
  async getTemplateAnalytics(
    params: TemplateAnalyticsParams,
  ): Promise<TemplateAnalyticsResponse> {
    // Validate template_ids max 10
    if (params.template_ids && params.template_ids.length > 10) {
      throw new ValidationError(
        'Maximum 10 template IDs allowed',
        'template_ids',
      );
    }

    // Build the fields parameter for Graph API
    const fieldsParams: string[] = [];

    fieldsParams.push(`start(${params.start})`);
    fieldsParams.push(`end(${params.end})`);
    fieldsParams.push(`granularity(${params.granularity})`);

    if (params.template_ids && params.template_ids.length > 0) {
      fieldsParams.push(
        `template_ids([${params.template_ids.map((id) => `"${id}"`).join(",")}])`,
      );
    }

    if (params.metric_types && params.metric_types.length > 0) {
      fieldsParams.push(
        `metric_types([${params.metric_types.map((m) => `"${m}"`).join(",")}])`,
      );
    }

    const fields = `template_analytics.${fieldsParams.join(".")}`;
    const endpoint = `${this.wabaId}?fields=${encodeURIComponent(fields)}`;

    return this.httpClient.get<TemplateAnalyticsResponse>(endpoint);
  }

  /**
   * Get template group analytics
   *
   * Get aggregated metrics for template groups including sent, delivered, read, and clicked metrics.
   * Note: This endpoint uses direct query parameters, not Graph API fields syntax.
   *
   * @param params - Template group analytics parameters
   * @returns Template group analytics data with aggregated metrics
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics#template-group-analytics
   *
   * @example
   * ```typescript
   * const groups = await client.analytics.getTemplateGroupAnalytics({
   *   start: '2024-01-01',
   *   end: '2024-01-31',
   *   granularity: 'daily',
   *   template_group_ids: ['group_id_1'],
   *   use_waba_timezone: true
   * });
   * ```
   */
  async getTemplateGroupAnalytics(
    params: TemplateGroupAnalyticsParams,
  ): Promise<TemplateGroupAnalyticsResponse> {
    // Validate template_group_ids
    if (!params.template_group_ids || params.template_group_ids.length === 0) {
      throw new ValidationError(
        'template_group_ids is required',
        'template_group_ids',
      );
    }

    if (params.template_group_ids.length > 10) {
      throw new ValidationError(
        'Maximum 10 template group IDs allowed',
        'template_group_ids',
      );
    }

    // Build query parameters (not Graph API fields!)
    const queryParams = new URLSearchParams();

    queryParams.append('granularity', params.granularity ?? 'DAILY');
    queryParams.append('start', params.start.toString());
    queryParams.append('end', params.end.toString());
    queryParams.append('template_group_ids', JSON.stringify(params.template_group_ids));

    if (params.metric_types && params.metric_types.length > 0) {
      queryParams.append('metric_types', params.metric_types.join(','));
    }

    if (params.use_waba_timezone !== undefined) {
      queryParams.append('use_waba_timezone', params.use_waba_timezone.toString());
    }

    return this.httpClient.get<TemplateGroupAnalyticsResponse>(
      `${this.wabaId}/template_group_analytics?${queryParams.toString()}`,
    );
  }
}
