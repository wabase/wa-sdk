/**
 * Embedded Signup API for WhatsApp Business onboarding
 * 
 * This API provides methods to manage the Embedded Signup flow,
 * which makes it easy to onboard business customers to WhatsApp Cloud API.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 */

import type { HTTPClient } from '../client/http.js';
import type { SuccessResponse } from '../types/responses.js';
import type { PhoneNumbersListResponse } from '../types/phone-numbers.js';
import type { TemplateListResponse } from '../types/template.js';
import type {
  DebugTokenResponse,
  SharedWABAsResponse,
  WABAInfo,
  FilterWABAOptions,
  SystemUsersResponse,
  AssignedUsersResponse,
  AddSystemUserParams,
  ExtendedCreditsListResponse,
  AttachCreditLineParams,
  AllocationConfigResponse,
  CreditSharingRecord,
  OverrideCallbackParams,
  SubscriptionsResponse,
  PhoneNumberFilterOptions,
  PhoneNumberCertificate,
  TemplateNamespaceResponse,
} from '../types/embedded-signup.js';

/**
 * Embedded Signup API for WhatsApp Business Management
 * 
 * Handles all operations related to the Embedded Signup flow including:
 * - WABA management and information
 * - System user permissions
 * - Credit line sharing and billing
 * - Webhook subscriptions
 * - Phone numbers and message templates
 * 
 * @example
 * ```typescript
 * const client = new WhatsAppClient({
 *   phoneNumberId: 'your-phone-id',
 *   accessToken: 'your-system-user-token'
 * });
 * 
 * // Debug OAuth token from signup flow
 * const tokenInfo = await client.embeddedSignup.debugToken(oauthToken);
 * const wabaIds = tokenInfo.data.granular_scopes[0].target_ids;
 * 
 * // List shared WABAs
 * const wabas = await client.embeddedSignup.listSharedWABAs(businessId);
 * ```
 */
export class EmbeddedSignupAPI {
  constructor(private readonly client: HTTPClient) {}

  // ============================================================================
  // WABA Management
  // ============================================================================

  /**
   * Debug OAuth token to get shared WABA IDs
   * 
   * After a business completes the embedded signup flow, use the returned
   * OAuth accessToken with this method to fetch the shared WABA IDs.
   * 
   * The WABA IDs are found in the granular_scopes array under target_ids.
   * 
   * @param inputToken - OAuth user token from signup flow
   * @returns Debug token information including WABA IDs
   * 
   * @example
   * ```typescript
   * const info = await client.embeddedSignup.debugToken('EAAxxxxxx');
   * 
   * // Extract WABA IDs
   * const wabaIds = info.data.granular_scopes
   *   .find(scope => scope.scope === 'whatsapp_business_management')
   *   ?.target_ids || [];
   * 
   * console.log('Shared WABAs:', wabaIds);
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-shared-waba-id-with-accesstoken
   */
  async debugToken(inputToken: string): Promise<DebugTokenResponse> {
    return this.client.get<DebugTokenResponse>(`debug_token?input_token=${inputToken}`);
  }

  /**
   * List all shared (client) WhatsApp Business Accounts
   * 
   * Retrieves all WABAs that have been shared with your Business Manager
   * after embedded signup flow completion. These are client WABAs that
   * you manage on behalf of the business owner.
   * 
   * @param businessId - Your Business Manager ID
   * @returns List of shared WABAs with pagination
   * 
   * @example
   * ```typescript
   * const result = await client.embeddedSignup.listSharedWABAs('123456789');
   * 
   * result.data.forEach(waba => {
   *   console.log(`WABA: ${waba.name} (${waba.id})`);
   *   console.log(`Currency: ${waba.currency}`);
   *   console.log(`Namespace: ${waba.message_template_namespace}`);
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-shared-waba-id
   */
  async listSharedWABAs(businessId: string): Promise<SharedWABAsResponse> {
    return this.client.get<SharedWABAsResponse>(
      `${businessId}/client_whatsapp_business_accounts`
    );
  }

  /**
   * List owned and client WhatsApp Business Accounts
   * 
   * Retrieves all WABAs owned by or shared with your business.
   * Supports filtering by creation time and sorting.
   * 
   * @param businessId - Business Manager ID
   * @param options - Filter and sort options
   * @returns List of owned WABAs
   * 
   * @example
   * ```typescript
   * // Get all WABAs
   * const all = await client.embeddedSignup.listOwnedWABAs('123456789');
   * 
   * // Get WABAs created after timestamp
   * const recent = await client.embeddedSignup.listOwnedWABAs('123456789', {
   *   filtering: [{
   *     field: 'creation_time',
   *     operator: 'GREATER_THAN',
   *     value: '1604962813'
   *   }],
   *   sort: 'creation_time_descending'
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-owned-wabas
   */
  async listOwnedWABAs(
    businessId: string,
    options?: FilterWABAOptions
  ): Promise<SharedWABAsResponse> {
    let endpoint = `${businessId}/owned_whatsapp_business_accounts`;
    const params: string[] = [];

    if (options?.filtering) {
      params.push(`filtering=${JSON.stringify(options.filtering)}`);
    }

    if (options?.sort) {
      params.push(`sort=${options.sort}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return this.client.get<SharedWABAsResponse>(endpoint);
  }

  /**
   * Get detailed information about a specific WABA
   * 
   * Retrieves WABA details including name, currency, timezone, review status,
   * payment information, and ownership details.
   * 
   * @param wabaId - WABA ID to query
   * @param fields - Optional array of fields to retrieve
   * @returns WABA information
   * 
   * @example
   * ```typescript
   * // Get all available fields
   * const waba = await client.embeddedSignup.getWABAInfo('111111111111111', [
   *   'id', 'name', 'currency', 'timezone_id',
   *   'account_review_status', 'primary_funding_id',
   *   'owner_business_info', 'on_behalf_of_business_info'
   * ]);
   * 
   * console.log('WABA Name:', waba.name);
   * console.log('Review Status:', waba.account_review_status);
   * console.log('Owner:', waba.owner_business_info?.name);
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-waba-info
   */
  async getWABAInfo(wabaId: string, fields?: string[]): Promise<WABAInfo> {
    const fieldsList = fields?.join(',') || 'id,name,currency,timezone_id,message_template_namespace';
    return this.client.get<WABAInfo>(`${wabaId}?fields=${fieldsList}`);
  }

  // ============================================================================
  // System Users & Permissions
  // ============================================================================

  /**
   * Get users assigned to a WABA
   * 
   * Retrieves the list of system users that have been assigned to a WABA
   * with their permission tasks.
   * 
   * @param wabaId - WABA ID to query
   * @param businessId - Business ID (required for filtering)
   * @returns List of assigned users
   * 
   * @example
   * ```typescript
   * const users = await client.embeddedSignup.getAssignedUsers(
   *   '111111111111111',
   *   '222222222222222'
   * );
   * 
   * users.data.forEach(user => {
   *   console.log(`User: ${user.name || user.id}`);
   *   console.log(`Tasks: ${user.tasks.join(', ')}`);
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-system-users#verify-system-users
   */
  async getAssignedUsers(
    wabaId: string,
    businessId: string
  ): Promise<AssignedUsersResponse> {
    return this.client.get<AssignedUsersResponse>(
      `${wabaId}/assigned_users?business=${businessId}`
    );
  }

  /**
   * Add a system user to a WABA with permissions
   * 
   * Assigns a system user to a WABA and grants them specific permissions.
   * 
   * Permissions:
   * - MANAGE: Full access to manage WABA and send messages
   * - DEVELOP: Access to send messages and manage message templates
   * 
   * @param wabaId - WABA ID to add user to
   * @param params - System user ID and permissions
   * @returns Success response
   * 
   * @example
   * ```typescript
   * // Add system user with MANAGE permissions
   * await client.embeddedSignup.addSystemUser('111111111111111', {
   *   user: '333333333333333',
   *   tasks: ['MANAGE']
   * });
   * 
   * // Add with both permissions
   * await client.embeddedSignup.addSystemUser('111111111111111', {
   *   user: '333333333333333',
   *   tasks: ['MANAGE', 'DEVELOP']
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-system-users#add-system-users-to-a-whatsapp-business-account
   */
  async addSystemUser(
    wabaId: string,
    params: AddSystemUserParams
  ): Promise<SuccessResponse> {
    const tasksParam = JSON.stringify(params.tasks);
    return this.client.post<SuccessResponse>(
      `${wabaId}/assigned_users?user=${params.user}&tasks=${tasksParam}`
    );
  }

  /**
   * List all system users in a business
   * 
   * Retrieves all system users associated with a Business Manager account.
   * Use this to get system user IDs before adding them to WABAs.
   * 
   * @param businessId - Business Manager ID
   * @returns List of system users
   * 
   * @example
   * ```typescript
   * const users = await client.embeddedSignup.listSystemUsers('123456789');
   * 
   * users.data.forEach(user => {
   *   console.log(`${user.name}: ${user.id}`);
   *   console.log(`Role: ${user.role}`);
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-system-users#get-system-user-ids
   */
  async listSystemUsers(businessId: string): Promise<SystemUsersResponse> {
    return this.client.get<SystemUsersResponse>(`${businessId}/system_users`);
  }

  // ============================================================================
  // Credit Line Management
  // ============================================================================

  /**
   * Get extended credit lines for a business
   * 
   * Retrieves the credit lines (extended credits) associated with a Business Manager.
   * These are used for WhatsApp Business API billing.
   * 
   * @param businessId - Business Manager ID
   * @param fields - Optional fields to retrieve
   * @returns List of credit lines
   * 
   * @example
   * ```typescript
   * // Get basic credit info
   * const credits = await client.embeddedSignup.getExtendedCredits('123456789');
   * 
   * // Get with balance details
   * const detailed = await client.embeddedSignup.getExtendedCredits('123456789', [
   *   'id', 'legal_entity_name', 'credit_available', 'balance', 'currency'
   * ]);
   * 
   * detailed.data.forEach(credit => {
   *   console.log(`${credit.legal_entity_name}: ${credit.credit_available} cents`);
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/share-and-revoke-credit-lines#get-credit-line-id
   */
  async getExtendedCredits(
    businessId: string,
    fields?: string[]
  ): Promise<ExtendedCreditsListResponse> {
    const fieldsList = fields?.join(',') || 'id,legal_entity_name';
    return this.client.get<ExtendedCreditsListResponse>(
      `${businessId}/extendedcredits?fields=${fieldsList}`
    );
  }

  /**
   * Attach your credit line to a client's WABA
   * 
   * Shares your credit line with a client business and attaches it to their WABA.
   * This allows the client to use your credit for WhatsApp billing.
   * 
   * You will receive an aggregated invoice from Meta, and the client pays you directly.
   * 
   * @param creditLineId - Your credit line ID
   * @param params - WABA ID and currency
   * @returns Allocation config ID (credit sharing record)
   * 
   * @example
   * ```typescript
   * const result = await client.embeddedSignup.attachCreditLine(
   *   '444444444444444',
   *   {
   *     waba_id: '111111111111111',
   *     waba_currency: 'USD'
   *   }
   * );
   * 
   * console.log('Allocation Config ID:', result.allocation_config_id);
   * 
   * // Verify the credit was shared
   * await client.embeddedSignup.verifyCreditSharing(result.allocation_config_id);
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/share-and-revoke-credit-lines#share-credit-line
   */
  async attachCreditLine(
    creditLineId: string,
    params: AttachCreditLineParams
  ): Promise<AllocationConfigResponse> {
    return this.client.post<AllocationConfigResponse>(
      `${creditLineId}/whatsapp_credit_sharing_and_attach`,
      params
    );
  }

  /**
   * Verify that credit line was shared correctly
   * 
   * Validates that the credit line sharing was successful by checking
   * the allocation config and receiving credential.
   * 
   * @param allocationConfigId - Allocation config ID from attachCreditLine
   * @returns Credit sharing record with receiving credential
   * 
   * @example
   * ```typescript
   * const record = await client.embeddedSignup.verifyCreditSharing('555555555555555');
   * 
   * if (record.receiving_credential?.id) {
   *   console.log('Credit successfully shared to WABA:', record.receiving_credential.id);
   * }
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/share-and-revoke-credit-lines#verify-credit-sharing
   */
  async verifyCreditSharing(allocationConfigId: string): Promise<CreditSharingRecord> {
    return this.client.get<CreditSharingRecord>(
      `${allocationConfigId}?fields=receiving_credential{id}`
    );
  }

  /**
   * Get credit sharing record details
   * 
   * Retrieves detailed information about a credit sharing relationship,
   * including status and receiving business information.
   * 
   * @param allocationConfigId - Allocation config ID
   * @returns Credit sharing record details
   * 
   * @example
   * ```typescript
   * const record = await client.embeddedSignup.getCreditSharingRecord('555555555555555');
   * 
   * console.log('Receiving Business:', record.receiving_business?.name);
   * console.log('Status:', record.request_status);
   * 
   * if (record.request_status === 'DELETED') {
   *   console.log('Credit sharing has been revoked');
   * }
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/share-and-revoke-credit-lines#get-credit-sharing-status
   */
  async getCreditSharingRecord(allocationConfigId: string): Promise<CreditSharingRecord> {
    return this.client.get<CreditSharingRecord>(
      `${allocationConfigId}?fields=receiving_business,request_status`
    );
  }

  /**
   * Revoke credit line sharing
   * 
   * Removes credit line access from a client's WABA. The client will no longer
   * be able to use your credit for WhatsApp billing.
   * 
   * @param allocationConfigId - Allocation config ID to revoke
   * @returns Success response
   * 
   * @example
   * ```typescript
   * await client.embeddedSignup.revokeCreditSharing('555555555555555');
   * console.log('Credit line access revoked');
   * 
   * // Verify revocation
   * const record = await client.embeddedSignup.getCreditSharingRecord('555555555555555');
   * console.log('Status:', record.request_status); // Should be 'DELETED'
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/share-and-revoke-credit-lines#revoke-credit-line
   */
  async revokeCreditSharing(allocationConfigId: string): Promise<SuccessResponse> {
    return this.client.delete<SuccessResponse>(allocationConfigId);
  }

  // ============================================================================
  // WABA Subscriptions (Webhooks)
  // ============================================================================

  /**
   * Subscribe your app to a WABA for webhooks
   * 
   * Subscribes your app to receive webhook notifications for a specific WABA.
   * You only need to subscribe once per WABA to receive events for all phone numbers.
   * 
   * Before subscribing, ensure webhooks are configured in your app settings.
   * 
   * @param wabaId - WABA ID to subscribe to
   * @returns Success response
   * 
   * @example
   * ```typescript
   * await client.embeddedSignup.subscribeToWABA('111111111111111');
   * console.log('Successfully subscribed to WABA webhooks');
   * 
   * // Verify subscription
   * const subs = await client.embeddedSignup.listSubscriptions('111111111111111');
   * console.log('Active subscriptions:', subs.data.length);
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/webhooks#subscribe-to-a-whatsapp-business-account
   */
  async subscribeToWABA(wabaId: string): Promise<SuccessResponse> {
    return this.client.post<SuccessResponse>(`${wabaId}/subscribed_apps`);
  }

  /**
   * List all app subscriptions for a WABA
   * 
   * Retrieves all apps that are currently subscribed to receive webhooks
   * from a specific WABA.
   * 
   * @param wabaId - WABA ID to query
   * @returns List of subscribed apps
   * 
   * @example
   * ```typescript
   * const subscriptions = await client.embeddedSignup.listSubscriptions('111111111111111');
   * 
   * subscriptions.data.forEach(sub => {
   *   console.log(`App: ${sub.whatsapp_business_api_data.name}`);
   *   console.log(`ID: ${sub.whatsapp_business_api_data.id}`);
   *   if (sub.override_callback_uri) {
   *     console.log(`Custom webhook: ${sub.override_callback_uri}`);
   *   }
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/webhooks#get-all-subscriptions-for-a-waba
   */
  async listSubscriptions(wabaId: string): Promise<SubscriptionsResponse> {
    return this.client.get<SubscriptionsResponse>(`${wabaId}/subscribed_apps`);
  }

  /**
   * Unsubscribe your app from a WABA
   * 
   * Removes your app's webhook subscription from a WABA.
   * You will stop receiving webhook notifications for this WABA.
   * 
   * @param wabaId - WABA ID to unsubscribe from
   * @returns Success response
   * 
   * @example
   * ```typescript
   * await client.embeddedSignup.unsubscribeFromWABA('111111111111111');
   * console.log('Successfully unsubscribed from WABA');
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/webhooks#unsubscribe-from-a-whatsapp-business-account
   */
  async unsubscribeFromWABA(wabaId: string): Promise<SuccessResponse> {
    return this.client.delete<SuccessResponse>(`${wabaId}/subscribed_apps`);
  }

  /**
   * Override the callback URL for a WABA's webhooks
   * 
   * Sets an alternate webhook endpoint URL for a specific WABA.
   * This is useful when managing multiple WABAs that need different webhook URLs.
   * 
   * The alternate endpoint must be verified before setting the override.
   * Only affects 'messages' field webhooks; other fields use the default URL.
   * 
   * @param wabaId - WABA ID to set override for
   * @param params - Alternate webhook URL and verification token
   * @returns Success response
   * 
   * @example
   * ```typescript
   * await client.embeddedSignup.overrideCallbackURL('111111111111111', {
   *   override_callback_uri: 'https://alternate-endpoint.com/webhook',
   *   verify_token: 'my_verify_token_123'
   * });
   * 
   * // Verify the override was set
   * const subs = await client.embeddedSignup.listSubscriptions('111111111111111');
   * console.log('Override URL:', subs.data[0].override_callback_uri);
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/webhooks#overriding-the-callback-url
   */
  async overrideCallbackURL(
    wabaId: string,
    params: OverrideCallbackParams
  ): Promise<SuccessResponse> {
    return this.client.post<SuccessResponse>(`${wabaId}/subscribed_apps`, params);
  }

  // ============================================================================
  // Phone Numbers & Templates
  // ============================================================================

  /**
   * List phone numbers in a WABA
   * 
   * Retrieves all phone numbers associated with a WABA, with optional
   * field selection and filtering.
   * 
   * @param wabaId - WABA ID to query
   * @param options - Optional fields and filters
   * @returns List of phone numbers
   * 
   * @example
   * ```typescript
   * // Get all phone numbers
   * const phones = await client.embeddedSignup.listPhoneNumbers('111111111111111');
   * 
   * // Get with specific fields
   * const detailed = await client.embeddedSignup.listPhoneNumbers('111111111111111', {
   *   fields: ['id', 'display_phone_number', 'verified_name', 'quality_rating']
   * });
   * 
   * // Filter by account mode
   * const liveOnly = await client.embeddedSignup.listPhoneNumbers('111111111111111', {
   *   filtering: [{
   *     field: 'account_mode',
   *     operator: 'EQUAL',
   *     value: 'LIVE'
   *   }]
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-phone-numbers
   */
  async listPhoneNumbers(
    wabaId: string,
    options?: PhoneNumberFilterOptions
  ): Promise<PhoneNumbersListResponse> {
    let endpoint = `${wabaId}/phone_numbers`;
    const params: string[] = [];

    if (options?.fields) {
      params.push(`fields=${options.fields.join(',')}`);
    }

    if (options?.filtering) {
      params.push(`filtering=${JSON.stringify(options.filtering)}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return this.client.get<PhoneNumbersListResponse>(endpoint);
  }

  /**
   * Get phone number certificate and display name status
   * 
   * Retrieves the display name certificate and review status for phone numbers
   * in a WABA. Useful after display name changes to get the new certificate.
   * 
   * @param wabaId - WABA ID to query
   * @returns Phone number certificates and statuses
   * 
   * @example
   * ```typescript
   * const certs = await client.embeddedSignup.getPhoneNumberCertificate('111111111111111');
   * 
   * certs.data.forEach(phone => {
   *   console.log(`Phone: ${phone.display_phone_number}`);
   *   console.log(`Status: ${phone.name_status}`);
   *   console.log(`Certificate: ${phone.certificate}`);
   *   
   *   if (phone.new_name_status === 'APPROVED' && phone.new_certificate) {
   *     console.log(`New certificate available: ${phone.new_certificate}`);
   *   }
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-phone-numbers#get-certificate
   */
  async getPhoneNumberCertificate(
    wabaId: string
  ): Promise<{ data: PhoneNumberCertificate[] }> {
    return this.client.get<{ data: PhoneNumberCertificate[] }>(
      `${wabaId}/phone_numbers?fields=id,display_phone_number,certificate,name_status,new_certificate,new_name_status`
    );
  }

  /**
   * List message templates for a WABA
   * 
   * Retrieves all pre-approved message templates for a WABA.
   * Templates must be approved before they can be used to send messages.
   * 
   * @param wabaId - WABA ID to query
   * @returns List of message templates
   * 
   * @example
   * ```typescript
   * const templates = await client.embeddedSignup.listMessageTemplates('111111111111111');
   * 
   * templates.data.forEach(template => {
   *   console.log(`Template: ${template.name}`);
   *   console.log(`Status: ${template.status}`);
   *   console.log(`Language: ${template.language}`);
   *   console.log(`Category: ${template.category}`);
   * });
   * 
   * // Filter approved templates
   * const approved = templates.data.filter(t => t.status === 'APPROVED');
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-message-templates
   */
  async listMessageTemplates(wabaId: string): Promise<TemplateListResponse> {
    return this.client.get<TemplateListResponse>(`${wabaId}/message_templates`);
  }

  /**
   * Get message template namespace for a WABA
   * 
   * Retrieves the template namespace string for a WABA.
   * This namespace is used when referencing templates in the API.
   * 
   * @param wabaId - WABA ID to query
   * @returns WABA ID and template namespace
   * 
   * @example
   * ```typescript
   * const result = await client.embeddedSignup.getTemplateNamespace('111111111111111');
   * 
   * console.log('Template Namespace:', result.message_template_namespace);
   * // Use this namespace when sending template messages
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-message-templates#get-namespace
   */
  async getTemplateNamespace(wabaId: string): Promise<TemplateNamespaceResponse> {
    return this.client.get<TemplateNamespaceResponse>(
      `${wabaId}?fields=message_template_namespace`
    );
  }

  // ============================================================================
  // Convenience Methods for Embedded Signup Flow
  // ============================================================================

  /**
   * Get all phone numbers from a WABA
   * 
   * Retrieves all phone numbers associated with a WABA. This is useful
   * during the embedded signup flow to get the phone number ID without
   * knowing it beforehand.
   * 
   * @param wabaId - WABA ID to query
   * @returns List of phone numbers with details
   * 
   * @example
   * ```typescript
   * const phones = await client.embeddedSignup.getWABAPhoneNumbers('111111111111111');
   * 
   * phones.data.forEach(phone => {
   *   console.log(`ID: ${phone.id}`);
   *   console.log(`Number: ${phone.display_phone_number}`);
   *   console.log(`Name: ${phone.verified_name}`);
   *   console.log(`Quality: ${phone.quality_rating}`);
   * });
   * ```
   */
  async getWABAPhoneNumbers(wabaId: string): Promise<{
    data: Array<{
      id: string;
      display_phone_number: string;
      verified_name?: string;
      quality_rating?: string;
    }>;
  }> {
    return this.client.get<{
      data: Array<{
        id: string;
        display_phone_number: string;
        verified_name?: string;
        quality_rating?: string;
      }>;
    }>(`${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`);
  }

  /**
   * Get the primary (first) phone number from a WABA
   * 
   * Convenience method that returns the first phone number from a WABA.
   * This is commonly used in embedded signup flow when you expect only
   * one phone number to be registered.
   * 
   * @param wabaId - WABA ID to query
   * @returns Primary phone number details
   * @throws Error if no phone numbers found
   * 
   * @example
   * ```typescript
   * const phone = await client.embeddedSignup.getPrimaryPhoneNumber('111111111111111');
   * 
   * console.log('Phone Number ID:', phone.phoneNumberId);
   * console.log('Phone Number:', phone.phoneNumber);
   * console.log('Display Name:', phone.verifiedName);
   * ```
   */
  async getPrimaryPhoneNumber(wabaId: string): Promise<{
    phoneNumberId: string;
    phoneNumber: string;
    verifiedName?: string;
    qualityRating?: string;
  }> {
    const response = await this.getWABAPhoneNumbers(wabaId);
    
    if (!response.data || response.data.length === 0) {
      throw new Error(`No phone numbers found for WABA ${wabaId}`);
    }

    const primary = response.data[0];
    return {
      phoneNumberId: primary.id,
      phoneNumber: primary.display_phone_number,
      verifiedName: primary.verified_name,
      qualityRating: primary.quality_rating,
    };
  }

  /**
   * Extract WABA IDs from debug token response
   * 
   * Convenience method to extract WABA IDs from the granular_scopes
   * returned by debugToken.
   * 
   * @param debugResponse - Response from debugToken
   * @returns Array of WABA IDs, or empty array if none found
   * 
   * @example
   * ```typescript
   * const debugInfo = await client.embeddedSignup.debugToken(businessToken);
   * const wabaIds = client.embeddedSignup.extractWABAIds(debugInfo);
   * 
   * if (wabaIds.length > 0) {
   *   const primaryPhone = await client.embeddedSignup.getPrimaryPhoneNumber(wabaIds[0]);
   * }
   * ```
   */
  extractWABAIds(debugResponse: DebugTokenResponse): string[] {
    return debugResponse.data.granular_scopes
      ?.find(s => s.scope === 'whatsapp_business_management')
      ?.target_ids || [];
  }
}
