/**
 * Webhook types for receiving events from WhatsApp Cloud API
 * Based on: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/reference
 */

// ============================================================================
// Common Types
// ============================================================================

export interface WebhookMetadata {
  displayPhoneNumber: string;
  phoneNumberId: string;
}

export interface WebhookContact {
  profile: {
    name: string;
  };
  waId: string;
  identityKeyHash?: string;
}

export interface WebhookMedia {
  id: string;
  mimeType: string;
  sha256?: string;
  caption?: string;
  filename?: string;
}

export interface WebhookLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WebhookInteractive {
  type: 'button_reply' | 'list_reply';
  buttonReply?: {
    id: string;
    title: string;
  };
  listReply?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface WebhookError {
  code: number;
  title: string;
  message?: string;
  errorData?: {
    details: string;
  };
}

// ============================================================================
// Messages Webhook (field: "messages")
// ============================================================================

export interface WebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type:
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'sticker'
    | 'location'
    | 'contacts'
    | 'button'
    | 'interactive'
    | 'order'
    | 'system'
    | 'reaction'
    | 'unsupported'
    | 'unknown';
  context?: {
    from: string;
    id: string;
  };
  errors?: WebhookError[];
  text?: { body: string };
  image?: WebhookMedia;
  video?: WebhookMedia;
  audio?: WebhookMedia;
  document?: WebhookMedia;
  sticker?: WebhookMedia;
  location?: WebhookLocation;
  contacts?: WebhookContact[];
  button?: { text: string; payload: string };
  interactive?: WebhookInteractive;
  reaction?: { messageId: string; emoji: string };
  unsupported?: { type: string };
}

export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipientId: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    pricingModel: string;
    billable: boolean;
    category: string;
  };
  errors?: WebhookError[];
}

export interface MessagesWebhookValue {
  messagingProduct: 'whatsapp';
  metadata: WebhookMetadata;
  contacts?: WebhookContact[];
  messages?: WebhookMessage[];
  statuses?: WebhookStatus[];
  errors?: WebhookError[];
}

// ============================================================================
// Account Alerts Webhook (field: "account_alerts")
// ============================================================================

export type AccountAlertType =
  | 'INCREASED_CAPABILITIES_ELIGIBILITY_DEFERRED'
  | 'INCREASED_CAPABILITIES_ELIGIBILITY_FAILED'
  | 'INCREASED_CAPABILITIES_ELIGIBILITY_NEED_MORE_INFO'
  | 'OBA_APPROVED'
  | 'OBA_REJECTED'
  | 'PROFILE_PICTURE_LOST';

export type AccountAlertSeverity = 'CRITICAL' | 'INFORMATIONAL' | 'WARNING';
export type AccountAlertStatus = 'ACTIVE' | 'NONE';
export type AccountAlertEntityType = 'BUSINESS' | 'PHONE_NUMBER' | 'CURRENT_STATUS_ID';

export interface AccountAlertsWebhookValue {
  entityType: AccountAlertEntityType;
  entityId: string;
  alertInfo: {
    alertSeverity: AccountAlertSeverity;
    alertStatus: AccountAlertStatus;
    alertType: AccountAlertType;
    alertDescription: string;
  };
}

// ============================================================================
// Account Review Update Webhook (field: "account_review_update")
// ============================================================================

export type AccountReviewDecision = 'APPROVED' | 'REJECTED' | 'PENDING' | 'DEFERRED';

export interface AccountReviewUpdateWebhookValue {
  decision: AccountReviewDecision;
}

// ============================================================================
// Account Update Webhook (field: "account_update")
// ============================================================================

export type AccountUpdateEvent =
  | 'ACCOUNT_DELETED'
  | 'ACCOUNT_VIOLATION'
  | 'AD_ACCOUNT_LINKED'
  | 'AUTH_INTL_PRICE_ELIGIBILITY_UPDATE'
  | 'DISABLED_UPDATE'
  | 'MM_LITE_TERMS_SIGNED'
  | 'PARTNER_ADDED'
  | 'PARTNER_APP_INSTALLED'
  | 'PARTNER_APP_UNINSTALLED'
  | 'PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE'
  | 'BUSINESS_PRIMARY_LOCATION_COUNTRY_UPDATE'
  | 'VOLUME_BASED_PRICING_TIER_UPDATE';

export type ViolationType =
  | 'ADULT'
  | 'ILLEGAL'
  | 'SPAM'
  | 'SCAM'
  | 'PHISHING'
  | 'MALWARE'
  | 'HARASSMENT'
  | 'IMPERSONATION'
  | 'OTHER';

export type WabaBanState = 'SCHEDULE_FOR_DISABLE' | 'DISABLE' | 'REINSTATE';
export type CertificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

export interface AccountUpdateWebhookValue {
  event: AccountUpdateEvent;
  violationInfo?: {
    violationType: ViolationType;
  };
  banInfo?: {
    wabaBanState: WabaBanState;
    wabaBanDate?: string;
  };
  wabaInfo?: {
    wabaId: string;
    ownerBusinessId: string;
    adAccountLinked?: string;
    partnerAppId?: string;
    solutionId?: string;
    solutionPartnerBusinessIds?: string[];
  };
  authInternationalRateEligibility?: {
    startTime: number;
    exceptionCountries?: Array<{
      countryCode: string;
      startTime: number;
    }>;
  };
  partnerClientCertificationInfo?: {
    clientBusinessId: string;
    status: CertificationStatus;
    rejectionReasons?: string[];
  };
  country?: string;
  volumeTierInfo?: {
    tierUpdateTime: number;
    pricingCategory: string;
    tier: string;
    effectiveMonth: string;
    region: string;
  };
}

// ============================================================================
// Business Capability Update Webhook (field: "business_capability_update")
// ============================================================================

export type MaxPhoneNumbersPerBusiness = 'TIER_10' | 'TIER_50' | 'TIER_100' | 'TIER_200' | 'TIER_500' | 'UNLIMITED';
export type MaxPhoneNumbersPerWaba = 'TIER_10' | 'TIER_20' | 'TIER_25' | 'TIER_50' | 'TIER_100' | 'TIER_200' | 'TIER_500' | 'UNLIMITED';

export interface BusinessCapabilityUpdateWebhookValue {
  maxPhoneNumbersPerBusiness?: MaxPhoneNumbersPerBusiness;
  maxPhoneNumbersPerWaba?: MaxPhoneNumbersPerWaba;
}

// ============================================================================
// Phone Number Name Update Webhook (field: "phone_number_name_update")
// ============================================================================

export type PhoneNumberNameUpdateDecision = 'APPROVED' | 'REJECTED';
export type PhoneNumberNameUpdateRejectionReason =
  | 'NONE'
  | 'DECEPTIVE'
  | 'GENERIC'
  | 'PROFANE'
  | 'TRADEMARK'
  | 'VIOLATES_NAMING_GUIDELINES';

export interface PhoneNumberNameUpdateWebhookValue {
  displayPhoneNumber: string;
  decision: PhoneNumberNameUpdateDecision;
  requestedVerifiedName: string;
  rejectionReason?: PhoneNumberNameUpdateRejectionReason;
}

// ============================================================================
// Phone Number Quality Update Webhook (field: "phone_number_quality_update")
// ============================================================================

export type MessagingLimitTier =
  | 'TIER_50'
  | 'TIER_250'
  | 'TIER_2K'
  | 'TIER_10K'
  | 'TIER_100K'
  | 'TIER_NOT_SET'
  | 'TIER_UNLIMITED';

export type PhoneNumberQualityEvent = 'ONBOARDING' | 'THROUGHPUT_UPGRADE';

export interface PhoneNumberQualityUpdateWebhookValue {
  displayPhoneNumber: string;
  event: PhoneNumberQualityEvent;
  currentLimit: MessagingLimitTier;
  oldLimit?: MessagingLimitTier;
  maxDailyConversationsPerBusiness?: MessagingLimitTier;
}

// ============================================================================
// Security Webhook (field: "security")
// ============================================================================

export type SecurityEvent = 'PIN_CHANGED' | 'PIN_RESET_REQUEST' | 'PIN_REQUEST_SUCCESS';

export interface SecurityWebhookValue {
  displayPhoneNumber: string;
  event: SecurityEvent;
  requester?: string;
}

// ============================================================================
// Message Template Status Update Webhook (field: "message_template_status_update")
// ============================================================================

export type TemplateStatusEvent =
  | 'APPROVED'
  | 'ARCHIVED'
  | 'DELETED'
  | 'DISABLED'
  | 'FLAGGED'
  | 'IN_APPEAL'
  | 'LIMIT_EXCEEDED'
  | 'LOCKED'
  | 'PAUSED'
  | 'PENDING'
  | 'REINSTATED'
  | 'PENDING_DELETION'
  | 'REJECTED';

export type TemplateRejectionReason =
  | 'ABUSIVE_CONTENT'
  | 'CATEGORY_NOT_AVAILABLE'
  | 'INCORRECT_CATEGORY'
  | 'INVALID_FORMAT'
  | 'NONE'
  | 'PROMOTIONAL'
  | 'SCAM'
  | 'TAG_CONTENT_MISMATCH';

export type TemplatePauseTitle =
  | 'FIRST_PAUSE'
  | 'SECOND_PAUSE'
  | 'RATE_LIMITING_PAUSE'
  | 'UNPAUSE'
  | 'DISABLED';

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

export interface MessageTemplateStatusUpdateWebhookValue {
  event: TemplateStatusEvent;
  messageTemplateId: number;
  messageTemplateName: string;
  messageTemplateLanguage: string;
  reason?: TemplateRejectionReason | null;
  messageTemplateCategory?: TemplateCategory;
  disableInfo?: {
    disableDate: string;
  };
  otherInfo?: {
    title: TemplatePauseTitle;
    description: string;
  };
  rejectionInfo?: {
    reason: string;
    recommendation: string;
  };
}

// ============================================================================
// Message Template Quality Update Webhook (field: "message_template_quality_update")
// ============================================================================

export type TemplateQualityScore = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export interface MessageTemplateQualityUpdateWebhookValue {
  previousQualityScore: TemplateQualityScore;
  newQualityScore: TemplateQualityScore;
  messageTemplateId: number;
  messageTemplateName: string;
  messageTemplateLanguage: string;
}

// ============================================================================
// Message Template Components Update Webhook (field: "message_template_components_update")
// ============================================================================

export interface MessageTemplateComponentsUpdateWebhookValue {
  messageTemplateId: number;
  messageTemplateName: string;
  messageTemplateLanguage: string;
  // Components are complex and can vary
  [key: string]: unknown;
}

// ============================================================================
// Template Category Update Webhook (field: "template_category_update")
// ============================================================================

export interface TemplateCategoryUpdateWebhookValue {
  messageTemplateId: number;
  messageTemplateName: string;
  messageTemplateLanguage: string;
  previousCategory: TemplateCategory;
  newCategory: TemplateCategory;
}

// ============================================================================
// History Webhook (field: "history")
// ============================================================================

export interface HistoryWebhookValue {
  phoneNumberId: string;
  wabaId: string;
  eventType: string;
  eventDescription?: string;
  [key: string]: unknown;
}

// ============================================================================
// Partner Solutions Webhook (field: "partner_solutions")
// ============================================================================

export interface PartnerSolutionsWebhookValue {
  solutionId: string;
  event: string;
  wabaId?: string;
  phoneNumberId?: string;
  [key: string]: unknown;
}

// ============================================================================
// Payment Configuration Update Webhook (field: "payment_configuration_update")
// ============================================================================

export interface PaymentConfigurationUpdateWebhookValue {
  event: string;
  phoneNumberId?: string;
  paymentConfiguration?: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// SMB App State Sync Webhook (field: "smb_app_state_sync")
// ============================================================================

export interface SmbAppStateSyncWebhookValue {
  event: string;
  phoneNumberId: string;
  state?: string;
  [key: string]: unknown;
}

// ============================================================================
// SMB Message Echoes Webhook (field: "smb_message_echoes")
// ============================================================================

export interface SmbMessageEchoesWebhookValue {
  messagingProduct: 'whatsapp';
  metadata: WebhookMetadata;
  messages?: Array<{
    id: string;
    from: string;
    to: string;
    timestamp: string;
    type: string;
    [key: string]: unknown;
  }>;
}

// ============================================================================
// User Preferences Webhook (field: "user_preferences")
// ============================================================================

export interface UserPreferencesWebhookValue {
  waId: string;
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// Automatic Events Webhook (field: "automatic_events")
// ============================================================================

export interface AutomaticEventsWebhookValue {
  event: string;
  phoneNumberId?: string;
  recipientId?: string;
  [key: string]: unknown;
}

// ============================================================================
// All Webhook Field Types
// ============================================================================

export type WebhookField =
  | 'messages'
  | 'account_alerts'
  | 'account_review_update'
  | 'account_update'
  | 'business_capability_update'
  | 'phone_number_name_update'
  | 'phone_number_quality_update'
  | 'security'
  | 'message_template_status_update'
  | 'message_template_quality_update'
  | 'message_template_components_update'
  | 'template_category_update'
  | 'history'
  | 'partner_solutions'
  | 'payment_configuration_update'
  | 'smb_app_state_sync'
  | 'smb_message_echoes'
  | 'user_preferences'
  | 'automatic_events';

// ============================================================================
// Webhook Event Types (Discriminated Unions)
// ============================================================================

export interface MessagesWebhookChange {
  value: MessagesWebhookValue;
  field: 'messages';
}

export interface AccountAlertsWebhookChange {
  value: AccountAlertsWebhookValue;
  field: 'account_alerts';
}

export interface AccountReviewUpdateWebhookChange {
  value: AccountReviewUpdateWebhookValue;
  field: 'account_review_update';
}

export interface AccountUpdateWebhookChange {
  value: AccountUpdateWebhookValue;
  field: 'account_update';
}

export interface BusinessCapabilityUpdateWebhookChange {
  value: BusinessCapabilityUpdateWebhookValue;
  field: 'business_capability_update';
}

export interface PhoneNumberNameUpdateWebhookChange {
  value: PhoneNumberNameUpdateWebhookValue;
  field: 'phone_number_name_update';
}

export interface PhoneNumberQualityUpdateWebhookChange {
  value: PhoneNumberQualityUpdateWebhookValue;
  field: 'phone_number_quality_update';
}

export interface SecurityWebhookChange {
  value: SecurityWebhookValue;
  field: 'security';
}

export interface MessageTemplateStatusUpdateWebhookChange {
  value: MessageTemplateStatusUpdateWebhookValue;
  field: 'message_template_status_update';
}

export interface MessageTemplateQualityUpdateWebhookChange {
  value: MessageTemplateQualityUpdateWebhookValue;
  field: 'message_template_quality_update';
}

export interface MessageTemplateComponentsUpdateWebhookChange {
  value: MessageTemplateComponentsUpdateWebhookValue;
  field: 'message_template_components_update';
}

export interface TemplateCategoryUpdateWebhookChange {
  value: TemplateCategoryUpdateWebhookValue;
  field: 'template_category_update';
}

export interface HistoryWebhookChange {
  value: HistoryWebhookValue;
  field: 'history';
}

export interface PartnerSolutionsWebhookChange {
  value: PartnerSolutionsWebhookValue;
  field: 'partner_solutions';
}

export interface PaymentConfigurationUpdateWebhookChange {
  value: PaymentConfigurationUpdateWebhookValue;
  field: 'payment_configuration_update';
}

export interface SmbAppStateSyncWebhookChange {
  value: SmbAppStateSyncWebhookValue;
  field: 'smb_app_state_sync';
}

export interface SmbMessageEchoesWebhookChange {
  value: SmbMessageEchoesWebhookValue;
  field: 'smb_message_echoes';
}

export interface UserPreferencesWebhookChange {
  value: UserPreferencesWebhookValue;
  field: 'user_preferences';
}

export interface AutomaticEventsWebhookChange {
  value: AutomaticEventsWebhookValue;
  field: 'automatic_events';
}

export type WebhookChange =
  | MessagesWebhookChange
  | AccountAlertsWebhookChange
  | AccountReviewUpdateWebhookChange
  | AccountUpdateWebhookChange
  | BusinessCapabilityUpdateWebhookChange
  | PhoneNumberNameUpdateWebhookChange
  | PhoneNumberQualityUpdateWebhookChange
  | SecurityWebhookChange
  | MessageTemplateStatusUpdateWebhookChange
  | MessageTemplateQualityUpdateWebhookChange
  | MessageTemplateComponentsUpdateWebhookChange
  | TemplateCategoryUpdateWebhookChange
  | HistoryWebhookChange
  | PartnerSolutionsWebhookChange
  | PaymentConfigurationUpdateWebhookChange
  | SmbAppStateSyncWebhookChange
  | SmbMessageEchoesWebhookChange
  | UserPreferencesWebhookChange
  | AutomaticEventsWebhookChange;

// ============================================================================
// Main Webhook Event Interface
// ============================================================================

export interface WebhookEntry {
  id: string;
  time?: number;
  changes: WebhookChange[];
}

export interface WebhookEvent {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

/** @deprecated Use WebhookEvent instead */
export interface MessageWebhookEvent {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: MessagesWebhookValue;
      field: 'messages';
    }>;
  }>;
}

/** @deprecated Use WebhookEvent instead */
export interface StatusWebhookEvent {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: MessagesWebhookValue;
      field: 'messages';
    }>;
  }>;
}

/** @deprecated Use WebhookEvent instead */
export interface AccountWebhookEvent {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: Record<string, unknown>;
      field: string;
    }>;
  }>;
}
