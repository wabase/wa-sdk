/**
 * Tests for Embedded Signup Flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeOnboarding, EmbeddedSignupFlow } from './flow.js';

describe('Embedded Signup Flow', () => {
  const mockFetch = vi.fn();

  const defaultParams = {
    code: 'AUTH_CODE',
    state: 'CSRF_STATE',
    appId: '1234567890',
    appSecret: 'secret123',
    redirectUri: 'https://example.com/callback',
    systemUserToken: 'SYSTEM_TOKEN',
    fetch: mockFetch,
  };

  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const setupSuccessfulMocks = () => {
    // Step 1: Token exchange
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'BUSINESS_TOKEN',
        token_type: 'bearer',
      }),
    });

    // Step 2: Debug token
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          app_id: '1234567890',
          type: 'USER',
          is_valid: true,
          granular_scopes: [
            {
              scope: 'whatsapp_business_management',
              target_ids: ['WABA_ID_123'],
            },
          ],
        },
      }),
    });

    // Step 3: Get phone numbers
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [
          {
            id: 'PHONE_ID_456',
            display_phone_number: '+1 234 567 8900',
            verified_name: 'Test Business',
            quality_rating: 'GREEN',
          },
        ],
      }),
    });

    // Step 4: Subscribe webhooks
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    // Step 5: Register phone
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    // Step 6a: Phone details
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'PHONE_ID_456',
        display_phone_number: '+1 234 567 8900',
        verified_name: 'Test Business',
        quality_rating: 'GREEN',
      }),
    });

    // Step 6b: WABA details
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'WABA_ID_123',
        name: 'Test WABA',
        account_review_status: 'APPROVED',
      }),
    });
  };

  describe('completeOnboarding', () => {
    it('should complete full onboarding flow', async () => {
      setupSuccessfulMocks();

      const result = await completeOnboarding(defaultParams);

      expect(result.wabaId).toBe('WABA_ID_123');
      expect(result.phoneNumberId).toBe('PHONE_ID_456');
      expect(result.phoneNumber).toBe('+1 234 567 8900');
      expect(result.displayName).toBe('Test Business');
      expect(result.qualityRating).toBe('GREEN');
      expect(result.accountReviewStatus).toBe('APPROVED');
      expect(result.businessToken).toBe('BUSINESS_TOKEN');
      expect(result.pin).toMatch(/^\d{6}$/);
      expect(result.webhooksSubscribed).toBe(true);
      expect(result.phoneRegistered).toBe(true);
    });

    it('should skip webhooks if autoSubscribeWebhooks is false', async () => {
      // Setup mocks without webhook call
      mockFetch
        // Step 1: Token exchange
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'BUSINESS_TOKEN' }),
        })
        // Step 2: Debug token
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              granular_scopes: [{ scope: 'whatsapp_business_management', target_ids: ['WABA_123'] }],
            },
          }),
        })
        // Step 3: Get phone numbers
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: [{ id: 'PHONE_456', display_phone_number: '+1234567890' }],
          }),
        })
        // Step 5: Register phone
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        // Step 6a: Phone details
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'PHONE_456', display_phone_number: '+1234567890' }),
        })
        // Step 6b: WABA details
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'WABA_123', name: 'Test' }),
        });

      const result = await completeOnboarding({
        ...defaultParams,
        options: { autoSubscribeWebhooks: false },
      });

      expect(result.webhooksSubscribed).toBe(false);
      expect(result.phoneRegistered).toBe(true);
    });

    it('should skip phone registration if autoRegisterPhone is false', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'BUSINESS_TOKEN' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              granular_scopes: [{ scope: 'whatsapp_business_management', target_ids: ['WABA_123'] }],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: [{ id: 'PHONE_456', display_phone_number: '+1234567890' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'PHONE_456', display_phone_number: '+1234567890' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'WABA_123', name: 'Test' }),
        });

      const result = await completeOnboarding({
        ...defaultParams,
        options: { autoRegisterPhone: false },
      });

      expect(result.phoneRegistered).toBe(false);
      expect(result.pin).toBeUndefined();
    });

    it('should use provided PIN', async () => {
      setupSuccessfulMocks();

      const result = await completeOnboarding({
        ...defaultParams,
        options: { pin: '123456' },
      });

      expect(result.pin).toBe('123456');
    });

    it('should throw if no WABA ID found', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'BUSINESS_TOKEN' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              granular_scopes: [], // No WABA IDs
            },
          }),
        });

      await expect(completeOnboarding(defaultParams)).rejects.toThrow('No WhatsApp Business Account');
    });

    it('should throw if no phone numbers found', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'BUSINESS_TOKEN' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              granular_scopes: [{ scope: 'whatsapp_business_management', target_ids: ['WABA_123'] }],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [] }), // No phone numbers
        });

      await expect(completeOnboarding(defaultParams)).rejects.toThrow('No phone number found');
    });
  });

  describe('EmbeddedSignupFlow class', () => {
    it('should complete flow using class API', async () => {
      setupSuccessfulMocks();

      const flow = new EmbeddedSignupFlow({
        systemUserToken: 'SYSTEM_TOKEN',
        fetch: mockFetch,
      });

      const result = await flow.complete({
        code: 'AUTH_CODE',
        state: 'CSRF_STATE',
        appId: '1234567890',
        appSecret: 'secret123',
        redirectUri: 'https://example.com/callback',
      });

      expect(result.wabaId).toBe('WABA_ID_123');
      expect(result.phoneNumberId).toBe('PHONE_ID_456');
    });

    it('should get WABA phone numbers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: 'PHONE_1', display_phone_number: '+1111111111' },
            { id: 'PHONE_2', display_phone_number: '+2222222222' },
          ],
        }),
      });

      const flow = new EmbeddedSignupFlow({
        systemUserToken: 'SYSTEM_TOKEN',
        fetch: mockFetch,
      });

      const result = await flow.getWABAPhoneNumbers('WABA_123');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('PHONE_1');
    });

    it('should get WABA details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'WABA_123',
          name: 'Test WABA',
          account_review_status: 'APPROVED',
        }),
      });

      const flow = new EmbeddedSignupFlow({
        systemUserToken: 'SYSTEM_TOKEN',
        fetch: mockFetch,
      });

      const result = await flow.getWABADetails('WABA_123');

      expect(result.id).toBe('WABA_123');
      expect(result.name).toBe('Test WABA');
    });
  });
});
