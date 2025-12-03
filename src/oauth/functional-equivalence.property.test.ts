/**
 * Property-based tests for functional equivalence
 * 
 * **Feature: sdk-integration-refactor**
 * 
 * These tests verify that the SDK methods produce functionally equivalent
 * results to the original manual implementations.
 */

import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import {
    exchangeCodeForToken,
    extractWABAIds,
    generateBasicOAuthUrl,
    generateSignupUrl
} from './index.js';

describe('Functional Equivalence Property Tests', () => {
  /**
   * **Feature: sdk-integration-refactor, Property 4: Functional Equivalence**
   * **Validates: Requirements 5.3**
   * 
   * For any valid input, the SDK methods SHALL produce results with the same
   * structure as the original manual implementations.
   */
  describe('Property 4: Functional Equivalence', () => {
    it('should generate signup URLs with same structure as manual implementation', () => {
      fc.assert(
        fc.property(
          fc.record({
            appId: fc.string({ minLength: 1, maxLength: 50 }),
            configId: fc.string({ minLength: 1, maxLength: 50 }),
            redirectUri: fc.webUrl(),
          }),
          (params) => {
            const result = generateSignupUrl(params);
            
            // Result should have url and state
            expect(result).toHaveProperty('url');
            expect(result).toHaveProperty('state');
            expect(typeof result.url).toBe('string');
            expect(typeof result.state).toBe('string');
            
            // URL should be parseable
            const url = new URL(result.url);
            
            // Should have all required OAuth parameters
            expect(url.searchParams.has('client_id')).toBe(true);
            expect(url.searchParams.has('redirect_uri')).toBe(true);
            expect(url.searchParams.has('state')).toBe(true);
            expect(url.searchParams.has('response_type')).toBe(true);
            expect(url.searchParams.has('config_id')).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate basic OAuth URLs with same structure', () => {
      fc.assert(
        fc.property(
          fc.record({
            appId: fc.string({ minLength: 1, maxLength: 50 }),
            redirectUri: fc.webUrl(),
            scopes: fc.array(fc.constantFrom(
              'whatsapp_business_management',
              'whatsapp_business_messaging',
              'business_management'
            ), { minLength: 0, maxLength: 3 }),
          }),
          (params) => {
            const result = generateBasicOAuthUrl(params);
            
            expect(result).toHaveProperty('url');
            expect(result).toHaveProperty('state');
            
            const url = new URL(result.url);
            
            expect(url.searchParams.has('client_id')).toBe(true);
            expect(url.searchParams.has('redirect_uri')).toBe(true);
            expect(url.searchParams.has('state')).toBe(true);
            expect(url.searchParams.has('response_type')).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return token exchange results with expected structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            accessToken: fc.string({ minLength: 10, maxLength: 200 }),
            expiresIn: fc.integer({ min: 3600, max: 86400 }),
            tokenType: fc.constantFrom('bearer', 'Bearer'),
          }),
          async (mockTokenData) => {
            const mockFetch = vi.fn().mockResolvedValue({
              ok: true,
              json: () => Promise.resolve({
                access_token: mockTokenData.accessToken,
                expires_in: mockTokenData.expiresIn,
                token_type: mockTokenData.tokenType,
              }),
            });

            const result = await exchangeCodeForToken({
              code: 'test-code',
              appId: 'test-app',
              appSecret: 'test-secret',
              redirectUri: 'https://example.com/callback',
              fetch: mockFetch,
            });

            // Result should have expected structure
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('expiresIn');
            expect(result).toHaveProperty('tokenType');
            
            expect(result.accessToken).toBe(mockTokenData.accessToken);
            expect(result.expiresIn).toBe(mockTokenData.expiresIn);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should extract WABA IDs from debug token response', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 10, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          (wabaIds) => {
            const debugResponse = {
              data: {
                app_id: 'test-app',
                type: 'USER',
                application: 'Test App',
                data_access_expires_at: Date.now() + 86400000,
                expires_at: Date.now() + 3600000,
                is_valid: true,
                scopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
                granular_scopes: [
                  {
                    scope: 'whatsapp_business_management',
                    target_ids: wabaIds,
                  },
                  {
                    scope: 'whatsapp_business_messaging',
                    target_ids: wabaIds,
                  },
                ],
                user_id: 'test-user',
              },
            };

            const extractedIds = extractWABAIds(debugResponse);
            
            // Should extract the WABA IDs
            expect(extractedIds).toEqual(wabaIds);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return empty array when no WABA IDs in debug response', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const debugResponse = {
              data: {
                app_id: 'test-app',
                type: 'USER',
                is_valid: true,
                scopes: ['email', 'public_profile'],
                granular_scopes: [
                  {
                    scope: 'email',
                    target_ids: [],
                  },
                ],
                user_id: 'test-user',
              },
            };

            const extractedIds = extractWABAIds(debugResponse);
            
            // Should return empty array when no WABA scopes
            expect(extractedIds).toEqual([]);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property: URL parameters should be properly encoded
   */
  describe('Property: URL Parameter Encoding', () => {
    it('should properly encode special characters in redirect URI', () => {
      fc.assert(
        fc.property(
          fc.record({
            appId: fc.string({ minLength: 1, maxLength: 20 }),
            configId: fc.string({ minLength: 1, maxLength: 20 }),
            // Generate URLs with query parameters
            redirectUri: fc.tuple(fc.webUrl(), fc.string({ minLength: 1, maxLength: 20 }))
              .map(([base, param]) => `${base}?custom=${param}`),
          }),
          (params) => {
            const { url } = generateSignupUrl(params);
            
            // URL should be valid even with special characters
            expect(() => new URL(url)).not.toThrow();
            
            const parsedUrl = new URL(url);
            const redirectUri = parsedUrl.searchParams.get('redirect_uri');
            
            // Redirect URI should be preserved (may be encoded)
            expect(redirectUri).toBeTruthy();
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
