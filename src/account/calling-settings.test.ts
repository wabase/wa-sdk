import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCallingSettings, updateCallingSettings } from './calling-settings.js';
import type { HTTPClient } from '../client/http.js';

describe('Calling Settings API', () => {
  let mockClient: HTTPClient;
  let capturedEndpoint: string;
  let capturedPayload: any;

  beforeEach(() => {
    capturedEndpoint = '';
    capturedPayload = null;
    
    mockClient = {
      get: vi.fn(async (endpoint: string) => {
        capturedEndpoint = endpoint;
        return {
          calling_enabled: true,
          calling_webhook_url: 'https://example.com/calls',
        };
      }),
      post: vi.fn(async (endpoint: string, payload?: any) => {
        capturedEndpoint = endpoint;
        capturedPayload = payload;
        return {
          calling_enabled: payload?.calling_enabled ?? true,
          calling_webhook_url: payload?.calling_webhook_url,
        };
      }),
    } as any;
  });

  it('should get calling settings', async () => {
    const result = await getCallingSettings(mockClient, '123456789');
    
    expect(capturedEndpoint).toBe('/123456789/calling_settings');
    expect(result.calling_enabled).toBe(true);
    expect(result.calling_webhook_url).toBe('https://example.com/calls');
  });

  it('should update calling settings with all params', async () => {
    const result = await updateCallingSettings(mockClient, '123456789', {
      calling_enabled: true,
      calling_webhook_url: 'https://new-webhook.com/calls',
    });
    
    expect(capturedEndpoint).toBe('/123456789/calling_settings');
    expect(capturedPayload).toEqual({
      calling_enabled: true,
      calling_webhook_url: 'https://new-webhook.com/calls',
    });
    expect(result.calling_enabled).toBe(true);
  });

  it('should update calling settings with partial params', async () => {
    const result = await updateCallingSettings(mockClient, '123456789', {
      calling_enabled: false,
    });
    
    expect(capturedPayload.calling_enabled).toBe(false);
    expect(capturedPayload.calling_webhook_url).toBeUndefined();
  });

  it('should handle empty webhook URL', async () => {
    const result = await updateCallingSettings(mockClient, '123456789', {
      calling_enabled: true,
      calling_webhook_url: '',
    });
    
    expect(capturedPayload.calling_webhook_url).toBe('');
  });
});
