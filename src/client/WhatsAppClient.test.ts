/**
 * Unit tests for WhatsAppClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppClient } from './WhatsAppClient.js';
import type { WhatsAppClientConfig } from '../types/config.js';

describe('WhatsAppClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let config: WhatsAppClientConfig;

  beforeEach(() => {
    mockFetch = vi.fn();
    config = {
      accessToken: 'test-token',
      phoneNumberId: '123456789',
      fetch: mockFetch as unknown as typeof fetch,
    };
  });

  describe('initialization', () => {
    it('should initialize with required config', () => {
      const client = new WhatsAppClient(config);

      expect(client).toBeDefined();
      expect(client.messages).toBeDefined();
      expect(client.media).toBeDefined();
      expect(client.webhooks).toBeDefined();
    });

    it('should initialize with validation enabled', () => {
      const configWithValidation: WhatsAppClientConfig = {
        ...config,
        validation: 'strict',
      };

      const client = new WhatsAppClient(configWithValidation);

      expect(client).toBeDefined();
    });

    it('should initialize with retry config', () => {
      const configWithRetry: WhatsAppClientConfig = {
        ...config,
        retry: {
          maxRetries: 5,
          initialDelay: 2000,
        },
      };

      const client = new WhatsAppClient(configWithRetry);

      expect(client).toBeDefined();
    });
  });

  describe('messages namespace', () => {
    it('should have all message methods', () => {
      const client = new WhatsAppClient(config);

      expect(client.messages.sendText).toBeDefined();
      expect(client.messages.sendImage).toBeDefined();
      expect(client.messages.sendVideo).toBeDefined();
      expect(client.messages.sendAudio).toBeDefined();
      expect(client.messages.sendDocument).toBeDefined();
      expect(client.messages.sendSticker).toBeDefined();
      expect(client.messages.sendLocation).toBeDefined();
      expect(client.messages.sendContact).toBeDefined();
      expect(client.messages.sendReaction).toBeDefined();
      expect(client.messages.sendInteractiveButtons).toBeDefined();
      expect(client.messages.sendInteractiveList).toBeDefined();
      expect(client.messages.sendTemplate).toBeDefined();
      expect(client.messages.markAsRead).toBeDefined();
    });

    it('should send text message', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '1234567890', wa_id: '1234567890' }],
          messages: [{ id: 'wamid.123' }],
        }),
      });

      const client = new WhatsAppClient(config);
      const result = await client.messages.sendText({
        to: '1234567890',
        text: 'Hello',
      });

      expect(result.messages[0].id).toBe('wamid.123');
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('media namespace', () => {
    it('should have all media methods', () => {
      const client = new WhatsAppClient(config);

      expect(client.media.upload).toBeDefined();
      expect(client.media.download).toBeDefined();
      expect(client.media.getUrl).toBeDefined();
      expect(client.media.delete).toBeDefined();
    });
  });

  describe('webhooks namespace', () => {
    it('should have all webhook methods', () => {
      const client = new WhatsAppClient(config);

      expect(client.webhooks.parse).toBeDefined();
      expect(client.webhooks.verify).toBeDefined();
    });

    it('should parse webhook payload', () => {
      const client = new WhatsAppClient(config);
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '1234567890',
                    phone_number_id: '123456789',
                  },
                  contacts: [
                    {
                      profile: { name: 'John' },
                      wa_id: '1234567890',
                    },
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'wamid.123',
                      timestamp: '1234567890',
                      type: 'text',
                      text: { body: 'Hello' },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = client.webhooks.parse(payload);

      expect(result).toBeDefined();
      expect(result.object).toBe('whatsapp_business_account');
    });
  });

  describe('retry integration', () => {
    it('should retry failed requests', async () => {
      vi.useFakeTimers();

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            messaging_product: 'whatsapp',
            contacts: [{ input: '1234567890', wa_id: '1234567890' }],
            messages: [{ id: 'wamid.123' }],
          }),
        });

      const configWithRetry: WhatsAppClientConfig = {
        ...config,
        retry: {
          maxRetries: 2,
          initialDelay: 100,
        },
      };

      const client = new WhatsAppClient(configWithRetry);
      const promise = client.messages.sendText({
        to: '1234567890',
        text: 'Hello',
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.messages[0].id).toBe('wamid.123');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      vi.restoreAllMocks();
    });
  });

  describe('validation integration', () => {
    it('should validate in strict mode', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '1234567890', wa_id: '1234567890' }],
          messages: [{ id: 'wamid.123' }],
        }),
      });

      const configWithValidation: WhatsAppClientConfig = {
        ...config,
        validation: 'strict',
      };

      const client = new WhatsAppClient(configWithValidation);
      const result = await client.messages.sendText({
        to: '+1234567890',
        text: 'Hello',
      });

      expect(result.messages[0].id).toBe('wamid.123');
    });

    it('should skip validation in off mode', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '1234567890', wa_id: '1234567890' }],
          messages: [{ id: 'wamid.123' }],
        }),
      });

      const configWithValidation: WhatsAppClientConfig = {
        ...config,
        validation: 'off',
      };

      const client = new WhatsAppClient(configWithValidation);
      const result = await client.messages.sendText({
        to: '1234567890',
        text: 'Hello',
      });

      expect(result.messages[0].id).toBe('wamid.123');
    });
  });

  describe('account namespace', () => {
    it('should have getMessagingLimit method', () => {
      const client = new WhatsAppClient(config);

      expect(client.account).toBeDefined();
      expect(client.account.getMessagingLimit).toBeDefined();
      expect(typeof client.account.getMessagingLimit).toBe('function');
    });

    it('should get messaging limit successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          whatsapp_business_manager_messaging_limit: 'TIER_250',
          id: '123456789',
        }),
      });

      const client = new WhatsAppClient(config);
      const result = await client.account.getMessagingLimit();

      expect(result.whatsapp_business_manager_messaging_limit).toBe('TIER_250');
      expect(result.id).toBe('123456789');
    });
  });
});
