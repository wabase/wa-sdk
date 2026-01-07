/**
 * Business Compliance Info API
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-compliance-info
 */

import type { HTTPClient } from '../client/http.js';
import type { ComplianceInfo } from '../types/account.js';

/**
 * Get compliance information for a WhatsApp Business Account
 * 
 * Retrieves regulatory requirements and restrictions for
 * the WABA based on region and business category.
 * 
 * @param client - HTTP client instance
 * @param wabaId - WhatsApp Business Account ID
 * @returns Compliance and regulatory information
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-compliance-info
 * 
 * @example
 * ```typescript
 * const info = await getComplianceInfo(client, '1234567890');
 * console.log(`Category: ${info.compliance_category}`);
 * console.log(`Country: ${info.regulatory_info.country}`);
 * ```
 */
export async function getComplianceInfo(
  client: HTTPClient,
  wabaId: string
): Promise<ComplianceInfo> {
  return client.get<ComplianceInfo>(`/${wabaId}/business_compliance_info`);
}

/**
 * Get compliance information for a specific phone number
 * 
 * Retrieves regulatory requirements and restrictions for
 * a business phone number based on region and business category.
 * 
 * @param client - HTTP client instance
 * @param phoneNumberId - Business phone number ID
 * @returns Compliance and regulatory information
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-compliance-info
 * 
 * @example
 * ```typescript
 * const info = await getPhoneComplianceInfo(client, '9876543210');
 * console.log(`Requirements: ${info.regulatory_info.requirements.join(', ')}`);
 * ```
 */
export async function getPhoneComplianceInfo(
  client: HTTPClient,
  phoneNumberId: string
): Promise<ComplianceInfo> {
  return client.get<ComplianceInfo>(`/${phoneNumberId}/business_compliance_info`);
}
