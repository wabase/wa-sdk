/**
 * Tests for OAuth URL Builder
 */

import { describe, it, expect, vi } from 'vitest';
import {
  generateSignupUrl,
  generateBasicOAuthUrl,
  generateStateToken,
  parseCallbackUrl,
} from './url-builder.js';

describe('OAuth URL Builder', () => {
  describe('generateStateToken', () => {
    it('should generate a UUID-like string', () => {
      const token = generateStateToken();
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateStateToken());
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('generateSignupUrl', () => {
    it('should generate a valid Meta Embedded Signup URL', () => {
      const result = generateSignupUrl({
        appId: '1234567890',
        configId: '9876543210',
        redirectUri: 'https://example.com/callback',
      });

      expect(result.url).toContain('https://www.facebook.com/');
      expect(result.url).toContain('dialog/oauth');
      expect(result.url).toContain('client_id=1234567890');
      expect(result.url).toContain('config_id=9876543210');
      expect(result.url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
      expect(result.url).toContain('response_type=code');
      expect(result.url).toContain('state=');
      expect(result.state).toBeTruthy();
    });

    it('should use provided state token', () => {
      const result = generateSignupUrl({
        appId: '1234567890',
        configId: '9876543210',
        redirectUri: 'https://example.com/callback',
        state: 'my-custom-state',
      });

      expect(result.url).toContain('state=my-custom-state');
      expect(result.state).toBe('my-custom-state');
    });

    it('should use custom API version', () => {
      const result = generateSignupUrl({
        appId: '1234567890',
        configId: '9876543210',
        redirectUri: 'https://example.com/callback',
        apiVersion: 'v22.0',
      });

      expect(result.url).toContain('facebook.com/v22.0/dialog/oauth');
    });

    it('should include extras in URL', () => {
      const result = generateSignupUrl({
        appId: '1234567890',
        configId: '9876543210',
        redirectUri: 'https://example.com/callback',
      });

      expect(result.url).toContain('extras=');
      const decodedUrl = decodeURIComponent(result.url);
      expect(decodedUrl).toContain('featureType');
      expect(decodedUrl).toContain('sessionInfoVersion');
    });

    it('should add extra params', () => {
      const result = generateSignupUrl({
        appId: '1234567890',
        configId: '9876543210',
        redirectUri: 'https://example.com/callback',
        extraParams: { custom_param: 'value' },
      });

      expect(result.url).toContain('custom_param=value');
    });
  });

  describe('generateBasicOAuthUrl', () => {
    it('should generate a basic OAuth URL with scopes', () => {
      const result = generateBasicOAuthUrl({
        appId: '1234567890',
        redirectUri: 'https://example.com/callback',
      });

      expect(result.url).toContain('https://www.facebook.com/');
      expect(result.url).toContain('dialog/oauth');
      expect(result.url).toContain('client_id=1234567890');
      expect(result.url).toContain('scope=whatsapp_business_management');
      expect(result.state).toBeTruthy();
    });

    it('should use custom scopes', () => {
      const result = generateBasicOAuthUrl({
        appId: '1234567890',
        redirectUri: 'https://example.com/callback',
        scopes: ['email', 'public_profile'],
      });

      expect(result.url).toContain('scope=email%2Cpublic_profile');
    });
  });

  describe('parseCallbackUrl', () => {
    it('should parse successful callback URL', () => {
      const result = parseCallbackUrl(
        'https://example.com/callback?code=AUTH_CODE_123&state=STATE_TOKEN_456'
      );

      expect(result.code).toBe('AUTH_CODE_123');
      expect(result.state).toBe('STATE_TOKEN_456');
      expect(result.error).toBeUndefined();
    });

    it('should parse error callback URL', () => {
      const result = parseCallbackUrl(
        'https://example.com/callback?error=access_denied&error_description=User%20cancelled'
      );

      expect(result.error).toBe('access_denied');
      expect(result.errorDescription).toBe('User cancelled');
      expect(result.code).toBeUndefined();
    });

    it('should handle missing parameters', () => {
      const result = parseCallbackUrl('https://example.com/callback');

      expect(result.code).toBeUndefined();
      expect(result.state).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });
});
