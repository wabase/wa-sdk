/**
 * Type exports for @wabase/wa-sdk
 */

// Common types
export type {
  PhoneNumber,
  MessageId,
  MediaId,
  LanguageCode,
  MessageContext,
  MediaInput,
  CurrencyParameter,
  DateTimeParameter,
  InteractiveHeader,
} from "./common.js";

// Message types
export type {
  SendTextParams,
  SendImageParams,
  SendVideoParams,
  SendAudioParams,
  SendDocumentParams,
  SendStickerParams,
  SendLocationParams,
  ContactName,
  ContactPhone,
  ContactEmail,
  ContactUrl,
  ContactAddress,
  ContactOrg,
  Contact,
  SendContactParams,
  SendReactionParams,
  InteractiveButton,
  SendInteractiveButtonsParams,
  InteractiveRow,
  InteractiveSection,
  SendInteractiveListParams,
  InteractiveCarouselCard,
  SendInteractiveCarouselParams,
  TemplateParameter,
  SendTemplateParams,
  InteractiveCTAHeader,
  InteractiveCTAAction,
  SendInteractiveCTAParams,
} from "./messages.js";

// Response types
export type {
  MessageResponse,
  MediaUploadResponse,
  MediaDownloadResponse,
  MediaUrlResponse,
  SuccessResponse,
} from "./responses.js";

// Webhook types
export type {
  WebhookMetadata,
  WebhookContact,
  WebhookMedia,
  WebhookLocation,
  WebhookInteractive,
  WebhookMessage,
  WebhookStatus,
  WebhookField,
  MessagesWebhookValue,
  AccountAlertsWebhookValue,
  AccountReviewUpdateWebhookValue,
  AccountUpdateWebhookValue,
  BusinessCapabilityUpdateWebhookValue,
  PhoneNumberNameUpdateWebhookValue,
  PhoneNumberQualityUpdateWebhookValue,
  SecurityWebhookValue,
  MessageTemplateStatusUpdateWebhookValue,
  MessageTemplateQualityUpdateWebhookValue,
  MessageTemplateComponentsUpdateWebhookValue,
  TemplateCategoryUpdateWebhookValue,
  HistoryWebhookValue,
  PartnerSolutionsWebhookValue,
  PaymentConfigurationUpdateWebhookValue,
  SmbAppStateSyncWebhookValue,
  SmbMessageEchoesWebhookValue,
  UserPreferencesWebhookValue,
  AutomaticEventsWebhookValue,
  WebhookChange,
  WebhookEntry,
  MessageWebhookEvent,
  StatusWebhookEvent,
  AccountWebhookEvent,
  WebhookEvent,
} from "./webhooks.js";

// Error types
export {
  WhatsAppError,
  APIError,
  ValidationError,
  NetworkError,
  RateLimitError,
} from "./errors.js";

// Configuration types
export type {
  RetryConfig,
  ValidationMode,
  WhatsAppClientConfig,
} from "./config.js";

// Media types
export type { MediaType, MediaFile, MediaMetadata } from "./media.js";

// Account types
export type {
  MessagingLimitTier,
  MessagingLimitResponse,
  BusinessVertical,
  BusinessProfile,
  UpdateBusinessProfileParams,
  BusinessProfileResponse,
  UpdateBusinessProfileResponse,
  ConversationalCommand,
  ConversationalAutomationConfig,
  ConfigureConversationalAutomationParams,
  ConversationalAutomationResponse,
} from "./account.js";

// Phone Numbers types
export type {
  QualityRating,
  DisplayNameStatus,
  VerificationMethod,
  PhoneNumberDetails,
  PhoneNumbersListResponse,
  RequestVerificationCodeParams,
  VerifyCodeParams,
  SetTwoStepPinParams,
  DisplayNameStatusResponse,
  PhoneNumberFilterParams,
} from "./phone-numbers.js";

// Registration types
export type {
  RegisterPhoneParams,
  RegistrationResponse,
} from "./registration.js";

// WABA types
export type { WABADetails, WABAListResponse } from "./waba.js";

// Template types
export type {
  TemplateStatus,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateButtonType,
  TemplateComponentParameter,
  TemplateButton,
  TemplateComponent,
  Template,
  TemplateListResponse,
  TemplateNamespaceResponse as TemplateNamespace,
  CreateTemplateParams,
  CreateAuthTemplateParams,
  CreateCatalogTemplateParams,
  EditTemplateParams,
  TemplateCreateResponse,
} from "./template.js";

// Commerce types
export type {
  ProductSection,
  SendSingleProductParams,
  SendMultiProductParams,
  SendCatalogParams,
  SendCatalogTemplateParams,
} from "./commerce.js";

// QR Codes types
export type {
  QRCodeFormat,
  QRCodeDetails,
  QRCodeListResponse,
  CreateQRCodeParams,
  QRCodeCreateResponse,
  UpdateQRCodeParams,
  QRCodeImageURLResponse,
} from "./qr-codes.js";

// Commerce Settings types
export type {
  CommerceSettings,
  UpdateCommerceSettingsParams,
  CommerceSettingsResponse,
} from "./commerce-settings.js";

// Block Users types
export type { BlockedUser, BlockedUsersListResponse } from "./block-users.js";

// Analytics types
export type {
  AnalyticsGranularity,
  AnalyticsMetricType,
  AnalyticsParams,
  AnalyticsDataPoint,
  AnalyticsData,
  ConversationType,
  ConversationDirection,
  ConversationDimension,
  ConversationAnalyticsParams,
  ConversationAnalyticsDataPoint,
  ConversationAnalyticsResponse,
} from "./analytics.js";

// Business Accounts types
export type {
  BusinessAccount,
  BusinessAccountResponse,
  ExtendedCredit,
  ExtendedCreditsResponse,
  GetBusinessAccountOptions,
  ListExtendedCreditsOptions,
} from "./business-accounts.js";

// Two-Step Verification types
export type {
  SetTwoStepVerificationRequest,
  SetTwoStepVerificationResponse,
} from "./two-step-verification.js";

// Shared WABAs types
export type {
  SharedWABA,
  SharedWABAsResponse,
  ListSharedWABAsOptions,
} from "./shared-wabas.js";

// Embedded Signup types
export type {
  DebugTokenResponse,
  SharedWABAsResponse as EmbeddedSignupWABAsResponse,
  WABAInfo,
  FilterWABAOptions,
  SystemUser,
  SystemUsersResponse,
  AssignedUser,
  AssignedUsersResponse,
  AddSystemUserParams,
  ExtendedCredit as EmbeddedSignupExtendedCredit,
  ExtendedCreditsListResponse,
  AttachCreditLineParams,
  AllocationConfigResponse,
  CreditSharingRecord,
  OverrideCallbackParams,
  WABASubscription,
  SubscriptionsResponse,
  PhoneNumberFilterOptions,
  PhoneNumberCertificate,
  TemplateNamespaceResponse as EmbeddedSignupTemplateNamespace,
} from "./embedded-signup.js";

// Flows types
export type {
  FlowStatus,
  FlowCategory,
  FlowAssetType,
  FlowMetricName,
  FlowMetricGranularity,
  FlowValidationError,
  FlowPreview,
  FlowHealthEntity,
  FlowHealthStatus,
  FlowWABA,
  FlowApplication,
  FlowDetails,
  CreateFlowParams,
  UpdateFlowParams,
  MigrateFlowsParams,
  FlowMigrationResult,
  FlowListResponse,
  FlowAsset,
  FlowAssetsResponse,
  UploadFlowJSONResponse,
  FlowCreateResponse,
  FlowSuccessResponse,
  FlowMetricDataPoint,
  FlowAnalyticsResponse,
  FlowAnalyticsParams,
  FlowAction,
  FlowMode,
  FlowActionPayload,
  SendFlowParams,
  FlowTemplateButton,
  CreateFlowTemplateParams,
  SendFlowTemplateParams,
  FlowEncryptionPublicKeyResponse,
} from "./flows.js";

// Embedded Signup Session types (for postMessage events)
export type {
  EmbeddedSignupSessionEvent,
  EmbeddedSignupEventType,
  EmbeddedSignupSuccessData,
  EmbeddedSignupCancelData,
  EmbeddedSignupErrorData,
  EmbeddedSignupStep,
  FBLoginResponse,
  FBLoginOptions,
} from "./embedded-signup-session.js";

export {
  isSuccessData,
  isCancelData,
  isErrorData,
} from "./embedded-signup-session.js";
