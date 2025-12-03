/**
 * Zod schemas for webhook validation
 * Based on: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/reference
 */

import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

export const webhookMetadataSchema = z.object({
  displayPhoneNumber: z.string(),
  phoneNumberId: z.string(),
});

export const webhookContactSchema = z.object({
  profile: z.object({
    name: z.string(),
  }),
  waId: z.string(),
  identityKeyHash: z.string().optional(),
});

export const webhookMediaSchema = z.object({
  id: z.string(),
  mimeType: z.string(),
  sha256: z.string().optional(),
  caption: z.string().optional(),
  filename: z.string().optional(),
});

export const webhookLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().optional(),
  address: z.string().optional(),
});

export const webhookInteractiveSchema = z.object({
  type: z.enum(['button_reply', 'list_reply']),
  buttonReply: z.object({ id: z.string(), title: z.string() }).optional(),
  listReply: z.object({ id: z.string(), title: z.string(), description: z.string().optional() }).optional(),
});

export const webhookErrorSchema = z.object({
  code: z.number(),
  title: z.string(),
  message: z.string().optional(),
  errorData: z.object({ details: z.string() }).optional(),
});

// ============================================================================
// Messages Webhook Schemas (field: "messages")
// ============================================================================

export const webhookMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  timestamp: z.string(),
  type: z.enum([
    'text', 'image', 'video', 'audio', 'document', 'sticker', 'location',
    'contacts', 'button', 'interactive', 'order', 'system', 'reaction',
    'unsupported', 'unknown',
  ]),
  context: z.object({ from: z.string(), id: z.string() }).optional(),
  errors: z.array(webhookErrorSchema).optional(),
  text: z.object({ body: z.string() }).optional(),
  image: webhookMediaSchema.optional(),
  video: webhookMediaSchema.optional(),
  audio: webhookMediaSchema.optional(),
  document: webhookMediaSchema.optional(),
  sticker: webhookMediaSchema.optional(),
  location: webhookLocationSchema.optional(),
  contacts: z.array(webhookContactSchema).optional(),
  button: z.object({ text: z.string(), payload: z.string() }).optional(),
  interactive: webhookInteractiveSchema.optional(),
  reaction: z.object({ messageId: z.string(), emoji: z.string() }).optional(),
  unsupported: z.object({ type: z.string() }).optional(),
});

export const webhookStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  timestamp: z.string(),
  recipientId: z.string(),
  conversation: z.object({
    id: z.string(),
    origin: z.object({ type: z.string() }),
  }).optional(),
  pricing: z.object({
    pricingModel: z.string(),
    billable: z.boolean(),
    category: z.string(),
  }).optional(),
  errors: z.array(webhookErrorSchema).optional(),
});

export const messagesWebhookValueSchema = z.object({
  messagingProduct: z.literal('whatsapp'),
  metadata: webhookMetadataSchema,
  contacts: z.array(webhookContactSchema).optional(),
  messages: z.array(webhookMessageSchema).optional(),
  statuses: z.array(webhookStatusSchema).optional(),
  errors: z.array(webhookErrorSchema).optional(),
});

// ============================================================================
// Account Alerts Webhook (field: "account_alerts")
// ============================================================================

export const accountAlertsWebhookValueSchema = z.object({
  entityType: z.enum(['BUSINESS', 'PHONE_NUMBER', 'CURRENT_STATUS_ID']),
  entityId: z.string(),
  alertInfo: z.object({
    alertSeverity: z.enum(['CRITICAL', 'INFORMATIONAL', 'WARNING']),
    alertStatus: z.enum(['ACTIVE', 'NONE']),
    alertType: z.enum([
      'INCREASED_CAPABILITIES_ELIGIBILITY_DEFERRED',
      'INCREASED_CAPABILITIES_ELIGIBILITY_FAILED',
      'INCREASED_CAPABILITIES_ELIGIBILITY_NEED_MORE_INFO',
      'OBA_APPROVED',
      'OBA_REJECTED',
      'PROFILE_PICTURE_LOST',
    ]),
    alertDescription: z.string(),
  }),
});

// ============================================================================
// Account Review Update Webhook (field: "account_review_update")
// ============================================================================

export const accountReviewUpdateWebhookValueSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'PENDING', 'DEFERRED']),
});

// ============================================================================
// Account Update Webhook (field: "account_update")
// ============================================================================

export const accountUpdateWebhookValueSchema = z.object({
  event: z.enum([
    'ACCOUNT_DELETED', 'ACCOUNT_VIOLATION', 'AD_ACCOUNT_LINKED',
    'AUTH_INTL_PRICE_ELIGIBILITY_UPDATE', 'DISABLED_UPDATE', 'MM_LITE_TERMS_SIGNED',
    'PARTNER_ADDED', 'PARTNER_APP_INSTALLED', 'PARTNER_APP_UNINSTALLED',
    'PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE', 'BUSINESS_PRIMARY_LOCATION_COUNTRY_UPDATE',
    'VOLUME_BASED_PRICING_TIER_UPDATE',
  ]),
  violationInfo: z.object({
    violationType: z.enum(['ADULT', 'ILLEGAL', 'SPAM', 'SCAM', 'PHISHING', 'MALWARE', 'HARASSMENT', 'IMPERSONATION', 'OTHER']),
  }).optional(),
  banInfo: z.object({
    wabaBanState: z.enum(['SCHEDULE_FOR_DISABLE', 'DISABLE', 'REINSTATE']),
    wabaBanDate: z.string().optional(),
  }).optional(),
  wabaInfo: z.object({
    wabaId: z.string(),
    ownerBusinessId: z.string(),
    adAccountLinked: z.string().optional(),
    partnerAppId: z.string().optional(),
    solutionId: z.string().optional(),
    solutionPartnerBusinessIds: z.array(z.string()).optional(),
  }).optional(),
  authInternationalRateEligibility: z.object({
    startTime: z.number(),
    exceptionCountries: z.array(z.object({
      countryCode: z.string(),
      startTime: z.number(),
    })).optional(),
  }).optional(),
  partnerClientCertificationInfo: z.object({
    clientBusinessId: z.string(),
    status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
    rejectionReasons: z.array(z.string()).optional(),
  }).optional(),
  country: z.string().optional(),
  volumeTierInfo: z.object({
    tierUpdateTime: z.number(),
    pricingCategory: z.string(),
    tier: z.string(),
    effectiveMonth: z.string(),
    region: z.string(),
  }).optional(),
});

// ============================================================================
// Business Capability Update Webhook (field: "business_capability_update")
// ============================================================================

export const businessCapabilityUpdateWebhookValueSchema = z.object({
  maxPhoneNumbersPerBusiness: z.enum(['TIER_10', 'TIER_50', 'TIER_100', 'TIER_200', 'TIER_500', 'UNLIMITED']).optional(),
  maxPhoneNumbersPerWaba: z.enum(['TIER_10', 'TIER_20', 'TIER_25', 'TIER_50', 'TIER_100', 'TIER_200', 'TIER_500', 'UNLIMITED']).optional(),
});

// ============================================================================
// Phone Number Name Update Webhook (field: "phone_number_name_update")
// ============================================================================

export const phoneNumberNameUpdateWebhookValueSchema = z.object({
  displayPhoneNumber: z.string(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  requestedVerifiedName: z.string(),
  rejectionReason: z.enum(['NONE', 'DECEPTIVE', 'GENERIC', 'PROFANE', 'TRADEMARK', 'VIOLATES_NAMING_GUIDELINES']).optional(),
});

// ============================================================================
// Phone Number Quality Update Webhook (field: "phone_number_quality_update")
// ============================================================================

export const messagingLimitTierSchema = z.enum([
  'TIER_50', 'TIER_250', 'TIER_2K', 'TIER_10K', 'TIER_100K', 'TIER_NOT_SET', 'TIER_UNLIMITED',
]);

export const phoneNumberQualityUpdateWebhookValueSchema = z.object({
  displayPhoneNumber: z.string(),
  event: z.enum(['ONBOARDING', 'THROUGHPUT_UPGRADE']),
  currentLimit: messagingLimitTierSchema,
  oldLimit: messagingLimitTierSchema.optional(),
  maxDailyConversationsPerBusiness: messagingLimitTierSchema.optional(),
});

// ============================================================================
// Security Webhook (field: "security")
// ============================================================================

export const securityWebhookValueSchema = z.object({
  displayPhoneNumber: z.string(),
  event: z.enum(['PIN_CHANGED', 'PIN_RESET_REQUEST', 'PIN_REQUEST_SUCCESS']),
  requester: z.string().optional(),
});

// ============================================================================
// Message Template Status Update Webhook (field: "message_template_status_update")
// ============================================================================

export const messageTemplateStatusUpdateWebhookValueSchema = z.object({
  event: z.enum([
    'APPROVED', 'ARCHIVED', 'DELETED', 'DISABLED', 'FLAGGED', 'IN_APPEAL',
    'LIMIT_EXCEEDED', 'LOCKED', 'PAUSED', 'PENDING', 'REINSTATED', 'PENDING_DELETION', 'REJECTED',
  ]),
  messageTemplateId: z.number(),
  messageTemplateName: z.string(),
  messageTemplateLanguage: z.string(),
  reason: z.enum([
    'ABUSIVE_CONTENT', 'CATEGORY_NOT_AVAILABLE', 'INCORRECT_CATEGORY',
    'INVALID_FORMAT', 'NONE', 'PROMOTIONAL', 'SCAM', 'TAG_CONTENT_MISMATCH',
  ]).nullable().optional(),
  messageTemplateCategory: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']).optional(),
  disableInfo: z.object({ disableDate: z.string() }).optional(),
  otherInfo: z.object({
    title: z.enum(['FIRST_PAUSE', 'SECOND_PAUSE', 'RATE_LIMITING_PAUSE', 'UNPAUSE', 'DISABLED']),
    description: z.string(),
  }).optional(),
  rejectionInfo: z.object({
    reason: z.string(),
    recommendation: z.string(),
  }).optional(),
});

// ============================================================================
// Message Template Quality Update Webhook (field: "message_template_quality_update")
// ============================================================================

export const messageTemplateQualityUpdateWebhookValueSchema = z.object({
  previousQualityScore: z.enum(['GREEN', 'YELLOW', 'RED', 'UNKNOWN']),
  newQualityScore: z.enum(['GREEN', 'YELLOW', 'RED', 'UNKNOWN']),
  messageTemplateId: z.number(),
  messageTemplateName: z.string(),
  messageTemplateLanguage: z.string(),
});

// ============================================================================
// Message Template Components Update Webhook (field: "message_template_components_update")
// ============================================================================

export const messageTemplateComponentsUpdateWebhookValueSchema = z.object({
  messageTemplateId: z.number(),
  messageTemplateName: z.string(),
  messageTemplateLanguage: z.string(),
}).passthrough();

// ============================================================================
// Template Category Update Webhook (field: "template_category_update")
// ============================================================================

export const templateCategoryUpdateWebhookValueSchema = z.object({
  messageTemplateId: z.number(),
  messageTemplateName: z.string(),
  messageTemplateLanguage: z.string(),
  previousCategory: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
  newCategory: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
});

// ============================================================================
// History Webhook (field: "history")
// ============================================================================

export const historyWebhookValueSchema = z.object({
  phoneNumberId: z.string(),
  wabaId: z.string(),
  eventType: z.string(),
  eventDescription: z.string().optional(),
}).passthrough();

// ============================================================================
// Partner Solutions Webhook (field: "partner_solutions")
// ============================================================================

export const partnerSolutionsWebhookValueSchema = z.object({
  solutionId: z.string(),
  event: z.string(),
  wabaId: z.string().optional(),
  phoneNumberId: z.string().optional(),
}).passthrough();

// ============================================================================
// Payment Configuration Update Webhook (field: "payment_configuration_update")
// ============================================================================

export const paymentConfigurationUpdateWebhookValueSchema = z.object({
  event: z.string(),
  phoneNumberId: z.string().optional(),
  paymentConfiguration: z.record(z.unknown()).optional(),
}).passthrough();

// ============================================================================
// SMB App State Sync Webhook (field: "smb_app_state_sync")
// ============================================================================

export const smbAppStateSyncWebhookValueSchema = z.object({
  event: z.string(),
  phoneNumberId: z.string(),
  state: z.string().optional(),
}).passthrough();

// ============================================================================
// SMB Message Echoes Webhook (field: "smb_message_echoes")
// ============================================================================

export const smbMessageEchoesWebhookValueSchema = z.object({
  messagingProduct: z.literal('whatsapp'),
  metadata: webhookMetadataSchema,
  messages: z.array(z.object({
    id: z.string(),
    from: z.string(),
    to: z.string(),
    timestamp: z.string(),
    type: z.string(),
  }).passthrough()).optional(),
});

// ============================================================================
// User Preferences Webhook (field: "user_preferences")
// ============================================================================

export const userPreferencesWebhookValueSchema = z.object({
  waId: z.string(),
  preferences: z.record(z.unknown()).optional(),
}).passthrough();

// ============================================================================
// Automatic Events Webhook (field: "automatic_events")
// ============================================================================

export const automaticEventsWebhookValueSchema = z.object({
  event: z.string(),
  phoneNumberId: z.string().optional(),
  recipientId: z.string().optional(),
}).passthrough();

// ============================================================================
// Webhook Change Schemas (Discriminated Union)
// ============================================================================

export const messagesWebhookChangeSchema = z.object({
  value: messagesWebhookValueSchema,
  field: z.literal('messages'),
});

export const accountAlertsWebhookChangeSchema = z.object({
  value: accountAlertsWebhookValueSchema,
  field: z.literal('account_alerts'),
});

export const accountReviewUpdateWebhookChangeSchema = z.object({
  value: accountReviewUpdateWebhookValueSchema,
  field: z.literal('account_review_update'),
});

export const accountUpdateWebhookChangeSchema = z.object({
  value: accountUpdateWebhookValueSchema,
  field: z.literal('account_update'),
});

export const businessCapabilityUpdateWebhookChangeSchema = z.object({
  value: businessCapabilityUpdateWebhookValueSchema,
  field: z.literal('business_capability_update'),
});

export const phoneNumberNameUpdateWebhookChangeSchema = z.object({
  value: phoneNumberNameUpdateWebhookValueSchema,
  field: z.literal('phone_number_name_update'),
});

export const phoneNumberQualityUpdateWebhookChangeSchema = z.object({
  value: phoneNumberQualityUpdateWebhookValueSchema,
  field: z.literal('phone_number_quality_update'),
});

export const securityWebhookChangeSchema = z.object({
  value: securityWebhookValueSchema,
  field: z.literal('security'),
});

export const messageTemplateStatusUpdateWebhookChangeSchema = z.object({
  value: messageTemplateStatusUpdateWebhookValueSchema,
  field: z.literal('message_template_status_update'),
});

export const messageTemplateQualityUpdateWebhookChangeSchema = z.object({
  value: messageTemplateQualityUpdateWebhookValueSchema,
  field: z.literal('message_template_quality_update'),
});

export const messageTemplateComponentsUpdateWebhookChangeSchema = z.object({
  value: messageTemplateComponentsUpdateWebhookValueSchema,
  field: z.literal('message_template_components_update'),
});

export const templateCategoryUpdateWebhookChangeSchema = z.object({
  value: templateCategoryUpdateWebhookValueSchema,
  field: z.literal('template_category_update'),
});

export const historyWebhookChangeSchema = z.object({
  value: historyWebhookValueSchema,
  field: z.literal('history'),
});

export const partnerSolutionsWebhookChangeSchema = z.object({
  value: partnerSolutionsWebhookValueSchema,
  field: z.literal('partner_solutions'),
});

export const paymentConfigurationUpdateWebhookChangeSchema = z.object({
  value: paymentConfigurationUpdateWebhookValueSchema,
  field: z.literal('payment_configuration_update'),
});

export const smbAppStateSyncWebhookChangeSchema = z.object({
  value: smbAppStateSyncWebhookValueSchema,
  field: z.literal('smb_app_state_sync'),
});

export const smbMessageEchoesWebhookChangeSchema = z.object({
  value: smbMessageEchoesWebhookValueSchema,
  field: z.literal('smb_message_echoes'),
});

export const userPreferencesWebhookChangeSchema = z.object({
  value: userPreferencesWebhookValueSchema,
  field: z.literal('user_preferences'),
});

export const automaticEventsWebhookChangeSchema = z.object({
  value: automaticEventsWebhookValueSchema,
  field: z.literal('automatic_events'),
});

// Fallback for unknown field types
export const unknownWebhookChangeSchema = z.object({
  value: z.record(z.unknown()),
  field: z.string(),
});

// Union of all webhook change types
export const webhookChangeSchema = z.union([
  messagesWebhookChangeSchema,
  accountAlertsWebhookChangeSchema,
  accountReviewUpdateWebhookChangeSchema,
  accountUpdateWebhookChangeSchema,
  businessCapabilityUpdateWebhookChangeSchema,
  phoneNumberNameUpdateWebhookChangeSchema,
  phoneNumberQualityUpdateWebhookChangeSchema,
  securityWebhookChangeSchema,
  messageTemplateStatusUpdateWebhookChangeSchema,
  messageTemplateQualityUpdateWebhookChangeSchema,
  messageTemplateComponentsUpdateWebhookChangeSchema,
  templateCategoryUpdateWebhookChangeSchema,
  historyWebhookChangeSchema,
  partnerSolutionsWebhookChangeSchema,
  paymentConfigurationUpdateWebhookChangeSchema,
  smbAppStateSyncWebhookChangeSchema,
  smbMessageEchoesWebhookChangeSchema,
  userPreferencesWebhookChangeSchema,
  automaticEventsWebhookChangeSchema,
  unknownWebhookChangeSchema,
]);

// ============================================================================
// Main Webhook Event Schema
// ============================================================================

export const webhookEntrySchema = z.object({
  id: z.string(),
  time: z.number().optional(),
  changes: z.array(webhookChangeSchema),
});

export const webhookEventSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(webhookEntrySchema),
});

// ============================================================================
// Legacy Schemas (for backward compatibility)
// ============================================================================

/** @deprecated Use webhookEventSchema instead */
export const messageWebhookEventSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: messagesWebhookValueSchema,
      field: z.literal('messages'),
    })),
  })),
});

/** @deprecated Use webhookEventSchema instead */
export const statusWebhookEventSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: messagesWebhookValueSchema,
      field: z.literal('messages'),
    })),
  })),
});

/** @deprecated Use webhookEventSchema instead */
export const accountWebhookEventSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: z.object({ event: z.string() }).passthrough(),
      field: z.string(),
    })),
  })),
});
