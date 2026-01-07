import { describe, it, expect } from 'vitest';
import type {
  PricingAnalyticsParams,
  PricingGranularity,
  PricingMetricType,
  PricingType,
  PricingCategory,
  PricingDimension,
} from './analytics.js';

describe('Pricing Analytics Types', () => {
  it('should accept valid PricingAnalyticsParams', () => {
    const params: PricingAnalyticsParams = {
      start: 1656661480,
      end: 1674859480,
      granularity: 'DAILY',
      phone_numbers: ['+1234567890'],
      country_codes: ['US', 'BR'],
      metric_types: ['COST', 'VOLUME'],
      pricing_types: ['REGULAR'],
      pricing_categories: ['AUTHENTICATION', 'MARKETING'],
      dimensions: ['COUNTRY', 'TIER'],
    };
    
    expect(params.start).toBe(1656661480);
    expect(params.granularity).toBe('DAILY');
  });

  it('should enforce correct granularity values', () => {
    const granularities: PricingGranularity[] = ['DAILY', 'HALF_HOUR', 'MONTHLY'];
    expect(granularities).toHaveLength(3);
  });
});
