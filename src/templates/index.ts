/**
 * Template Management
 * Manage message templates for WhatsApp Business API
 * @module templates
 */

import type { HTTPClient } from '../client/http.js';
import type {
  Template,
  TemplateListResponse,
  TemplateNamespaceResponse,
  CreateTemplateParams,
  CreateAuthTemplateParams,
  CreateCatalogTemplateParams,
  EditTemplateParams,
  TemplateCreateResponse,
} from '../types/template.js';

/**
 * Template Management API
 * Provides methods to create, read, update, and delete message templates
 */
export class TemplateManagementAPI {
  constructor(
    private httpClient: HTTPClient,
    private wabaId: string,
  ) {}

  // ==================== READ OPERATIONS ====================

  /**
   * Get template by ID
   * @param templateId - Template ID
   * @param fields - Optional fields to return (comma-separated)
   * @returns Template details
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account/message_templates
   */
  async getTemplateById(templateId: string, fields?: string[]): Promise<Template> {
    const queryParams = fields ? `?fields=${fields.join(',')}` : '';
    return this.httpClient.get<Template>(`${templateId}${queryParams}`);
  }

  /**
   * Get template by name
   * @param name - Template name
   * @param fields - Optional fields to return
   * @returns Template details
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account/message_templates
   */
  async getTemplateByName(name: string, fields?: string[]): Promise<TemplateListResponse> {
    const queryParams = new URLSearchParams({ name });
    if (fields) {
      queryParams.append('fields', fields.join(','));
    }
    return this.httpClient.get<TemplateListResponse>(`${this.wabaId}/message_templates?${queryParams.toString()}`);
  }

  /**
   * Get all templates for WABA
   * @param params - Query parameters
   * @returns List of templates
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account/message_templates
   */
  async getAllTemplates(params?: {
    fields?: string[];
    limit?: number;
  }): Promise<TemplateListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.fields) {
      queryParams.append('fields', params.fields.join(','));
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    const queryString = queryParams.toString();
    return this.httpClient.get<TemplateListResponse>(`${this.wabaId}/message_templates${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get template namespace
   * @returns Template namespace
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account
   */
  async getNamespace(): Promise<TemplateNamespaceResponse> {
    return this.httpClient.get<TemplateNamespaceResponse>(`${this.wabaId}?fields=message_template_namespace`);
  }

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create a new template
   * @param params - Template parameters
   * @returns Created template response
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account/message_templates
   */
  async createTemplate(params: CreateTemplateParams): Promise<TemplateCreateResponse> {
    return this.httpClient.post<TemplateCreateResponse>(`${this.wabaId}/message_templates`, params);
  }

  /**
   * Create authentication template with OTP
   * @param params - Authentication template parameters
   * @returns Created template response
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates
   */
  async createAuthenticationTemplate(
    params: CreateAuthTemplateParams,
  ): Promise<TemplateCreateResponse> {
    const components: CreateTemplateParams['components'] = [
      {
        type: 'BODY',
        text: '*{{1}}* is your verification code. For your security, do not share this code.',
        example: {
          body_text: [['123456']],
        },
      },
      {
        type: 'FOOTER',
        text: params.security_disclaimer || 'This code expires in 10 minutes.',
      },
    ];

    if (params.button_type === 'COPY_CODE') {
      components.push({
        type: 'BUTTONS',
        buttons: [
          {
            type: 'OTP',
            otp_type: 'COPY_CODE',
            text: 'Copy code',
          },
        ],
      });
    } else if (params.button_type === 'ONE_TAP') {
      components.push({
        type: 'BUTTONS',
        buttons: [
          {
            type: 'OTP',
            otp_type: 'ONE_TAP',
            text: params.autofill_text || 'Autofill',
            autofill_text: params.autofill_text,
            package_name: params.package_name,
            signature_hash: params.signature_hash,
          },
        ],
      });
    }

    return this.createTemplate({
      name: params.name,
      language: params.language,
      category: 'AUTHENTICATION',
      components,
    });
  }

  /**
   * Create catalog template
   * @param params - Catalog template parameters
   * @returns Created template response
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/catalog-templates
   */
  async createCatalogTemplate(
    params: CreateCatalogTemplateParams,
  ): Promise<TemplateCreateResponse> {
    const components: CreateTemplateParams['components'] = [];

    if (params.header_text) {
      components.push({
        type: 'HEADER',
        format: 'TEXT',
        text: params.header_text,
      });
    }

    components.push({
      type: 'BODY',
      text: params.body_text,
    });

    if (params.footer_text) {
      components.push({
        type: 'FOOTER',
        text: params.footer_text,
      });
    }

    components.push({
      type: 'BUTTONS',
      buttons: [
        {
          type: 'CATALOG',
          text: 'View catalog',
        },
      ],
    });

    return this.createTemplate({
      name: params.name,
      language: params.language,
      category: 'MARKETING',
      components,
    });
  }

  // ==================== UPDATE & DELETE OPERATIONS ====================

  /**
   * Edit template
   * @param templateId - Template ID
   * @param params - Parameters to update
   * @returns Success response
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account/message_templates
   */
  async editTemplate(
    templateId: string,
    params: EditTemplateParams,
  ): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(templateId, params);
  }

  /**
   * Delete template by name
   * @param name - Template name
   * @returns Success response
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account/message_templates
   */
  async deleteTemplateByName(name: string): Promise<{ success: boolean }> {
    return this.httpClient.delete<{ success: boolean }>(`${this.wabaId}/message_templates?name=${encodeURIComponent(name)}`);
  }

  /**
   * Delete template by ID
   * @param templateId - Template ID
   * @returns Success response
   * @see https://developers.facebook.com/docs/graph-api/reference/whatsapp-business-account/message_templates
   */
  async deleteTemplateById(templateId: string): Promise<{ success: boolean }> {
    return this.httpClient.delete<{ success: boolean }>(templateId);
  }

  /**
   * Alias for getAllTemplates - List all templates
   * @param params - Query parameters
   * @returns List of templates
   */
  async list(params?: { fields?: string[]; limit?: number }): Promise<TemplateListResponse> {
    return this.getAllTemplates(params);
  }
}
