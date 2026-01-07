import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsAPI } from './index.js';
import type { HTTPClient } from '../client/http.js';
import type { PricingAnalyticsParams } from '../types/analytics.js';

describe('AnalyticsAPI - getPricingAnalytics', () => {
  let mockClient: HTTPClient;
  let analytics: AnalyticsAPI;
  const testWabaId = '102290129340398';

  beforeEach(() => {
    mockClient = {
      get: async (endpoint: string) => {
        // Mock successful response
        return {
          pricing_analytics: {
            data: [{
              data_points: [{
                start: 1748761200,
                end: 1748847600,
                country: 'US',
                tier: '0:2',
                pricing_type: 'REGULAR',
                pricing_category: 'AUTHENTICATION',
                volume: 1,
                cost: 1000,
              }],
            }],
          },
          id: testWabaId,
        };
      },
    } as unknown as HTTPClient;

    analytics = new AnalyticsAPI(mockClient, testWabaId);
  });

  it('should build correct Graph API fields URL', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { pricing_analytics: { data: [{ data_points: [] }] }, id: testWabaId };
    };

    const params: PricingAnalyticsParams = {
      start: 1748761200,
      end: 1749687703,
      granularity: 'DAILY',
    };

    await analytics.getPricingAnalytics(params);

    expect(capturedEndpoint).toContain(`${testWabaId}?fields=`);
    expect(capturedEndpoint).toContain('pricing_analytics');
    expect(capturedEndpoint).toContain('start(1748761200)');
    expect(capturedEndpoint).toContain('end(1749687703)');
    expect(capturedEndpoint).toContain('granularity(DAILY)');
  });

  it('should handle optional parameters', async () => {
    let capturedEndpoint = '';
    mockClient.get = async (endpoint: string) => {
      capturedEndpoint = endpoint;
      return { pricing_analytics: { data: [{ data_points: [] }] }, id: testWabaId };
    };

    const params: PricingAnalyticsParams = {
      start: 1748761200,
      end: 1749687703,
      granularity: 'DAILY',
      country_codes: ['US', 'IN'],
      dimensions: ['PRICING_CATEGORY', 'TIER'],
    };

    await analytics.getPricingAnalytics(params);

    expect(capturedEndpoint).toContain('country_codes');
    expect(capturedEndpoint).toContain('dimensions');
  });

  it('should return pricing analytics response', async () => {
    const params: PricingAnalyticsParams = {
      start: 1748761200,
      end: 1749687703,
      granularity: 'DAILY',
    };

    const response = await analytics.getPricingAnalytics(params);

    expect(response.pricing_analytics).toBeDefined();
    expect(response.id).toBe(testWabaId);
    expect(response.pricing_analytics.data[0].data_points).toHaveLength(1);
    expect(response.pricing_analytics.data[0].data_points[0].cost).toBe(1000);
  });
});
