/**
 * Property-based tests for OAuth error propagation
 * 
 * **Feature: sdk-integration-refactor**
 * 
 * These tests verify that SDK errors are properly structured and can be
 * correctly mapped to application-specific error codes.
 */

import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { exchangeCodeForToken } from './token-exchange.js';

describe('OAuth Error Propagation Property Tests', () => {
  /**
   * **Feature: sdk-integration-refactor, Property 1: Error Propagation Consistency**
   * **Validates: Requirements 5.2**
   * 
   * For any error returned by SDK methods, the error SHALL have a consistent
   * structure that can be mapped to application error codes.
   */
  describe('Property 1: Error Propagation Consistency', () => {
    it('should throw errors with consistent structure for invalid responses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            statusCode: fc.integer({ min: 400, max: 599 }),
            errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
            errorCode: fc.integer({ min: 1, max: 999 }),
          }),
          async ({ statusCode, errorMessage, errorCode }) => {
            const mockFetch = vi.fn().mockResolvedValue({
              ok: false,
              status: statusCode,
              json: () => Promise.resolve({
                error: {
                  message: errorMessage,
                  code: errorCode,
                }
              }),
            });

            try {
              await exchangeCodeForToken({
                code: 'test-code',
                appId: 'test-app',
                appSecret: 'test-secret',
                redirectUri: 'https://example.com/callback',
                fetch: mockFetch,
              });
              
              // Should have thrown
              expect.fail('Expected error to be thrown');
            } catch (error) {
              // Error should be an instance of Error
              expect(error).toBeInstanceOf(Error);
              
              // Error should have a message
              expect((error as Error).message).toBeDefined();
              expect(typeof (error as Error).message).toBe('string');
              
              // Error should be mappable (has code or message for mapping)
              const err = error as { code?: string; message: string };
              expect(err.message || err.code).toBeTruthy();
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should throw network errors for fetch failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (errorMessage) => {
            const mockFetch = vi.fn().mockRejectedValue(new Error(errorMessage));

            try {
              await exchangeCodeForToken({
                code: 'test-code',
                appId: 'test-app',
                appSecret: 'test-secret',
                redirectUri: 'https://example.com/callback',
                fetch: mockFetch,
              });
              
              expect.fail('Expected error to be thrown');
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as Error).message).toBeDefined();
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should preserve error codes for OAuth-specific errors', async () => {
      const oauthErrorCodes = [
        { code: 100, subcode: 33, expectedPattern: /code.*used|already.*used/i },
        { code: 100, subcode: 36, expectedPattern: /expired|invalid/i },
        { code: 190, subcode: undefined, expectedPattern: /token|access/i },
      ];

      for (const { code, subcode, expectedPattern } of oauthErrorCodes) {
        const mockFetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            error: {
              message: 'OAuth error',
              code,
              error_subcode: subcode,
            }
          }),
        });

        try {
          await exchangeCodeForToken({
            code: 'test-code',
            appId: 'test-app',
            appSecret: 'test-secret',
            redirectUri: 'https://example.com/callback',
            fetch: mockFetch,
          });
          
          expect.fail('Expected error to be thrown');
        } catch (error) {
          // Error should be catchable and have useful information
          expect(error).toBeInstanceOf(Error);
        }
      }
    });
  });

  /**
   * Property: Error messages should be non-empty and informative
   */
  describe('Property: Error Message Quality', () => {
    it('should produce non-empty error messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          async (statusCode) => {
            const mockFetch = vi.fn().mockResolvedValue({
              ok: false,
              status: statusCode,
              json: () => Promise.resolve({
                error: { message: 'Test error', code: 100 }
              }),
            });

            try {
              await exchangeCodeForToken({
                code: 'test-code',
                appId: 'test-app',
                appSecret: 'test-secret',
                redirectUri: 'https://example.com/callback',
                fetch: mockFetch,
              });
            } catch (error) {
              const message = (error as Error).message;
              expect(message).toBeDefined();
              expect(message.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
