import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deprecateFlow } from './flows-deprecate.js';
import type { HTTPClient } from '../client/http.js';

describe('Flow Deprecation Method', () => {
  let mockClient: HTTPClient;
  let capturedEndpoint: string;
  let capturedPayload: any;

  beforeEach(() => {
    capturedEndpoint = '';
    capturedPayload = null;
    
    mockClient = {
      post: vi.fn(async (endpoint: string, payload?: any) => {
        capturedEndpoint = endpoint;
        capturedPayload = payload;
        return {
          success: true,
          flow_id: '123456789',
          deprecated_at: Date.now(),
        };
      }),
    } as any;
  });

  it('should deprecate a flow', async () => {
    const result = await deprecateFlow(mockClient, '123456789');
    
    expect(capturedEndpoint).toBe('/123456789/deprecate');
    expect(capturedPayload).toEqual({});
    expect(result.success).toBe(true);
    expect(result.flow_id).toBe('123456789');
    expect(result.deprecated_at).toBeGreaterThan(0);
  });

  it('should handle deprecation errors', async () => {
    mockClient.post = vi.fn().mockRejectedValue(new Error('Flow not found'));
    
    await expect(
      deprecateFlow(mockClient, 'invalid_id')
    ).rejects.toThrow('Flow not found');
  });

  it('should handle already deprecated flows', async () => {
    mockClient.post = vi.fn().mockRejectedValue(new Error('Flow already deprecated'));
    
    await expect(
      deprecateFlow(mockClient, '999')
    ).rejects.toThrow('Flow already deprecated');
  });

  it('should return proper timestamp', async () => {
    const now = Date.now();
    mockClient.post = vi.fn(async () => ({
      success: true,
      flow_id: '777',
      deprecated_at: now,
    }));

    const result = await deprecateFlow(mockClient, '777');
    
    expect(result.deprecated_at).toBe(now);
  });
});
