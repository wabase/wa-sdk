import { describe, it, expect } from 'vitest';
import type {
  BlockResponse,
  CallingSettings,
  UpdateCallingSettingsParams,
  ComplianceInfo,
} from './account.js';

describe('Account Types', () => {
  it('should accept valid BlockResponse', () => {
    const response: BlockResponse = {
      success: true,
    };
    
    expect(response.success).toBe(true);
  });

  it('should accept valid CallingSettings', () => {
    const settings: CallingSettings = {
      calling_enabled: true,
      calling_webhook_url: 'https://example.com/webhook',
      calling_dedup_id: 'dedup_123',
    };
    
    expect(settings.calling_enabled).toBe(true);
  });

  it('should accept partial UpdateCallingSettingsParams', () => {
    const params: UpdateCallingSettingsParams = {
      calling_enabled: true,
    };
    
    expect(params.calling_enabled).toBe(true);
    expect(params.calling_webhook_url).toBeUndefined();
  });

  it('should accept valid ComplianceInfo', () => {
    const info: ComplianceInfo = {
      waba_id: '123456789',
      compliance_category: 'messaging',
      regulatory_info: {
        country: 'US',
        requirements: ['Consent required', '24h support'],
        restrictions: ['No spam'],
      },
    };
    
    expect(info.regulatory_info.country).toBe('US');
    expect(info.regulatory_info.requirements).toHaveLength(2);
  });
});
