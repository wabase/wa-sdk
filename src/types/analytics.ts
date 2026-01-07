/**
 * Analytics Types
 * @module types/analytics
 */

/**
 * Analytics granularity/time period
 */
export type AnalyticsGranularity = 'DAILY' | 'MONTHLY';

/**
 * Analytics metric type
 */
export type AnalyticsMetricType =
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'CONVERSATION_START'
  | 'COST';

/**
 * Analytics parameters
 */
export interface AnalyticsParams {
  /**
   * Start date (UNIX timestamp or ISO 8601)
   */
  start: number | string;
  /**
   * End date (UNIX timestamp or ISO 8601)
   */
  end: number | string;
  /**
   * Granularity: DAILY or MONTHLY
   */
  granularity?: AnalyticsGranularity;
  /**
   * Phone numbers to filter (optional)
   */
  phone_numbers?: string[];
  /**
   * Product types to filter (optional)
   */
  product_types?: string[];
  /**
   * Countries to filter (optional)
   */
  country_codes?: string[];
}

/**
 * Analytics data point
 */
export interface AnalyticsDataPoint {
  /**
   * Start timestamp of data point
   */
  start: number;
  /**
   * End timestamp of data point
   */
  end: number;
  /**
   * Metric value
   */
  sent?: number;
  delivered?: number;
  read?: number;
  conversation_start?: number;
  cost?: number;
  /**
   * Analytics category/dimension (if applicable)
   */
  conversation_type?: string;
  conversation_direction?: string;
  country?: string;
}

/**
 * Analytics response
 */
export interface AnalyticsData {
  data: AnalyticsDataPoint[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}

/**
 * Conversation type for analytics
 */
export type ConversationType =
  | 'free_tier'
  | 'regular'
  | 'free_entry_point'
  | 'authentication'
  | 'marketing'
  | 'utility'
  | 'service';

/**
 * Conversation direction
 */
export type ConversationDirection = 'business_initiated' | 'user_initiated';

/**
 * Dimension for conversation analytics
 */
export type ConversationDimension =
  | 'conversation_type'
  | 'conversation_direction'
  | 'country'
  | 'phone';

/**
 * Conversation analytics parameters
 */
export interface ConversationAnalyticsParams {
  /**
   * Start date (UNIX timestamp)
   */
  start: number;

  /**
   * End date (UNIX timestamp)
   */
  end: number;

  /**
   * Granularity: DAILY or MONTHLY
   */
  granularity?: AnalyticsGranularity;

  /**
   * Phone numbers to filter (optional)
   */
  phone_numbers?: string[];

  /**
   * Country codes to filter (ISO 3166 alpha-2, e.g., "US", "BR")
   */
  country_codes?: string[];

  /**
   * Conversation types to filter
   */
  conversation_types?: ConversationType[];

  /**
   * Conversation directions to filter
   */
  conversation_directions?: ConversationDirection[];

  /**
   * Dimensions to group by (max 2)
   */
  dimensions?: ConversationDimension[];

  /**
   * Metric type (default: CONVERSATION)
   */
  metric_type?: 'CONVERSATION' | 'COST';
}

/**
 * Conversation analytics data point
 */
export interface ConversationAnalyticsDataPoint {
  /**
   * Start timestamp
   */
  start: number;

  /**
   * End timestamp
   */
  end: number;

  /**
   * Number of conversations
   */
  conversation?: number;

  /**
   * Cost of conversations
   */
  cost?: number;

  /**
   * Conversation type (if dimension includes conversation_type)
   */
  conversation_type?: ConversationType;

  /**
   * Conversation direction (if dimension includes conversation_direction)
   */
  conversation_direction?: ConversationDirection;

  /**
   * Country code (if dimension includes country)
   */
  country?: string;

  /**
   * Phone number (if dimension includes phone)
   */
  phone?: string;
}

/**
 * Conversation analytics response
 */
export interface ConversationAnalyticsResponse {
  /**
   * Conversation analytics data points
   */
  conversation_analytics: {
    data: ConversationAnalyticsDataPoint[];
    phone_numbers?: string[];
    country_codes?: string[];
    conversation_types?: ConversationType[];
    conversation_directions?: ConversationDirection[];
    granularity?: AnalyticsGranularity;
    metric_type?: string;
  };

  /**
   * WABA ID
   */
  id: string;
}

/**
 * Pricing analytics parameters
 */
export interface PricingAnalyticsParams {
  /**
   * Start date (UNIX timestamp)
   */
  start: number;
  /**
   * End date (UNIX timestamp)
   */
  end: number;
  /**
   * Granularity
   */
  granularity?: AnalyticsGranularity;
  /**
   * Phone numbers to filter
   */
  phone_numbers?: string[];
  /**
   * Country codes to filter
   */
  country_codes?: string[];
  /**
   * Metric types to filter
   */
  metric_types?: string[];
  /**
   * Pricing types to filter
   */
  pricing_types?: string[];
  /**
   * Pricing categories to filter
   */
  pricing_categories?: string[];
  /**
   * Dimensions to group by
   */
  dimensions?: string[];
}

/**
 * Pricing analytics response
 */
export interface PricingAnalyticsResponse {
  /**
   * Pricing data
   */
  data: Array<{
    start: number;
    end: number;
    cost?: number;
    phone?: string;
  }>;
}

/**
 * Template analytics parameters
 */
export interface TemplateAnalyticsParams {
  /**
   * Start date (UNIX timestamp)
   */
  start: number;
  /**
   * End date (UNIX timestamp)
   */
  end: number;
  /**
   * Granularity
   */
  granularity?: AnalyticsGranularity;
  /**
   * Template names to filter
   */
  template_names?: string[];
  /**
   * Template IDs to filter
   */
  template_ids?: string[];
  /**
   * Metric types to filter
   */
  metric_types?: string[];
}

/**
 * Template analytics response
 */
export interface TemplateAnalyticsResponse {
  /**
   * Template data
   */
  data: Array<{
    start: number;
    end: number;
    sent?: number;
    delivered?: number;
    read?: number;
    template_name?: string;
  }>;
}

/**
 * Template group analytics parameters
 */
export interface TemplateGroupAnalyticsParams {
  /**
   * Start date (UNIX timestamp)
   */
  start: number;
  /**
   * End date (UNIX timestamp)
   */
  end: number;
  /**
   * Granularity
   */
  granularity?: AnalyticsGranularity;
  /**
   * Template groups to filter
   */
  template_groups?: string[];
  /**
   * Template group IDs to filter
   */
  template_group_ids?: string[];
  /**
   * Metric types to filter
   */
  metric_types?: string[];
  /**
   * Use WABA timezone for date ranges
   */
  use_waba_timezone?: boolean;
}

/**
 * Template group analytics response
 */
export interface TemplateGroupAnalyticsResponse {
  /**
   * Template group data
   */
  data: Array<{
    start: number;
    end: number;
    sent?: number;
    delivered?: number;
    read?: number;
    template_group?: string;
  }>;
}
