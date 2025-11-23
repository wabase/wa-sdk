/**
 * Business Profile operations
 */

import type { HTTPClient } from '../client/http.js';
import type { Validator } from '../validation/validator.js';
import type {
  BusinessProfileResponse,
  UpdateBusinessProfileParams,
  UpdateBusinessProfileResponse,
} from '../types/account.js';
import {
  businessProfileResponseSchema,
  updateBusinessProfileParamsSchema,
  updateBusinessProfileResponseSchema,
} from '../validation/schemas/account.js';

/**
 * Get the current business profile for a WhatsApp Business phone number
 * 
 * Retrieves information about your business profile including:
 * - About text (business description)
 * - Business address
 * - Detailed description
 * - Contact email
 * - Profile picture URL
 * - Business vertical/category
 * - Website URLs
 * 
 * **Available Fields**:
 * - `about`: Business description (max 139 characters)
 * - `address`: Business address (max 256 characters)
 * - `description`: Extended description (max 512 characters)
 * - `email`: Contact email (max 128 characters)
 * - `messaging_product`: Always "whatsapp"
 * - `profile_picture_url`: Profile picture URL (read-only)
 * - `vertical`: Business category (RETAIL, RESTAURANT, etc.)
 * - `websites`: Array of website URLs (max 2)
 * 
 * @param client - HTTP client instance for API communication
 * @param phoneNumberId - WhatsApp Business phone number ID
 * @param fields - Optional array of specific fields to retrieve
 * @param validator - Optional validator for runtime validation
 * 
 * @returns Business profile information
 * 
 * @throws {APIError} When API request fails
 * @throws {NetworkError} When network request fails
 * 
 * @example
 * ```typescript
 * // Get all profile fields
 * const profile = await getBusinessProfile(
 *   client,
 *   'phone-number-id'
 * );
 * console.log('About:', profile.data[0].about);
 * console.log('Email:', profile.data[0].email);
 * 
 * // Get specific fields only
 * const basicProfile = await getBusinessProfile(
 *   client,
 *   'phone-number-id',
 *   ['about', 'email', 'websites']
 * );
 * ```
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
 */
export async function getBusinessProfile(
  client: HTTPClient,
  phoneNumberId: string,
  fields?: string[],
  validator?: Validator
): Promise<BusinessProfileResponse> {
  const fieldsParam = fields?.length
    ? fields.join(',')
    : 'about,address,description,email,messaging_product,profile_picture_url,vertical,websites';

  const response = await client.get<BusinessProfileResponse>(
    `${phoneNumberId}/whatsapp_business_profile?fields=${fieldsParam}`
  );

  if (validator) {
    return validator.validate(businessProfileResponseSchema, response);
  }

  return response;
}

/**
 * Update the business profile for a WhatsApp Business phone number
 * 
 * Allows you to update various aspects of your business profile:
 * - About text (short business description)
 * - Business address
 * - Detailed description
 * - Contact email
 * - Profile picture (via media handle)
 * - Business vertical/category
 * - Website URLs
 * 
 * **Field Limits**:
 * - `about`: Maximum 139 characters
 * - `address`: Maximum 256 characters
 * - `description`: Maximum 512 characters
 * - `email`: Maximum 128 characters, must be valid email
 * - `websites`: Maximum 2 URLs
 * 
 * **Business Vertical Options**:
 * AUTOMOTIVE, BEAUTY, APPAREL, EDU, ENTERTAIN, EVENT_PLAN, FINANCE,
 * GROCERY, GOVT, HOTEL, HEALTH, NONPROFIT, PROF_SERVICES, RETAIL,
 * TRAVEL, RESTAURANT, OTHER
 * 
 * @param client - HTTP client instance for API communication
 * @param phoneNumberId - WhatsApp Business phone number ID
 * @param params - Business profile update parameters
 * @param validator - Optional validator for runtime validation
 * 
 * @returns Success response
 * 
 * @throws {APIError} When API request fails
 * @throws {NetworkError} When network request fails
 * @throws {ValidationError} When params validation fails
 * 
 * @example
 * ```typescript
 * // Update complete profile
 * await updateBusinessProfile(
 *   client,
 *   'phone-number-id',
 *   {
 *     messaging_product: 'whatsapp',
 *     about: 'Your friendly neighborhood business',
 *     address: '123 Main St, City, Country',
 *     description: 'We provide excellent service with quality products...',
 *     email: 'contact@business.com',
 *     vertical: 'RETAIL',
 *     websites: ['https://business.com', 'https://shop.business.com']
 *   }
 * );
 * 
 * // Update partial profile
 * await updateBusinessProfile(
 *   client,
 *   'phone-number-id',
 *   {
 *     messaging_product: 'whatsapp',
 *     about: 'New business description',
 *     email: 'newemail@business.com'
 *   }
 * );
 * 
 * // Update with profile picture
 * const mediaHandle = await uploadMedia(...);
 * await updateBusinessProfile(
 *   client,
 *   'phone-number-id',
 *   {
 *     messaging_product: 'whatsapp',
 *     profile_picture_handle: mediaHandle.id
 *   }
 * );
 * ```
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles
 */
export async function updateBusinessProfile(
  client: HTTPClient,
  phoneNumberId: string,
  params: UpdateBusinessProfileParams,
  validator?: Validator
): Promise<UpdateBusinessProfileResponse> {
  if (validator) {
    validator.validate(updateBusinessProfileParamsSchema, params);
  }

  // Build payload with messaging_product (if not already provided)
  const payload = {
    ...params,
    messaging_product: params.messaging_product || 'whatsapp',
  };

  const response = await client.post<UpdateBusinessProfileResponse>(
    `${phoneNumberId}/whatsapp_business_profile`,
    payload
  );

  if (validator) {
    return validator.validate(updateBusinessProfileResponseSchema, response);
  }

  return response;
}
