/**
 * Property-based tests for OAuth module
 * 
 * **Feature: sdk-integration-refactor**
 * 
 * These tests verify correctness properties of the OAuth implementation
 * using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { OAuthHelper, generateBasicOAuthUrl, generateSignupUrl, generateStateToken } from './index.js';

describe('OAuth Property Tests', () => {
  /**
   * **Feature: sdk-integration-refactor, Property 2: CSRF State Token Uniqueness**
   * **Validates: Requirements 5.3, 6.2**
   * 
   * For any two calls to generate state token, the generated tokens SHALL be different.
   */
  describe('Property 2: CSRF State Token Uniqueness', () => {
    it('should generate unique state tokens across multiple calls', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          (count) => {
            const tokens = new Set<string>();
            
            for (let i = 0; i < count; i++) {
              tokens.add(generateStateToken());
            }
            
            // All tokens should be unique
            expect(tokens.size).toBe(count);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid UUID format state tokens', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // No input needed
          () => {
            const token = generateStateToken();
            
            // Should be valid UUID v4 format
            expect(token).toMatch(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate unique state tokens via OAuthHelper', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 50 }),
          (count) => {
            const oauth = new OAuthHelper();
            const tokens = new Set<string>();
            
            for (let i = 0; i < count; i++) {
              tokens.add(oauth.generateStateToken());
            }
            
            expect(tokens.size).toBe(count);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate unique state tokens via generateSignupUrl', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 20 }),
          (count) => {
            const states = new Set<string>();
            
            for (let i = 0; i < count; i++) {
              const { state } = generateSignupUrl({
                appId: 'test-app-id',
                configId: 'test-config-id',
                redirectUri: 'https://example.com/callback',
              });
              states.add(state);
            }
            
            expect(states.size).toBe(count);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: sdk-integration-refactor, Property: OAuth URL Generation Consistency**
   * **Validates: Requirements 6.1, 6.3**
   * 
   * For any valid input parameters, the generated OAuth URL SHALL contain
   * all required parameters in the correct format.
   */
  describe('Property: OAuth URL Generation Consistency', () => {
    it('should generate valid OAuth URLs with all required parameters', () => {
      fc.assert(
        fc.property(
          fc.record({
            appId: fc.string({ minLength: 1, maxLength: 50 }),
            configId: fc.string({ minLength: 1, maxLength: 50 }),
            redirectUri: fc.webUrl(),
          }),
          (params) => {
            const { url, state } = generateSignupUrl(params);
            
            // URL should be valid
            expect(() => new URL(url)).not.toThrow();
            
            const parsedUrl = new URL(url);
            
            // Should be Facebook OAuth endpoint
            expect(parsedUrl.hostname).toBe('www.facebook.com');
            expect(parsedUrl.pathname).toMatch(/^\/v\d+\.\d+\/dialog\/oauth$/);
            
            // Should contain required parameters
            expect(parsedUrl.searchParams.get('client_id')).toBe(params.appId);
            expect(parsedUrl.searchParams.get('config_id')).toBe(params.configId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(params.redirectUri);
            expect(parsedUrl.searchParams.get('state')).toBe(state);
            expect(parsedUrl.searchParams.get('response_type')).toBe('code');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate valid basic OAuth URLs', () => {
      fc.assert(
        fc.property(
          fc.record({
            appId: fc.string({ minLength: 1, maxLength: 50 }),
            redirectUri: fc.webUrl(),
          }),
          (params) => {
            const { url, state } = generateBasicOAuthUrl(params);
            
            const parsedUrl = new URL(url);
            
            expect(parsedUrl.hostname).toBe('www.facebook.com');
            expect(parsedUrl.searchParams.get('client_id')).toBe(params.appId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(params.redirectUri);
            expect(parsedUrl.searchParams.get('state')).toBe(state);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
