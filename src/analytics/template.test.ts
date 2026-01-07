import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsAPI } from './index.js';
import type { HTTPClient } from '../client/http.js';
import type { TemplateAnalyticsParams } from '../types/analytics.js';
import { ValidationError } from '../types/errors.js';

describe('AnalyticsAPI - getTemplateAnalytics', () => {
  let mockClient: HTTPClient;
  let analytics: AnalyticsAPI;
  const testWabaId = '102290129340398';

  beforeEach(() => {
    mockClient = {
      get: async () => ({
        template_analytics: {
          data: [{
            data_points: [{
              template_id: '245435364965041',
              start: 1656661480,
              end: 1656747880,
              sent: 1000,
              delivered: 950,
              read: 800,
            }],
          }],
        },
        id: testWabaId,
      }),
    } as unknown as HTTPClient;

    analytics = new AnalyticsAPI(mockClient, testWabaId);
  });

  it('should validate template_ids max 10', async () => {
    const params: TemplateAnalyticsParams = {
      start: 1656661480,
      end: 1674859480,
      granularity: 'DAILY',
      template_ids: Array(11).fill('template_id'),
    };

    await expect(analytics.getTemplateAnalytics(params))
      .rejects.toThrow(ValidationError);
  });

  it('should build correct Graph API fields URL', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { template_analytics: { data: [{ data_points: [] }] }, id: testWabaId };
    };

    const params: TemplateAnalyticsParams = {
      start: 1656661480,
      end: 1674859480,
      granularity: 'DAILY',
      template_ids: ['template1', 'template2'],
    };

    await analytics.getTemplateAnalytics(params);

    expect(capturedEndpoint).toContain('template_analytics');
    expect(capturedEndpoint).toContain('start(1656661480)');
    expect(capturedEndpoint).toContain('template_ids');
  });

  it('should handle optional metric_types parameter', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { template_analytics: { data: [{ data_points: [] }] }, id: testWabaId };
    };

    const params: TemplateAnalyticsParams = {
      start: 1656661480,
      end: 1674859480,
      granularity: 'DAILY',
      template_ids: ['template1'],
      metric_types: ['SENT', 'DELIVERED', 'READ'],
    };

    await analytics.getTemplateAnalytics(params);

    expect(capturedEndpoint).toContain('metric_types');
  });

  it('should return template analytics response', async () => {
    const params: TemplateAnalyticsParams = {
      start: 1656661480,
      end: 1674859480,
      granularity: 'DAILY',
      template_ids: ['245435364965041'],
    };

    const response = await analytics.getTemplateAnalytics(params);

    expect(response.template_analytics).toBeDefined();
    expect(response.id).toBe(testWabaId);
    expect(response.template_analytics.data[0].data_points).toHaveLength(1);
    expect(response.template_analytics.data[0].data_points[0].template_id).toBe('245435364965041');
    expect(response.template_analytics.data[0].data_points[0].sent).toBe(1000);
  });

  it('should handle click and cost metrics', async () => {
    mockClient.get = async () => ({
      template_analytics: {
        data: [{
          data_points: [{
            template_id: '245435364965041',
            start: 1656661480,
            end: 1656747880,
            sent: 1000,
            delivered: 950,
            read: 800,
            clicked: [
              { type: 'url_button', value: 150 },
              { type: 'unique_url_button', value: 120 },
            ],
            cost: [
              { type: 'amount_spent', value: 5000 },
              { type: 'cost_per_delivered', value: 526 },
            ],
          }],
        }],
      },
      id: testWabaId,
    });

    const params: TemplateAnalyticsParams = {
      start: 1656661480,
      end: 1674859480,
      granularity: 'DAILY',
      template_ids: ['245435364965041'],
      metric_types: ['SENT', 'DELIVERED', 'READ', 'CLICKED', 'COST'],
    };

    const response = await analytics.getTemplateAnalytics(params);
    const dataPoint = response.template_analytics.data[0].data_points[0];

    expect(dataPoint.clicked).toBeDefined();
    expect(dataPoint.clicked).toHaveLength(2);
    expect(dataPoint.clicked![0].type).toBe('url_button');
    expect(dataPoint.clicked![0].value).toBe(150);

    expect(dataPoint.cost).toBeDefined();
    expect(dataPoint.cost).toHaveLength(2);
    expect(dataPoint.cost![0].type).toBe('amount_spent');
    expect(dataPoint.cost![0].value).toBe(5000);
  });
});
