/**
 * Tests for OAuth Token Exchange
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeCodeForToken, debugToken, extractWABAIds } from './token-exchange.js';

describe('OAuth Token Exchange', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for access token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'EAAxxxxxx',
          token_type: 'bearer',
          expires_in: 3600,
        }),
      });

      const result = await exchangeCodeForToken({
        code: 'AUTH_CODE',
        appId: '1234567890',
        appSecret: 'secret123',
        redirectUri: 'https://example.com/callback',
        fetch: mockFetch,
      });

      expect(result.accessToken).toBe('EAAxxxxxx');
      expect(result.tokenType).toBe('bearer');
      expect(result.expiresIn).toBe(3600);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('oauth/access_token'),
        expect.any(Object)
      );
    });

    it('should throw OAuthError on code already used', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: {
            message: 'This authorization code has been used.',
            type: 'OAuthException',
            code: 100,
            error_subcode: 36009,
          },
        }),
      });

      await expect(exchangeCodeForToken({
        code: 'USED_CODE',
        appId: '1234567890',
        appSecret: 'secret123',
        redirectUri: 'https://example.com/callback',
        fetch: mockFetch,
      })).rejects.toThrow('already been used');
    });

    it('should throw OAuthError on code expired', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: {
            message: 'This authorization code has expired.',
            type: 'OAuthException',
            code: 100,
            error_subcode: 36007,
          },
        }),
      });

      await expect(exchangeCodeForToken({
        code: 'EXPIRED_CODE',
        appId: '1234567890',
        appSecret: 'secret123',
        redirectUri: 'https://example.com/callback',
        fetch: mockFetch,
      })).rejects.toThrow('expired');
    });

    it('should throw OAuthError on no token in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await expect(exchangeCodeForToken({
        code: 'AUTH_CODE',
        appId: '1234567890',
        appSecret: 'secret123',
        redirectUri: 'https://example.com/callback',
        fetch: mockFetch,
      })).rejects.toThrow('No access token');
    });
  });

  describe('debugToken', () => {
    it('should debug token and return info', async () => {
      const debugResponse = {
        data: {
          app_id: '1234567890',
          type: 'USER',
          application: 'My App',
          data_access_expires_at: 1234567890,
          expires_at: 1234567890,
          is_valid: true,
          scopes: ['whatsapp_business_management'],
          granular_scopes: [
            {
              scope: 'whatsapp_business_management',
              target_ids: ['111111111111111', '222222222222222'],
            },
          ],
          user_id: '9999999999999',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(debugResponse),
      });

      const result = await debugToken('business_token', 'system_token', {
        fetch: mockFetch,
      });

      expect(result.data.app_id).toBe('1234567890');
      expect(result.data.granular_scopes).toHaveLength(1);
      expect(result.data.granular_scopes![0].target_ids).toContain('111111111111111');
    });

    it('should throw on invalid token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: {
            message: 'Invalid OAuth access token.',
            type: 'OAuthException',
            code: 190,
          },
        }),
      });

      await expect(debugToken('invalid_token', 'system_token', {
        fetch: mockFetch,
      })).rejects.toThrow('Invalid OAuth access token');
    });
  });

  describe('extractWABAIds', () => {
    it('should extract WABA IDs from debug response', () => {
      const debugResponse = {
        data: {
          granular_scopes: [
            {
              scope: 'whatsapp_business_management',
              target_ids: ['111111111111111', '222222222222222'],
            },
            {
              scope: 'other_scope',
              target_ids: ['333333333333333'],
            },
          ],
        },
      };

      const wabaIds = extractWABAIds(debugResponse);
      expect(wabaIds).toEqual(['111111111111111', '222222222222222']);
    });

    it('should return empty array if no WABA scope', () => {
      const debugResponse = {
        data: {
          granular_scopes: [
            {
              scope: 'other_scope',
              target_ids: ['333333333333333'],
            },
          ],
        },
      };

      const wabaIds = extractWABAIds(debugResponse);
      expect(wabaIds).toEqual([]);
    });

    it('should return empty array if no granular_scopes', () => {
      const debugResponse = {
        data: {},
      };

      const wabaIds = extractWABAIds(debugResponse);
      expect(wabaIds).toEqual([]);
    });
  });
});
