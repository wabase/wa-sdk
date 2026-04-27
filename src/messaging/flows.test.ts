/**
 * Flows API tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowsAPI } from './flows.js';
import type { HTTPClient } from '../client/http.js';
import type {
  CreateFlowParams,
  UpdateFlowParams,
  MigrateFlowsParams,
  FlowAnalyticsParams,
  SendFlowParams,
} from '../types/flows.js';

describe('FlowsAPI', () => {
  let flows: FlowsAPI;
  let mockClient: HTTPClient;
  const wabaId = '123456789';

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      postMultipart: vi.fn(),
    } as unknown as HTTPClient;

    flows = new FlowsAPI(mockClient, wabaId);
  });

  describe('list', () => {
    it('should list all flows for a WABA', async () => {
      const mockResponse = {
        data: [
          {
            id: 'flow-1',
            name: 'Test Flow',
            status: 'DRAFT',
            categories: ['SIGN_UP'],
            validation_errors: [],
          },
        ],
        paging: {
          cursors: {
            before: 'before-cursor',
            after: 'after-cursor',
          },
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.list();

      expect(mockClient.get).toHaveBeenCalledWith(`/${wabaId}/flows`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new flow', async () => {
      const params: CreateFlowParams = {
        name: 'New Flow',
        categories: ['LEAD_GENERATION', 'CONTACT_US'],
        endpoint_uri: 'https://example.com/flow-endpoint',
      };

      const mockResponse = { id: 'flow-new' };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.create(params);

      expect(mockClient.post).toHaveBeenCalledWith(`/${wabaId}/flows`, params);
      expect(result).toEqual(mockResponse);
    });

    it('should create a flow with clone_flow_id', async () => {
      const params: CreateFlowParams = {
        name: 'Cloned Flow',
        categories: ['SURVEY'],
        clone_flow_id: 'flow-original',
      };

      const mockResponse = { id: 'flow-clone' };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.create(params);

      expect(mockClient.post).toHaveBeenCalledWith(`/${wabaId}/flows`, params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('get', () => {
    it('should get flow details', async () => {
      const flowId = 'flow-123';
      const mockResponse = {
        id: flowId,
        name: 'My Flow',
        status: 'PUBLISHED',
        categories: ['APPOINTMENT_BOOKING'],
        validation_errors: [],
        json_version: '5.0',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.get(flowId);

      expect(mockClient.get).toHaveBeenCalledWith(`/${flowId}`, {});
      expect(result).toEqual(mockResponse);
    });

    it('should get flow details with fields', async () => {
      const flowId = 'flow-123';
      const fields = ['id', 'name', 'status', 'health_status'];
      const mockResponse = {
        id: flowId,
        name: 'My Flow',
        status: 'PUBLISHED',
        health_status: {
          can_send_message: 'AVAILABLE',
          entities: [],
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.get(flowId, fields);

      expect(mockClient.get).toHaveBeenCalledWith(`/${flowId}`, {
        fields: fields.join(','),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get flow details with date format', async () => {
      const flowId = 'flow-123';
      const mockResponse = {
        id: flowId,
        name: 'My Flow',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.get(flowId, undefined, 'U');

      expect(mockClient.get).toHaveBeenCalledWith(`/${flowId}`, {
        date_format: 'U',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update flow metadata', async () => {
      const flowId = 'flow-123';
      const params: UpdateFlowParams = {
        name: 'Updated Flow Name',
        categories: ['CUSTOMER_SUPPORT', 'OTHER'],
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.update(flowId, params);

      expect(mockClient.post).toHaveBeenCalledWith(`/${flowId}`, params);
      expect(result).toEqual(mockResponse);
    });

    it('should update flow endpoint URI', async () => {
      const flowId = 'flow-123';
      const params: UpdateFlowParams = {
        endpoint_uri: 'https://new-endpoint.com/webhook',
      };

      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.update(flowId, params);

      expect(mockClient.post).toHaveBeenCalledWith(`/${flowId}`, params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a draft flow', async () => {
      const flowId = 'flow-draft';
      const mockResponse = { success: true };

      vi.mocked(mockClient.delete).mockResolvedValue(mockResponse);

      const result = await flows.delete(flowId);

      expect(mockClient.delete).toHaveBeenCalledWith(`/${flowId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('publish', () => {
    it('should publish a flow', async () => {
      const flowId = 'flow-ready';
      const mockResponse = { success: true };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.publish(flowId);

      expect(mockClient.post).toHaveBeenCalledWith(`/${flowId}/publish`, {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deprecate', () => {
    it('should deprecate a published flow', async () => {
      const flowId = 'flow-published';
      const mockResponse = { success: true };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.deprecate(flowId);

      expect(mockClient.post).toHaveBeenCalledWith(`/${flowId}/deprecate`, {});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listAssets', () => {
    it('should list flow assets', async () => {
      const flowId = 'flow-123';
      const mockResponse = {
        data: [
          {
            name: 'flow.json',
            asset_type: 'FLOW_JSON',
            download_url: 'https://example.com/download/flow.json',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.listAssets(flowId);

      expect(mockClient.get).toHaveBeenCalledWith(`/${flowId}/assets`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadJSON', () => {
    it('should upload flow JSON', async () => {
      const flowId = 'flow-123';
      const flowJSON = {
        version: '5.0',
        screens: [
          {
            id: 'WELCOME',
            layout: {
              type: 'SingleColumnLayout',
              children: [],
            },
          },
        ],
      };

      const mockResponse = {
        success: true,
        validation_errors: [],
      };

      vi.mocked(mockClient.postMultipart).mockResolvedValue(mockResponse);

      const result = await flows.uploadJSON(flowId, flowJSON);

      expect(mockClient.postMultipart).toHaveBeenCalled();
      const callArgs = vi.mocked(mockClient.postMultipart).mock.calls[0];
      expect(callArgs[0]).toBe(`/${flowId}/assets`);
      expect(callArgs[1]).toBeInstanceOf(FormData);
      expect(result).toEqual(mockResponse);
    });

    it('should return validation errors if JSON is invalid', async () => {
      const flowId = 'flow-123';
      const invalidJSON = {
        version: '5.0',
        screens: [],
      };

      const mockResponse = {
        success: true,
        validation_errors: [
          {
            error: 'INVALID_PROPERTY',
            error_type: 'JSON_SCHEMA_ERROR',
            message: 'Missing required property',
            line_start: 1,
            line_end: 1,
            column_start: 0,
            column_end: 10,
          },
        ],
      };

      vi.mocked(mockClient.postMultipart).mockResolvedValue(mockResponse);

      const result = await flows.uploadJSON(flowId, invalidJSON);

      expect(result.validation_errors).toHaveLength(1);
      expect(result.validation_errors?.[0].error).toBe('INVALID_PROPERTY');
    });
  });

  describe('getPreview', () => {
    it('should get preview URL without invalidation', async () => {
      const flowId = 'flow-123';
      const mockResponse = {
        id: flowId,
        preview: {
          preview_url: 'https://example.com/preview/token123',
          expires_at: '2024-12-31T23:59:59+0000',
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.getPreview(flowId);

      expect(mockClient.get).toHaveBeenCalledWith(`/${flowId}`, {
        fields: 'preview.invalidate(false)',
      });
      expect(result.preview?.preview_url).toBeDefined();
    });

    it('should get preview URL with invalidation', async () => {
      const flowId = 'flow-123';
      const mockResponse = {
        id: flowId,
        preview: {
          preview_url: 'https://example.com/preview/new-token',
          expires_at: '2024-12-31T23:59:59+0000',
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.getPreview(flowId, true);

      expect(mockClient.get).toHaveBeenCalledWith(`/${flowId}`, {
        fields: 'preview.invalidate(true)',
      });
      expect(result.preview?.preview_url).toBeDefined();
    });
  });

  describe('migrate', () => {
    it('should migrate flows between WABAs', async () => {
      const params: MigrateFlowsParams = {
        source_waba_id: 'source-waba-123',
      };

      const mockResponse = {
        migrated_flows: [
          {
            source_id: 'flow-1',
            source_name: 'Appointment',
            migrated_id: 'flow-new-1',
          },
        ],
        failed_flows: [],
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.migrate(params);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/${wabaId}/migrate_flows`,
        params
      );
      expect(result.migrated_flows).toHaveLength(1);
    });

    it('should migrate specific flows by name', async () => {
      const params: MigrateFlowsParams = {
        source_waba_id: 'source-waba-123',
        source_flow_names: ['Sign Up Flow', 'Lead Gen Flow'],
      };

      const mockResponse = {
        migrated_flows: [
          {
            source_id: 'flow-1',
            source_name: 'Sign Up Flow',
            migrated_id: 'flow-new-1',
          },
        ],
        failed_flows: [
          {
            source_name: 'Lead Gen Flow',
            error_code: '4233041',
            error_message: 'Flow name not found in source WABA',
          },
        ],
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.migrate(params);

      expect(result.migrated_flows).toHaveLength(1);
      expect(result.failed_flows).toHaveLength(1);
    });
  });

  describe('getAnalytics', () => {
    it('should get endpoint request count metrics', async () => {
      const flowId = 'flow-123';
      const params: FlowAnalyticsParams = {
        metric_name: 'ENDPOINT_REQUEST_COUNT',
        granularity: 'DAY',
        since: '2024-01-01',
        until: '2024-01-31',
      };

      const mockResponse = {
        id: flowId,
        metric: {
          granularity: 'DAY',
          name: 'ENDPOINT_REQUEST_COUNT',
          data_points: [
            {
              timestamp: '2024-01-01T00:00:00+0000',
              data: [{ key: 'value', value: 150 }],
            },
          ],
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.getAnalytics(flowId, params);

      expect(mockClient.get).toHaveBeenCalledWith(`/${flowId}`, {
        fields: `metric.name(${params.metric_name}).granularity(${params.granularity}).since(${params.since}).until(${params.until})`,
      });
      expect(result.metric.name).toBe('ENDPOINT_REQUEST_COUNT');
    });

    it('should get endpoint error rate metrics', async () => {
      const flowId = 'flow-123';
      const params: FlowAnalyticsParams = {
        metric_name: 'ENDPOINT_REQUEST_ERROR_RATE',
        granularity: 'LIFETIME',
        since: '2024-01-01',
        until: '2024-01-31',
      };

      const mockResponse = {
        id: flowId,
        metric: {
          granularity: 'LIFETIME',
          name: 'ENDPOINT_REQUEST_ERROR_RATE',
          data_points: [
            {
              timestamp: '2024-01-01T00:00:00+0000',
              data: [{ key: 'value', value: 0.05 }],
            },
          ],
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.getAnalytics(flowId, params);

      expect(result.metric.name).toBe('ENDPOINT_REQUEST_ERROR_RATE');
      expect(result.metric.granularity).toBe('LIFETIME');
    });
  });

  describe('encryption public key', () => {
    const phoneNumberId = '111222333';

    it('should get encryption public key', async () => {
      const mockResponse = {
        business_public_key: '-----BEGIN PUBLIC KEY-----test-----END PUBLIC KEY-----',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await flows.getEncryptionPublicKey(phoneNumberId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/${phoneNumberId}/whatsapp_business_encryption`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should set encryption public key', async () => {
      const publicKey = '-----BEGIN PUBLIC KEY-----test-----END PUBLIC KEY-----';
      const mockResponse = { success: true };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.setEncryptionPublicKey(phoneNumberId, publicKey);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/${phoneNumberId}/whatsapp_business_encryption`,
        { business_public_key: publicKey }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('send', () => {
    const phoneNumberId = '111222333';

    it('should send a published flow by ID', async () => {
      const params: SendFlowParams = {
        to: '+1234567890',
        body: {
          text: 'Complete your booking',
        },
        flow_id: 'flow-123',
        flow_cta: 'Book Now',
      };

      const mockResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.ABC123' }],
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.send(phoneNumberId, params);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/${phoneNumberId}/messages`,
        expect.objectContaining({
          messaging_product: 'whatsapp',
          to: params.to,
          type: 'interactive',
          interactive: expect.objectContaining({
            type: 'flow',
            action: expect.objectContaining({
              name: 'flow',
              parameters: expect.objectContaining({
                flow_id: 'flow-123',
                flow_cta: 'Book Now',
              }),
            }),
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should send a draft flow by name', async () => {
      const params: SendFlowParams = {
        to: '+1234567890',
        body: {
          text: 'Test this flow',
        },
        flow_name: 'Test Flow',
        flow_cta: 'Start',
        mode: 'draft',
      };

      const mockResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.XYZ789' }],
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await flows.send(phoneNumberId, params);

      const payload = vi.mocked(mockClient.post).mock.calls[0][1];
      expect(payload).toMatchObject({
        interactive: {
          type: 'flow',
          action: {
            parameters: {
              flow_name: 'Test Flow',
              mode: 'draft',
            },
          },
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should send a flow with header and footer', async () => {
      const params: SendFlowParams = {
        to: '+1234567890',
        header: {
          type: 'text',
          text: 'Welcome!',
        },
        body: {
          text: 'Start your journey',
        },
        footer: {
          text: 'Powered by WhatsApp',
        },
        flow_id: 'flow-onboarding',
        flow_cta: 'Get Started',
      };

      const mockResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.MSG123' }],
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      await flows.send(phoneNumberId, params);

      const payload = vi.mocked(mockClient.post).mock.calls[0][1];
      expect(payload).toMatchObject({
        interactive: {
          header: { type: 'text', text: 'Welcome!' },
          footer: { text: 'Powered by WhatsApp' },
        },
      });
    });

    it('should send a flow with action payload', async () => {
      const params: SendFlowParams = {
        to: '+1234567890',
        body: {
          text: 'Continue your application',
        },
        flow_id: 'flow-application',
        flow_cta: 'Continue',
        flow_action: 'navigate',
        flow_action_payload: {
          screen: 'PERSONAL_INFO',
          data: {
            first_name: 'John',
            last_name: 'Doe',
          },
        },
        flow_token: 'unique-session-token-123',
      };

      const mockResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.APP789' }],
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      await flows.send(phoneNumberId, params);

      const payload = vi.mocked(mockClient.post).mock.calls[0][1];
      expect(payload).toMatchObject({
        interactive: {
          action: {
            parameters: {
              flow_action: 'navigate',
              flow_action_payload: {
                screen: 'PERSONAL_INFO',
                data: {
                  first_name: 'John',
                  last_name: 'Doe',
                },
              },
              flow_token: 'unique-session-token-123',
            },
          },
        },
      });
    });

    it('should throw error if neither flow_id nor flow_name provided', async () => {
      const params = {
        to: '+1234567890',
        body: {
          text: 'Invalid flow',
        },
        flow_cta: 'Start',
      } as SendFlowParams;

      await expect(flows.send(phoneNumberId, params)).rejects.toThrow(
        'Either flow_id or flow_name must be provided'
      );
    });

    it('should throw error if both flow_id and flow_name provided', async () => {
      const params: SendFlowParams = {
        to: '+1234567890',
        body: {
          text: 'Conflicting flow',
        },
        flow_id: 'flow-123',
        flow_name: 'My Flow',
        flow_cta: 'Start',
      };

      await expect(flows.send(phoneNumberId, params)).rejects.toThrow(
        'Cannot use both flow_id and flow_name'
      );
    });
  });
});
