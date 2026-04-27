/**
 * Flow Messages API
 * @see https://developers.facebook.com/docs/whatsapp/flows
 */

import type { HTTPClient } from '../client/http.js';
import type {
  FlowDetails,
  FlowListResponse,
  CreateFlowParams,
  UpdateFlowParams,
  FlowCreateResponse,
  FlowSuccessResponse,
  FlowAssetsResponse,
  UploadFlowJSONResponse,
  MigrateFlowsParams,
  FlowMigrationResult,
  FlowAnalyticsParams,
  FlowAnalyticsResponse,
  FlowEncryptionPublicKeyResponse,
  SendFlowParams,
} from '../types/flows.js';
import type { MessageResponse } from '../types/responses.js';

/**
 * Flows API class
 */
export class FlowsAPI {
  constructor(
    private readonly client: HTTPClient,
    private readonly wabaId: string
  ) {}

  /**
   * List all flows for a WABA
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#list-flows
   */
  async list(): Promise<FlowListResponse> {
    return this.client.get<FlowListResponse>(`/${this.wabaId}/flows`);
  }

  /**
   * Create a new flow
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#create-flow
   */
  async create(params: CreateFlowParams): Promise<FlowCreateResponse> {
    return this.client.post<FlowCreateResponse>(`/${this.wabaId}/flows`, params);
  }

  /**
   * Get flow details
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#get-flow
   */
  async get(
    flowId: string,
    fields?: string[],
    dateFormat?: string
  ): Promise<FlowDetails> {
    const params: Record<string, string> = {};
    
    if (fields && fields.length > 0) {
      params.fields = fields.join(',');
    }
    
    if (dateFormat) {
      params.date_format = dateFormat;
    }

    return this.client.get<FlowDetails>(`/${flowId}`, params);
  }

  /**
   * Update flow metadata
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#update-flow
   */
  async update(flowId: string, params: UpdateFlowParams): Promise<FlowSuccessResponse> {
    return this.client.post<FlowSuccessResponse>(`/${flowId}`, params);
  }

  /**
   * Delete a flow (only DRAFT flows can be deleted)
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#delete-flow
   */
  async delete(flowId: string): Promise<FlowSuccessResponse> {
    return this.client.delete<FlowSuccessResponse>(`/${flowId}`);
  }

  /**
   * Publish a flow (makes it immutable)
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#publish-flow
   */
  async publish(flowId: string): Promise<FlowSuccessResponse> {
    return this.client.post<FlowSuccessResponse>(`/${flowId}/publish`, {});
  }

  /**
   * Deprecate a published flow
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#deprecate-flow
   */
  async deprecate(flowId: string): Promise<FlowSuccessResponse> {
    return this.client.post<FlowSuccessResponse>(`/${flowId}/deprecate`, {});
  }

  /**
   * List assets attached to a flow
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#list-assets
   */
  async listAssets(flowId: string): Promise<FlowAssetsResponse> {
    return this.client.get<FlowAssetsResponse>(`/${flowId}/assets`);
  }

  /**
   * Upload flow JSON file
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#upload-flow-json
   */
  async uploadJSON(flowId: string, flowJSON: object): Promise<UploadFlowJSONResponse> {
    // Convert flow JSON object to string
    const flowJSONString = JSON.stringify(flowJSON);
    
    // Create form data for multipart/form-data upload
    const formData = new FormData();
    const blob = new Blob([flowJSONString], { type: 'application/json' });
    formData.append('file', blob, 'flow.json');
    formData.append('name', 'flow.json');
    formData.append('asset_type', 'FLOW_JSON');

    return this.client.postMultipart<UploadFlowJSONResponse>(
      `/${flowId}/assets`,
      formData
    );
  }

  /**
   * Get preview URL for a flow
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#get-preview
   */
  async getPreview(flowId: string, invalidate = false): Promise<FlowDetails> {
    return this.client.get<FlowDetails>(
      `/${flowId}`,
      { fields: `preview.invalidate(${invalidate})` }
    );
  }

  /**
   * Migrate flows from one WABA to another
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/manage/flows#migrate-flows
   */
  async migrate(params: MigrateFlowsParams): Promise<FlowMigrationResult> {
    return this.client.post<FlowMigrationResult>(
      `/${this.wabaId}/migrate_flows`,
      params
    );
  }

  /**
   * Get flow analytics metrics
   * @see https://developers.facebook.com/docs/whatsapp/flows/guides/healthmonitoring
   */
  async getAnalytics(
    flowId: string,
    params: FlowAnalyticsParams
  ): Promise<FlowAnalyticsResponse> {
    const queryParams = {
      fields: `metric.name(${params.metric_name}).granularity(${params.granularity}).since(${params.since}).until(${params.until})`,
    };

    return this.client.get<FlowAnalyticsResponse>(`/${flowId}`, queryParams);
  }

  /**
   * Get the public key used for WhatsApp Flows data channel encryption
   * @see https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint
   */
  async getEncryptionPublicKey(
    phoneNumberId: string
  ): Promise<FlowEncryptionPublicKeyResponse> {
    return this.client.get<FlowEncryptionPublicKeyResponse>(
      `/${phoneNumberId}/whatsapp_business_encryption`
    );
  }

  /**
   * Set the public key used for WhatsApp Flows data channel encryption
   * @see https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint
   */
  async setEncryptionPublicKey(
    phoneNumberId: string,
    businessPublicKey: string
  ): Promise<FlowSuccessResponse> {
    return this.client.post<FlowSuccessResponse>(
      `/${phoneNumberId}/whatsapp_business_encryption`,
      { business_public_key: businessPublicKey }
    );
  }

  /**
   * Send a flow message to a user
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/messages/interactive-flow-messages
   */
  async send(phoneNumberId: string, params: SendFlowParams): Promise<MessageResponse> {
    // Validate that either flow_id or flow_name is provided
    if (!params.flow_id && !params.flow_name) {
      throw new Error('Either flow_id or flow_name must be provided');
    }

    if (params.flow_id && params.flow_name) {
      throw new Error('Cannot use both flow_id and flow_name');
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'interactive',
      interactive: {
        type: 'flow',
        ...(params.header && { header: params.header }),
        body: params.body,
        ...(params.footer && { footer: params.footer }),
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: params.flow_message_version || '3',
            ...(params.flow_id && { flow_id: params.flow_id }),
            ...(params.flow_name && { flow_name: params.flow_name }),
            flow_cta: params.flow_cta,
            ...(params.mode && { mode: params.mode }),
            ...(params.flow_token && { flow_token: params.flow_token }),
            ...(params.flow_action && { flow_action: params.flow_action }),
            ...(params.flow_action_payload && {
              flow_action_payload: params.flow_action_payload,
            }),
          },
        },
      },
    };

    return this.client.post<MessageResponse>(`/${phoneNumberId}/messages`, payload);
  }
}
