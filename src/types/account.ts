/**
 * Account and Business types for WhatsApp Business API
 */

/**
 * Messaging limit tiers for WhatsApp Business accounts
 * 
 * These tiers represent the maximum number of unique WhatsApp user phone numbers
 * your business can deliver messages to, outside of a customer service window,
 * within a moving 24-hour period.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/messaging-limits
 */
export type MessagingLimitTier =
  | 'TIER_250'
  | 'TIER_2000'
  | 'TIER_10K'
  | 'TIER_100K'
  | 'TIER_UNLIMITED';

/**
 * Response from getting messaging limit
 * 
 * @see https://developers.facebook.com/docs/whatsapp/messaging-limits#via-api
 */
export interface MessagingLimitResponse {
  /**
   * Current messaging limit tier (v24.0+)
   * For v23.0 and older, use messaging_limit_tier field
   */
  whatsapp_business_manager_messaging_limit: MessagingLimitTier;
  
  /**
   * Business phone number ID
   */
  id: string;
}

/**
 * Business category/vertical options for WhatsApp Business profiles
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
 */
export type BusinessVertical =
  | 'AUTO'
  | 'BEAUTY'
  | 'APPAREL'
  | 'EDU'
  | 'ENTERTAIN'
  | 'EVENT_PLAN'
  | 'FINANCE'
  | 'GROCERY'
  | 'GOVT'
  | 'HOTEL'
  | 'HEALTH'
  | 'NONPROFIT'
  | 'PROF_SERVICES'
  | 'RETAIL'
  | 'TRAVEL'
  | 'RESTAURANT'
  | 'OTHER'
  | 'UNDEFINED'
  | 'NOT_A_BIZ';

/**
 * Business profile information
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
 */
export interface BusinessProfile {
  /**
   * Business description (max 139 characters)
   */
  about?: string;
  
  /**
   * Business address (max 256 characters)
   */
  address?: string;
  
  /**
   * Extended business description (max 512 characters)
   */
  description?: string;
  
  /**
   * Business email address (max 128 characters)
   */
  email?: string;
  
  /**
   * Messaging product, always "whatsapp"
   */
  messaging_product: string;
  
  /**
   * Business profile picture URL (read-only)
   */
  profile_picture_url?: string;
  
  /**
   * Business category/industry
   */
  vertical?: BusinessVertical;
  
  /**
   * Business websites (max 2)
   */
  websites?: string[];
}

/**
 * Parameters for updating business profile
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
 */
export interface UpdateBusinessProfileParams {
  /**
   * Messaging product, must be "whatsapp"
   */
  messaging_product: 'whatsapp';
  
  /**
   * Business description (max 139 characters)
   */
  about?: string;
  
  /**
   * Business address (max 256 characters)
   */
  address?: string;
  
  /**
   * Extended business description (max 512 characters)
   */
  description?: string;
  
  /**
   * Business email address (max 128 characters)
   */
  email?: string;
  
  /**
   * Media handle ID for profile picture
   */
  profile_picture_handle?: string;
  
  /**
   * Business category/industry
   */
  vertical?: BusinessVertical;
  
  /**
   * Business websites (max 2)
   */
  websites?: string[];
}

/**
 * Response from getting business profile
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
 */
export interface BusinessProfileResponse {
  /**
   * Array containing business profile data
   */
  data: BusinessProfile[];
}

/**
 * Response from updating business profile
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
 */
export interface UpdateBusinessProfileResponse {
  /**
   * Success status
   */
  success: boolean;
}

/**
 * Conversational command structure
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components
 */
export interface ConversationalCommand {
  /**
   * Command name (max 32 characters)
   */
  commandName: string;
  /**
   * Command description (max 256 characters)
   */
  commandDescription: string;
}

/**
 * Conversational automation configuration (API response format)
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components
 */
export interface ConversationalAutomationConfig {
  /**
   * Enable welcome message notifications
   */
  enable_welcome_message?: boolean;
  /**
   * Ice breaker prompts (max 4, each max 80 chars)
   */
  prompts?: string[];
  /**
   * Slash commands (max 30) - API returns snake_case
   */
  commands?: Array<{
    command_name: string;
    command_description: string;
  }>;
}

/**
 * Parameters for configuring conversational automation
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components
 */
export interface ConfigureConversationalAutomationParams {
  /**
   * Enable welcome message notifications
   */
  enableWelcomeMessage?: boolean;
  /**
   * Ice breaker prompts (max 4, each max 80 chars)
   */
  prompts?: string[];
  /**
   * Slash commands (max 30)
   */
  commands?: ConversationalCommand[];
}

/**
 * Response from getting conversational automation configuration
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components
 */
export interface ConversationalAutomationResponse {
  /**
   * Current conversational automation configuration
   */
  conversational_automation: ConversationalAutomationConfig;
  /**
   * Phone number ID
   */
  id: string;
}

/**
 * Response from blocking a phone number
 */
export interface BlockResponse {
  /**
   * Success status
   */
  success: boolean;
}

/**
 * Calling settings for WhatsApp Business Phone Number
 */
export interface CallingSettings {
  /**
   * Whether calling is enabled
   */
  is_enabled: boolean;
}

/**
 * Parameters for updating calling settings
 */
export interface UpdateCallingSettingsParams {
  /**
   * Whether to enable calling
   */
  is_enabled: boolean;
}

/**
 * Compliance information for WhatsApp Business Phone Number
 */
export interface ComplianceInfo {
  /**
   * Compliance data
   */
  data?: Array<{
    compliance_category: string;
    compliance_status: string;
  }>;
}
