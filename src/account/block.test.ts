import { describe, it, expect, beforeEach, vi } from 'vitest';
import { blockPhoneNumber, unblockPhoneNumber } from './block.js';
import type { HTTPClient } from '../client/http.js';

describe('Block/Unblock Phone Numbers', () => {
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
        return { success: true };
      }),
    } as any;
  });

  it('should block phone number', async () => {
    const result = await blockPhoneNumber(mockClient, '123456789', '+1234567890');
    
    expect(capturedEndpoint).toBe('/123456789/block');
    expect(capturedPayload).toEqual({
      phone_number: '+1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('should unblock phone number', async () => {
    const result = await unblockPhoneNumber(mockClient, '123456789', '+1234567890');
    
    expect(capturedEndpoint).toBe('/123456789/unblock');
    expect(capturedPayload).toEqual({
      phone_number: '+1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('should handle international numbers', async () => {
    await blockPhoneNumber(mockClient, '123456789', '+44 7911 123456');
    
    expect(capturedPayload.phone_number).toBe('+44 7911 123456');
  });

  it('should handle block errors', async () => {
    mockClient.post = vi.fn().mockRejectedValue(new Error('Invalid phone number'));
    
    await expect(
      blockPhoneNumber(mockClient, '123456789', 'invalid')
    ).rejects.toThrow('Invalid phone number');
  });

  it('should handle unblock errors', async () => {
    mockClient.post = vi.fn().mockRejectedValue(new Error('Phone number not found'));
    
    await expect(
      unblockPhoneNumber(mockClient, '123456789', '+9999999999')
    ).rejects.toThrow('Phone number not found');
  });
});
