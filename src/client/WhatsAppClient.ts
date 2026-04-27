/**
 * Main WhatsApp Client class
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type -- Namespace methods are typed by the public properties above. */

import type {
    BusinessProfileResponse,
    BlockResponse,
    CallingSettings,
    ComplianceInfo,
    ConfigureConversationalAutomationParams,
    ConversationalAutomationResponse,
    MessagingLimitResponse,
    UpdateCallingSettingsParams,
    UpdateBusinessProfileParams,
    UpdateBusinessProfileResponse,
} from '../types/account.js';
import type { WhatsAppClientConfig } from '../types/config.js';
import type {
    SendAudioParams,
    SendContactParams,
    SendDocumentParams,
    SendImageParams,
    SendInteractiveButtonsParams,
    SendInteractiveCarouselParams,
    SendInteractiveCTAParams,
    SendInteractiveListParams,
    SendLocationParams,
    SendReactionParams,
    SendStickerParams,
    SendTemplateParams,
    SendTextParams,
    SendVideoParams,
} from '../types/messages.js';
import type {
    MediaDownloadResponse,
    MediaUploadResponse,
    MediaUrlResponse,
    MessageResponse,
    SuccessResponse,
} from '../types/responses.js';
import type { WebhookEvent } from '../types/webhooks.js';

import { WazapinLogger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';
import { Validator } from '../validation/validator.js';
import { HTTPClient } from './http.js';

// Import new API classes
import { BlockUsersAPI } from '../account/block-users.js';
import { BusinessAccountsAPI } from '../account/business-accounts.js';
import { CommerceSettingsAPI } from '../account/commerce-settings.js';
import { EmbeddedSignupAPI } from '../account/embedded-signup.js';
import { PhoneNumbersAPI } from '../account/phone-numbers.js';
import { QRCodeAPI } from '../account/qr-codes.js';
import { RegistrationAPI } from '../account/registration.js';
import { SharedWABAsAPI } from '../account/shared-wabas.js';
import { TwoStepVerificationAPI } from '../account/two-step-verification.js';
import { WABAManagementAPI } from '../account/waba.js';
import { AnalyticsAPI } from '../analytics/index.js';
import { CommerceMessagesAPI } from '../messages/commerce.js';
import { TypingIndicatorAPI } from '../messages/typing.js';
import { FlowsAPI } from '../messaging/flows.js';
import { TemplateManagementAPI } from '../templates/index.js';
import { WebhookSubscriptionAPI } from '../webhooks/subscribe.js';

// Import message functions
import { sendContact } from '../messages/contact.js';
import {
    sendInteractiveButtons,
    sendInteractiveCarousel,
    sendInteractiveCTA,
    sendInteractiveList,
} from '../messages/interactive.js';
import { sendLocation } from '../messages/location.js';
import {
    sendAudio,
    sendDocument,
    sendImage,
    sendSticker,
    sendVideo,
} from '../messages/media.js';
import { sendReaction } from '../messages/reaction.js';
import { markAsRead, markAsReadWithTyping } from '../messages/read.js';
import { sendTemplate } from '../messages/template.js';
import { sendText } from '../messages/text.js';

// Import media functions
import { deleteMedia, downloadMedia, getMediaUrl } from '../media/download.js';
import { uploadMedia } from '../media/upload.js';

// Import webhook functions
import { parseWebhook } from '../webhooks/parser.js';
import { verifyWebhookSignature } from '../webhooks/verifier.js';

// Import account functions
import {
    configureConversationalAutomation,
    getBusinessProfile,
    getConversationalAutomation,
    getMessagingLimit,
    updateBusinessProfile,
} from '../account/index.js';
import { blockPhoneNumber, unblockPhoneNumber } from '../account/block.js';
import { getCallingSettings, updateCallingSettings } from '../account/calling-settings.js';
import { getComplianceInfo, getPhoneComplianceInfo } from '../account/compliance.js';

/**
 * WhatsApp Business Cloud API Client
 */
export class WhatsAppClient {
  private readonly client: HTTPClient;
  private readonly phoneNumberId: string;
  private readonly validator?: Validator;
  private readonly retryConfig;
  private readonly logger: WazapinLogger;

  /**
   * Messages namespace
   */
  public readonly messages: {
    sendText: (params: SendTextParams) => Promise<MessageResponse>;
    sendImage: (params: SendImageParams) => Promise<MessageResponse>;
    sendVideo: (params: SendVideoParams) => Promise<MessageResponse>;
    sendAudio: (params: SendAudioParams) => Promise<MessageResponse>;
    sendDocument: (params: SendDocumentParams) => Promise<MessageResponse>;
    sendSticker: (params: SendStickerParams) => Promise<MessageResponse>;
    sendLocation: (params: SendLocationParams) => Promise<MessageResponse>;
    sendContact: (params: SendContactParams) => Promise<MessageResponse>;
    sendReaction: (params: SendReactionParams) => Promise<MessageResponse>;
    sendInteractiveButtons: (
      params: SendInteractiveButtonsParams
    ) => Promise<MessageResponse>;
    sendInteractiveList: (params: SendInteractiveListParams) => Promise<MessageResponse>;
    sendInteractiveCarousel: (
      params: SendInteractiveCarouselParams
    ) => Promise<MessageResponse>;
    sendTemplate: (params: SendTemplateParams) => Promise<MessageResponse>;
    sendInteractiveCTA: (params: SendInteractiveCTAParams) => Promise<MessageResponse>;
    markAsRead: (messageId: string) => Promise<SuccessResponse>;
    markAsReadWithTyping: (messageId: string, showTyping?: boolean) => Promise<SuccessResponse>;
  };

  /**
   * Media namespace
   */
  public readonly media: {
    upload: (file: Buffer | Blob, mimeType: string) => Promise<MediaUploadResponse>;
    download: (mediaId: string) => Promise<MediaDownloadResponse>;
    getUrl: (mediaId: string) => Promise<MediaUrlResponse>;
    delete: (mediaId: string) => Promise<SuccessResponse>;
  };

  /**
   * Webhooks namespace
   */
  public readonly webhooks: {
    parse: (payload: unknown) => WebhookEvent;
    verify: (payload: string, signature: string, appSecret: string) => Promise<boolean>;
  };

  /**
   * Account namespace
   */
  public readonly account: {
    getMessagingLimit: () => Promise<MessagingLimitResponse>;
    getBusinessProfile: (fields?: string[]) => Promise<BusinessProfileResponse>;
    updateBusinessProfile: (
      params: UpdateBusinessProfileParams
    ) => Promise<UpdateBusinessProfileResponse>;
    configureConversationalAutomation: (
      config: ConfigureConversationalAutomationParams
    ) => Promise<{ success: boolean }>;
    getConversationalAutomation: () => Promise<ConversationalAutomationResponse>;
    getCallingSettings: (phoneNumberId?: string) => Promise<CallingSettings>;
    updateCallingSettings: (
      params: UpdateCallingSettingsParams,
      phoneNumberId?: string
    ) => Promise<CallingSettings>;
    getComplianceInfo: (wabaId: string) => Promise<ComplianceInfo>;
    getPhoneComplianceInfo: (phoneNumberId?: string) => Promise<ComplianceInfo>;
    blockPhoneNumber: (phoneNumber: string, phoneNumberId?: string) => Promise<BlockResponse>;
    unblockPhoneNumber: (phoneNumber: string, phoneNumberId?: string) => Promise<BlockResponse>;
  };

  /**
   * Phone Numbers API
   */
  public readonly phoneNumbers: PhoneNumbersAPI;

  /**
   * Registration API
   */
  public readonly registration: RegistrationAPI;

  /**
   * WABA Management API
   */
  public readonly waba: WABAManagementAPI;

  /**
   * QR Codes API
   */
  public readonly qrCodes: QRCodeAPI;

  /**
   * Commerce Settings API
   */
  public readonly commerceSettings: CommerceSettingsAPI;

  /**
   * Block Users API
   */
  public readonly blockUsers: BlockUsersAPI;

  /**
   * Business Accounts API
   */
  public readonly businessAccounts: BusinessAccountsAPI;

  /**
   * Two-Step Verification API
   */
  public readonly twoStepVerification: TwoStepVerificationAPI;

  /**
   * Shared WABAs API
   */
  public readonly sharedWABAs: SharedWABAsAPI;

  /**
   * Embedded Signup API for business onboarding
   */
  public readonly embeddedSignup: EmbeddedSignupAPI;

  /**
   * Template Management API
   */
  public readonly templates: TemplateManagementAPI;

  /**
   * Commerce Messages API
   */
  public readonly commerce: CommerceMessagesAPI;

  /**
   * Typing Indicator API
   */
  public readonly typing: TypingIndicatorAPI;

  /**
   * Webhook Subscription API
   */
  public readonly webhookSubscription: WebhookSubscriptionAPI;

  /**
   * Analytics API
   */
  public readonly analytics: AnalyticsAPI;

  /**
   * Flows API for creating and managing WhatsApp Flows
   */
  public readonly flows: FlowsAPI;

  constructor(config: WhatsAppClientConfig) {
    // Initialize logger
    this.logger = config.logger instanceof WazapinLogger
      ? config.logger
      : new WazapinLogger(config.logger);

    // Initialize HTTP client with logger
    this.client = new HTTPClient(config, this.logger);
    this.phoneNumberId = config.phoneNumberId;
    this.retryConfig = config.retry;

    // Log initialization
    this.logger.info('WhatsApp Client initialized', {
      phoneNumberId: config.phoneNumberId,
      apiVersion: config.apiVersion || 'v18.0',
    });

    // Initialize validator if validation is enabled
    if (config.validation && config.validation !== 'off') {
      this.validator = new Validator(config.validation);
    }

    // Initialize messages namespace
    this.messages = {
      sendText: (params) =>
        this.withRetryWrapper(() =>
          sendText(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendImage: (params) =>
        this.withRetryWrapper(() =>
          sendImage(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendVideo: (params) =>
        this.withRetryWrapper(() =>
          sendVideo(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendAudio: (params) =>
        this.withRetryWrapper(() =>
          sendAudio(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendDocument: (params) =>
        this.withRetryWrapper(() =>
          sendDocument(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendSticker: (params) =>
        this.withRetryWrapper(() =>
          sendSticker(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendLocation: (params) =>
        this.withRetryWrapper(() =>
          sendLocation(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendContact: (params) =>
        this.withRetryWrapper(() =>
          sendContact(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendReaction: (params) =>
        this.withRetryWrapper(() =>
          sendReaction(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveButtons: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveButtons(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveList: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveList(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveCarousel: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveCarousel(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendTemplate: (params) =>
        this.withRetryWrapper(() =>
          sendTemplate(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveCTA: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveCTA(this.client, this.phoneNumberId, params, this.validator)
        ),
      markAsRead: (messageId) =>
        this.withRetryWrapper(() => markAsRead(this.client, this.phoneNumberId, messageId)),
      markAsReadWithTyping: (messageId, showTyping = false) =>
        this.withRetryWrapper(() =>
          markAsReadWithTyping(this.client, this.phoneNumberId, messageId, showTyping)
        ),
    };

    // Initialize media namespace
    this.media = {
      upload: (file, mimeType) =>
        this.withRetryWrapper(() => uploadMedia(this.client, this.phoneNumberId, file, mimeType)),
      download: (mediaId) => this.withRetryWrapper(() => downloadMedia(this.client, mediaId)),
      getUrl: (mediaId) => this.withRetryWrapper(() => getMediaUrl(this.client, mediaId)),
      delete: (mediaId) => this.withRetryWrapper(() => deleteMedia(this.client, mediaId)),
    };

    // Initialize webhooks namespace
    this.webhooks = {
      parse: (payload) => parseWebhook(payload, this.validator),
      verify: (payload, signature, appSecret) =>
        verifyWebhookSignature(payload, signature, appSecret),
    };

    // Initialize account namespace
    this.account = {
      getMessagingLimit: () =>
        this.withRetryWrapper(() =>
          getMessagingLimit(this.client, this.phoneNumberId, this.validator)
        ),
      getBusinessProfile: (fields) =>
        this.withRetryWrapper(() =>
          getBusinessProfile(this.client, this.phoneNumberId, fields, this.validator)
        ),
      updateBusinessProfile: (params) =>
        this.withRetryWrapper(() =>
          updateBusinessProfile(this.client, this.phoneNumberId, params, this.validator)
        ),
      configureConversationalAutomation: (config) =>
        this.withRetryWrapper(() =>
          configureConversationalAutomation(this.client, this.phoneNumberId, config, this.validator)
        ),
      getConversationalAutomation: () =>
        this.withRetryWrapper(() =>
          getConversationalAutomation(this.client, this.phoneNumberId, this.validator)
        ),
      getCallingSettings: (phoneNumberId = this.phoneNumberId) =>
        this.withRetryWrapper(() => getCallingSettings(this.client, phoneNumberId)),
      updateCallingSettings: (params, phoneNumberId = this.phoneNumberId) =>
        this.withRetryWrapper(() => updateCallingSettings(this.client, phoneNumberId, params)),
      getComplianceInfo: (wabaId) =>
        this.withRetryWrapper(() => getComplianceInfo(this.client, wabaId)),
      getPhoneComplianceInfo: (phoneNumberId = this.phoneNumberId) =>
        this.withRetryWrapper(() => getPhoneComplianceInfo(this.client, phoneNumberId)),
      blockPhoneNumber: (phoneNumber, phoneNumberId = this.phoneNumberId) =>
        this.withRetryWrapper(() => blockPhoneNumber(this.client, phoneNumberId, phoneNumber)),
      unblockPhoneNumber: (phoneNumber, phoneNumberId = this.phoneNumberId) =>
        this.withRetryWrapper(() => unblockPhoneNumber(this.client, phoneNumberId, phoneNumber)),
    };

    // Initialize new API classes
    this.phoneNumbers = new PhoneNumbersAPI(this.client, this.phoneNumberId);
    this.registration = new RegistrationAPI(this.client, this.phoneNumberId);
    this.waba = new WABAManagementAPI(this.client);
    this.qrCodes = new QRCodeAPI(this.client, this.phoneNumberId);
    this.commerceSettings = new CommerceSettingsAPI(this.client, this.phoneNumberId);
    this.blockUsers = new BlockUsersAPI(this.client, this.phoneNumberId);
    this.businessAccounts = new BusinessAccountsAPI(this.client);
    this.twoStepVerification = new TwoStepVerificationAPI(this.client);
    this.sharedWABAs = new SharedWABAsAPI(this.client);
    this.embeddedSignup = new EmbeddedSignupAPI(this.client);
    
    // Note: Templates, Analytics need wabaId (not phoneNumberId)
    // Users should pass wabaId when creating client or call these directly
    const wabaId = config.wabaId || this.phoneNumberId;
    this.templates = new TemplateManagementAPI(this.client, wabaId);
    this.analytics = new AnalyticsAPI(this.client, wabaId);
    
    this.commerce = new CommerceMessagesAPI(this.client, this.phoneNumberId);
    this.typing = new TypingIndicatorAPI(this.client, this.phoneNumberId);
    this.webhookSubscription = new WebhookSubscriptionAPI(this.client);
    this.flows = new FlowsAPI(this.client, wabaId);
  }

  /**
   * Wrap function with retry logic
   */
  private withRetryWrapper<T>(fn: () => Promise<T>): Promise<T> {
    if (this.retryConfig) {
      return withRetry(fn, this.retryConfig);
    }
    return fn();
  }
}
