/**
 * Phone Number Management
 * Manage phone numbers associated with WhatsApp Business Account
 * @module account/phone-numbers
 */

import type { HTTPClient } from '../client/http.js';
import type {
  PhoneNumberDetails,
  PhoneNumbersListResponse,
  RequestVerificationCodeParams,
  VerifyCodeParams,
  SetTwoStepPinParams,
  DisplayNameStatusResponse,
  PhoneNumberFilterParams,
} from '../types/phone-numbers.js';

/**
 * Phone Number Management API
 * Provides methods to manage phone numbers in WhatsApp Business Account
 */
export class PhoneNumbersAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Get all phone numbers associated with WABA
   * @param wabaId - WhatsApp Business Account ID
   * @param params - Optional filter parameters
   * @returns List of phone numbers
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage-phone-numbers
   */
  async getPhoneNumbers(
    wabaId: string,
    params?: PhoneNumberFilterParams,
  ): Promise<PhoneNumbersListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.fields) {
      queryParams.append('fields', params.fields.join(','));
    }

    if (params?.filtering) {
      queryParams.append('filtering', JSON.stringify(params.filtering));
    }

    const queryString = queryParams.toString();
    const url = `${wabaId}/phone_numbers${queryString ? `?${queryString}` : ''}`;

    return this.httpClient.get<PhoneNumbersListResponse>(url);
  }

  /**
   * Get phone number details by ID
   * @param phoneNumberId - Phone number ID to query (optional, uses client's phoneNumberId if not provided)
   * @returns Phone number details
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage-phone-numbers
   */
  async getPhoneNumberById(
    phoneNumberId?: string,
  ): Promise<PhoneNumberDetails> {
    const id = phoneNumberId || this.phoneNumberId;
    return this.httpClient.get<PhoneNumberDetails>(id);
  }

  /**
   * Get display name status for a phone number (Beta)
   * @param phoneNumberId - Phone number ID to query (optional, uses client's phoneNumberId if not provided)
   * @returns Display name status
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage-phone-numbers
   */
  async getDisplayNameStatus(
    phoneNumberId?: string,
  ): Promise<DisplayNameStatusResponse> {
    const id = phoneNumberId || this.phoneNumberId;
    return this.httpClient.get<DisplayNameStatusResponse>(`${id}?fields=name_status`);
  }

  /**
   * Request verification code via SMS or voice call
   * Phone numbers must be verified before they can be used to send messages
   * @param params - Verification request parameters
   * @param phoneNumberId - Phone number ID (optional, uses client's phoneNumberId if not provided)
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#verify
   */
  async requestVerificationCode(
    params: RequestVerificationCodeParams,
    phoneNumberId?: string,
  ): Promise<{ success: boolean }> {
    const id = phoneNumberId || this.phoneNumberId;
    return this.httpClient.post<{ success: boolean }>(`${id}/request_code`, params);
  }

  /**
   * Verify the code received via SMS or voice call
   * @param params - Verification code parameters
   * @param phoneNumberId - Phone number ID (optional, uses client's phoneNumberId if not provided)
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#verify
   */
  async verifyCode(
    params: VerifyCodeParams,
    phoneNumberId?: string,
  ): Promise<{ success: boolean }> {
    const id = phoneNumberId || this.phoneNumberId;
    return this.httpClient.post<{ success: boolean }>(`${id}/verify_code`, params);
  }

  /**
   * Set or update two-step verification PIN
   * Two-step verification adds an extra layer of security to your account
   * @param params - PIN parameters
   * @param phoneNumberId - Phone number ID (optional, uses client's phoneNumberId if not provided)
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#two-step
   */
  async setTwoStepPin(
    params: SetTwoStepPinParams,
    phoneNumberId?: string,
  ): Promise<{ success: boolean }> {
    const id = phoneNumberId || this.phoneNumberId;
    return this.httpClient.post<{ success: boolean }>(id, params);
  }

  /**
   * Alias for getPhoneNumbers - List all phone numbers in WABA
   * @param wabaId - WhatsApp Business Account ID
   * @param params - Optional filter parameters
   * @returns List of phone numbers
   */
  async list(wabaId: string, params?: PhoneNumberFilterParams): Promise<PhoneNumbersListResponse> {
    return this.getPhoneNumbers(wabaId, params);
  }

  /**
   * Alias for getPhoneNumberById - Get phone number details
   * @param phoneNumberId - Phone number ID (optional, uses client's phoneNumberId if not provided)
   * @returns Phone number details
   */
  async get(phoneNumberId?: string): Promise<PhoneNumberDetails> {
    return this.getPhoneNumberById(phoneNumberId);
  }
}
