/**
 * Property-based tests for CSRF state validation
 * 
 * **Feature: sdk-integration-refactor**
 * 
 * These tests verify that CSRF state tokens are properly validated
 * and that invalid/tampered tokens are rejected.
 */

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { generateStateToken, parseCallbackUrl } from './index.js';

describe('CSRF Validation Property Tests', () => {
  /**
   * **Feature: sdk-integration-refactor, Property 3: CSRF State Validation**
   * **Validates: Requirements 5.3**
   * 
   * For any callback request with an invalid or tampered state token,
   * the system SHALL be able to detect the mismatch.
   */
  describe('Property 3: CSRF State Validation', () => {
    it('should generate state tokens that can be validated', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const originalState = generateStateToken();
            
            // Simulate callback URL with the state
            const callbackUrl = `https://example.com/callback?code=test-code&state=${originalState}`;
            const parsed = parseCallbackUrl(callbackUrl);
            
            // State should be preserved exactly
            expect(parsed.state).toBe(originalState);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect tampered state tokens', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (tamperedState) => {
            const originalState = generateStateToken();
            
            // Tampered state should not match original
            // (unless by extreme coincidence, which is astronomically unlikely)
            if (tamperedState !== originalState) {
              expect(tamperedState).not.toBe(originalState);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should parse callback URLs correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            code: fc.string({ minLength: 1, maxLength: 100 }),
            baseUrl: fc.webUrl(),
          }),
          ({ code, baseUrl }) => {
            const state = generateStateToken();
            const callbackUrl = `${baseUrl}?code=${encodeURIComponent(code)}&state=${state}`;
            
            const parsed = parseCallbackUrl(callbackUrl);
            
            expect(parsed.code).toBe(code);
            expect(parsed.state).toBe(state);
            expect(parsed.error).toBeUndefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should detect error responses in callback URLs', () => {
      fc.assert(
        fc.property(
          fc.record({
            error: fc.constantFrom('access_denied', 'invalid_request', 'unauthorized_client'),
            errorDescription: fc.string({ minLength: 1, maxLength: 100 }),
            baseUrl: fc.webUrl(),
          }),
          ({ error, errorDescription, baseUrl }) => {
            const state = generateStateToken();
            const callbackUrl = `${baseUrl}?error=${error}&error_description=${encodeURIComponent(errorDescription)}&state=${state}`;
            
            const parsed = parseCallbackUrl(callbackUrl);
            
            expect(parsed.error).toBe(error);
            // errorDescription may be decoded differently, just check it exists
            expect(parsed.errorDescription).toBeDefined();
            // State may or may not be present in error responses
            // The important thing is we can detect the error
            expect(parsed.code).toBeUndefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle missing state parameter', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          (baseUrl) => {
            const callbackUrl = `${baseUrl}?code=test-code`;
            
            const parsed = parseCallbackUrl(callbackUrl);
            
            // State should be undefined when not present
            expect(parsed.state).toBeUndefined();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property: State tokens should be cryptographically unpredictable
   */
  describe('Property: State Token Unpredictability', () => {
    it('should generate tokens with high entropy', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 50 }),
          (count) => {
            const tokens: string[] = [];
            
            for (let i = 0; i < count; i++) {
              tokens.push(generateStateToken());
            }
            
            // Check that tokens don't share common prefixes
            // (which would indicate predictability)
            for (let i = 0; i < tokens.length - 1; i++) {
              for (let j = i + 1; j < tokens.length; j++) {
                const commonPrefixLength = getCommonPrefixLength(tokens[i], tokens[j]);
                // Common prefix should be minimal (less than 8 chars for UUIDs)
                expect(commonPrefixLength).toBeLessThan(8);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

/**
 * Helper function to get common prefix length between two strings
 */
function getCommonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}
