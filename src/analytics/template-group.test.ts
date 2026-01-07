import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsAPI } from './index.js';
import type { HTTPClient } from '../client/http.js';
import type { TemplateGroupAnalyticsParams } from '../types/analytics.js';
import { ValidationError } from '../types/errors.js';

describe('AnalyticsAPI - getTemplateGroupAnalytics', () => {
  let mockClient: HTTPClient;
  let analytics: AnalyticsAPI;
  const testWabaId = '102290129340398';

  beforeEach(() => {
    mockClient = {
      get: async () => ({
        data: [{
          granularity: 'DAILY',
          product_type: 'cloud_api',
          data_points: [{
            template_group_id: '1044106240855852',
            start: 1739491200,
            end: 1739577600,
            sent: 1460,
            delivered: 1460,
            read: 1399,
          }],
        }],
      }),
    } as unknown as HTTPClient;

    analytics = new AnalyticsAPI(mockClient, testWabaId);
  });

  it('should require template_group_ids parameter', async () => {
    const params = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily' as const,
      template_group_ids: [],
    };

    await expect(analytics.getTemplateGroupAnalytics(params))
      .rejects.toThrow(ValidationError);
  });

  it('should validate template_group_ids max 10', async () => {
    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: Array(11).fill('group_id'),
    };

    await expect(analytics.getTemplateGroupAnalytics(params))
      .rejects.toThrow(ValidationError);
  });

  it('should use direct endpoint with query parameters', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { data: [{ data_points: [] }] };
    };

    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['1044106240855852'],
    };

    await analytics.getTemplateGroupAnalytics(params);

    expect(capturedEndpoint).toContain('/template_group_analytics?');
    expect(capturedEndpoint).not.toContain('fields=');
    expect(capturedEndpoint).toContain('start=');
    expect(capturedEndpoint).toContain('template_group_ids=');
  });

  it('should handle optional parameters', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { data: [{ data_points: [] }] };
    };

    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['1044106240855852'],
      metric_types: ['sent', 'delivered', 'read'],
      use_waba_timezone: true,
    };

    await analytics.getTemplateGroupAnalytics(params);

    expect(capturedEndpoint).toContain('metric_types=');
    expect(capturedEndpoint).toContain('use_waba_timezone=');
  });

  it('should return template group analytics response', async () => {
    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['1044106240855852'],
    };

    const response = await analytics.getTemplateGroupAnalytics(params);

    expect(response.data).toBeDefined();
    expect(response.data).toHaveLength(1);
    expect(response.data[0].granularity).toBe('DAILY');
    expect(response.data[0].product_type).toBe('cloud_api');
    expect(response.data[0].data_points).toHaveLength(1);
    expect(response.data[0].data_points[0].template_group_id).toBe('1044106240855852');
    expect(response.data[0].data_points[0].sent).toBe(1460);
    expect(response.data[0].data_points[0].delivered).toBe(1460);
    expect(response.data[0].data_points[0].read).toBe(1399);
  });

  it('should properly serialize template_group_ids as JSON array', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { data: [{ data_points: [] }] };
    };

    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['group1', 'group2', 'group3'],
    };

    await analytics.getTemplateGroupAnalytics(params);

    // Check that template_group_ids is JSON stringified
    expect(capturedEndpoint).toContain('template_group_ids=');
    const urlParams = new URLSearchParams(capturedEndpoint.split('?')[1]);
    const templateGroupIds = urlParams.get('template_group_ids');
    expect(templateGroupIds).toBeTruthy();
    expect(JSON.parse(templateGroupIds!)).toEqual(['group1', 'group2', 'group3']);
  });

  it('should handle string dates', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { data: [{ data_points: [] }] };
    };

    const params: TemplateGroupAnalyticsParams = {
      start: '2024-01-01',
      end: '2024-01-31',
      granularity: 'daily',
      template_group_ids: ['group1'],
    };

    await analytics.getTemplateGroupAnalytics(params);

    expect(capturedEndpoint).toContain('start=2024-01-01');
    expect(capturedEndpoint).toContain('end=2024-01-31');
  });

  it('should handle numeric timestamps', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { data: [{ data_points: [] }] };
    };

    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['group1'],
    };

    await analytics.getTemplateGroupAnalytics(params);

    expect(capturedEndpoint).toContain('start=1738465116');
    expect(capturedEndpoint).toContain('end=1739559516');
  });

  it('should handle response with timezone information', async () => {
    mockClient.get = async () => ({
      data: [{
        waba_timezone: 'America/Los_Angeles',
        granularity: 'DAILY',
        product_type: 'cloud_api',
        data_points: [{
          template_group_id: '1044106240855852',
          start: 1739491200,
          end: 1739577600,
          sent: 100,
          delivered: 95,
          read: 80,
        }],
      }],
    });

    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['1044106240855852'],
      use_waba_timezone: true,
    };

    const response = await analytics.getTemplateGroupAnalytics(params);

    expect(response.data[0].waba_timezone).toBe('America/Los_Angeles');
  });

  it('should handle response with paging information', async () => {
    mockClient.get = async () => ({
      data: [{
        granularity: 'DAILY',
        product_type: 'cloud_api',
        data_points: [{
          template_group_id: '1044106240855852',
          start: 1739491200,
          end: 1739577600,
          sent: 100,
        }],
      }],
      paging: {
        cursors: {
          before: 'before_cursor',
          after: 'after_cursor',
        },
      },
    });

    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['1044106240855852'],
    };

    const response = await analytics.getTemplateGroupAnalytics(params);

    expect(response.paging).toBeDefined();
    expect(response.paging?.cursors.before).toBe('before_cursor');
    expect(response.paging?.cursors.after).toBe('after_cursor');
  });

  it('should handle response with click and cost metrics', async () => {
    mockClient.get = async () => ({
      data: [{
        granularity: 'DAILY',
        product_type: 'cloud_api',
        data_points: [{
          template_group_id: '1044106240855852',
          start: 1739491200,
          end: 1739577600,
          sent: 100,
          delivered: 95,
          read: 80,
          clicked: [{
            type: 'url_button',
            value: 45,
          }],
          cost: [{
            type: 'amount_spent',
            value: 2300,
          }],
        }],
      }],
    });

    const params: TemplateGroupAnalyticsParams = {
      start: 1738465116,
      end: 1739559516,
      granularity: 'daily',
      template_group_ids: ['1044106240855852'],
      metric_types: ['sent', 'delivered', 'read', 'clicked', 'cost'],
    };

    const response = await analytics.getTemplateGroupAnalytics(params);

    expect(response.data[0].data_points[0].clicked).toBeDefined();
    expect(response.data[0].data_points[0].clicked).toHaveLength(1);
    expect(response.data[0].data_points[0].clicked![0].type).toBe('url_button');
    expect(response.data[0].data_points[0].clicked![0].value).toBe(45);

    expect(response.data[0].data_points[0].cost).toBeDefined();
    expect(response.data[0].data_points[0].cost).toHaveLength(1);
    expect(response.data[0].data_points[0].cost![0].type).toBe('amount_spent');
    expect(response.data[0].data_points[0].cost![0].value).toBe(2300);
  });
});
