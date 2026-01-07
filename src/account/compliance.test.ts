import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getComplianceInfo, getPhoneComplianceInfo } from './compliance.js';
import type { HTTPClient } from '../client/http.js';

describe('Business Compliance Info API', () => {
  let mockClient: HTTPClient;
  let capturedEndpoint: string;

  beforeEach(() => {
    capturedEndpoint = '';
    
    mockClient = {
      get: vi.fn(async (endpoint: string) => {
        capturedEndpoint = endpoint;
        return {
          waba_id: '123456789',
          compliance_category: 'messaging',
          regulatory_info: {
            country: 'US',
            requirements: ['Consent required', '24h support'],
            restrictions: ['No spam'],
          },
        };
      }),
    } as any;
  });

  it('should get WABA compliance info', async () => {
    const result = await getComplianceInfo(mockClient, '123456789');
    
    expect(capturedEndpoint).toBe('/123456789/business_compliance_info');
    expect(result.waba_id).toBe('123456789');
    expect(result.compliance_category).toBe('messaging');
    expect(result.regulatory_info.country).toBe('US');
    expect(result.regulatory_info.requirements).toHaveLength(2);
  });

  it('should get phone number compliance info', async () => {
    const result = await getPhoneComplianceInfo(mockClient, '987654321');
    
    expect(capturedEndpoint).toBe('/987654321/business_compliance_info');
    expect(result.regulatory_info).toBeDefined();
  });

  it('should handle optional restrictions', async () => {
    mockClient.get = vi.fn(async () => ({
      compliance_category: 'marketing',
      regulatory_info: {
        country: 'GB',
        requirements: ['GDPR compliance'],
      },
    }));

    const result = await getComplianceInfo(mockClient, '555');
    
    expect(result.regulatory_info.restrictions).toBeUndefined();
    expect(result.regulatory_info.requirements).toHaveLength(1);
  });

  it('should handle country-specific requirements', async () => {
    mockClient.get = vi.fn(async () => ({
      compliance_category: 'messaging',
      regulatory_info: {
        country: 'IN',
        requirements: ['DND registry check', 'Consent verification', 'Opt-out mechanism'],
        restrictions: ['No promotional content 9PM-9AM'],
      },
    }));

    const result = await getPhoneComplianceInfo(mockClient, '999');
    
    expect(result.regulatory_info.country).toBe('IN');
    expect(result.regulatory_info.requirements.length).toBeGreaterThanOrEqual(3);
  });
});
