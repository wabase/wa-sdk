/**
 * Flow Messages API Types
 * @see https://developers.facebook.com/docs/whatsapp/flows
 */

/**
 * Flow status enum
 */
export type FlowStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';

/**
 * Flow category enum
 */
export type FlowCategory =
  | 'SIGN_UP'
  | 'SIGN_IN'
  | 'APPOINTMENT_BOOKING'
  | 'LEAD_GENERATION'
  | 'CONTACT_US'
  | 'CUSTOMER_SUPPORT'
  | 'SURVEY'
  | 'OTHER';

/**
 * Flow asset type
 */
export type FlowAssetType = 'FLOW_JSON';

/**
 * Analytics metric name
 */
export type FlowMetricName =
  | 'ENDPOINT_REQUEST_COUNT'
  | 'ENDPOINT_REQUEST_ERROR'
  | 'ENDPOINT_REQUEST_ERROR_RATE'
  | 'ENDPOINT_REQUEST_LATENCY_SECONDS_CEIL'
  | 'ENDPOINT_AVAILABILITY';

/**
 * Analytics granularity
 */
export type FlowMetricGranularity = 'DAY' | 'HALF_HOUR' | 'DAILY' | 'LIFETIME';

/**
 * Flow validation error
 */
export interface FlowValidationError {
  error: string;
  error_type: string;
  message: string;
  line_start: number;
  line_end: number;
  column_start: number;
  column_end: number;
}

/**
 * Flow preview details
 */
export interface FlowPreview {
  preview_url: string;
  expires_at: string;
}

/**
 * Flow health status entity
 */
export interface FlowHealthEntity {
  entity_type: 'FLOW' | 'WABA' | 'BUSINESS' | 'APP';
  id: string;
  can_send_message: 'AVAILABLE' | 'BLOCKED' | 'LIMITED';
  errors?: Array<{
    error_code: number;
    error_description: string;
    possible_solution: string;
  }>;
}

/**
 * Flow health status
 */
export interface FlowHealthStatus {
  can_send_message: 'AVAILABLE' | 'BLOCKED' | 'LIMITED';
  entities: FlowHealthEntity[];
}

/**
 * WABA details in flow
 */
export interface FlowWABA {
  id: string;
  name: string;
  timezone_id: string;
  business_type: string;
  message_template_namespace: string;
}

/**
 * Application details in flow
 */
export interface FlowApplication {
  id: string;
  name: string;
  link: string;
}

/**
 * Flow details
 */
export interface FlowDetails {
  id: string;
  name: string;
  status: FlowStatus;
  categories: FlowCategory[];
  validation_errors: FlowValidationError[];
  json_version?: string;
  data_api_version?: string;
  data_channel_uri?: string;
  preview?: FlowPreview;
  health_status?: FlowHealthStatus;
  whatsapp_business_account?: FlowWABA;
  application?: FlowApplication;
}

/**
 * Create flow parameters
 */
export interface CreateFlowParams {
  name: string;
  categories: FlowCategory[];
  clone_flow_id?: string;
  endpoint_uri?: string;
}

/**
 * Update flow metadata parameters
 */
export interface UpdateFlowParams {
  name?: string;
  categories?: FlowCategory[];
  endpoint_uri?: string;
}

/**
 * Migrate flows parameters
 */
export interface MigrateFlowsParams {
  source_waba_id: string;
  source_flow_names?: string[];
}

/**
 * Flow migration result
 */
export interface FlowMigrationResult {
  migrated_flows: Array<{
    source_id: string;
    source_name: string;
    migrated_id: string;
  }>;
  failed_flows: Array<{
    source_name: string;
    error_code: string;
    error_message: string;
  }>;
}

/**
 * Flow list response
 */
export interface FlowListResponse {
  data: FlowDetails[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

/**
 * Flow asset details
 */
export interface FlowAsset {
  name: string;
  asset_type: FlowAssetType;
  download_url: string;
}

/**
 * Flow assets list response
 */
export interface FlowAssetsResponse {
  data: FlowAsset[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

/**
 * Upload flow JSON response
 */
export interface UploadFlowJSONResponse {
  success: boolean;
  validation_errors?: FlowValidationError[];
}

/**
 * Flow create response
 */
export interface FlowCreateResponse {
  id: string;
}

/**
 * Flow success response
 */
export interface FlowSuccessResponse {
  success: boolean;
}

/**
 * Analytics metric data point
 */
export interface FlowMetricDataPoint {
  timestamp: string;
  data: Array<{
    key: string;
    value: number | string;
  }>;
}

/**
 * Flow analytics response
 */
export interface FlowAnalyticsResponse {
  id: string;
  metric: {
    granularity: FlowMetricGranularity;
    name: FlowMetricName;
    data_points: FlowMetricDataPoint[];
  };
}

/**
 * Flow analytics query parameters
 */
export interface FlowAnalyticsParams {
  metric_name: FlowMetricName;
  granularity: FlowMetricGranularity;
  since: string; // ISO 8601 date
  until: string; // ISO 8601 date
}

/**
 * Flow message action type
 */
export type FlowAction = 'navigate' | 'data_exchange';

/**
 * Flow mode
 */
export type FlowMode = 'draft' | 'published';

/**
 * Flow action payload
 */
export interface FlowActionPayload {
  screen: string;
  data?: Record<string, unknown>;
}

/**
 * Send flow message parameters
 */
export interface SendFlowParams {
  to: string;
  header?: {
    type: 'text';
    text: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  flow_id?: string;
  flow_name?: string;
  flow_cta: string;
  flow_action?: FlowAction;
  flow_action_payload?: FlowActionPayload;
  flow_token?: string;
  mode?: FlowMode;
  flow_message_version?: '3';
}

/**
 * Send flow template button parameters
 */
export interface FlowTemplateButton {
  type: 'FLOW';
  text: string;
  flow_id?: string;
  flow_name?: string;
  flow_json?: string;
  flow_action: FlowAction;
  navigate_screen: string;
}

/**
 * Create flow template parameters
 */
export interface CreateFlowTemplateParams {
  name: string;
  language: string;
  category: string;
  components: Array<{
    type: 'body' | 'BUTTONS';
    text?: string;
    buttons?: FlowTemplateButton[];
  }>;
}

/**
 * Send flow template parameters
 */
export interface SendFlowTemplateParams {
  to: string;
  template_name: string;
  language_code: string;
  flow_token?: string;
  flow_action_data?: Record<string, unknown>;
}

/**
 * Flow deprecation response
 */
export interface FlowDeprecationResponse {
  /**
   * Success status
   */
  success: boolean;
  /**
   * Flow ID
   */
  flow_id: string;
  /**
   * Deprecated timestamp
   */
  deprecated_at: number;
}
