/**
 * Tests for version utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSDKVersion,
  getPlatformInfo,
  getUserAgent,
  getSDKMetadata,
  clearMetadataCache,
  type PlatformInfo,
} from './version.js';

describe('Version Utils', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearMetadataCache();
  });

  describe('getSDKVersion', () => {
    it('should return SDK version from package.json', () => {
      const version = getSDKVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should return a valid semver format', () => {
      const version = getSDKVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('getPlatformInfo', () => {
    it('should return platform info with all required fields', () => {
      const info = getPlatformInfo();
      
      expect(info).toHaveProperty('nodeVersion');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('arch');
    });

    it('should return valid Node.js version', () => {
      const info = getPlatformInfo();
      expect(info.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
    });

    it('should return valid platform', () => {
      const info = getPlatformInfo();
      expect(['darwin', 'linux', 'win32', 'freebsd', 'openbsd', 'sunos', 'aix']).toContain(info.platform);
    });

    it('should return valid architecture', () => {
      const info = getPlatformInfo();
      expect(['x64', 'arm64', 'arm', 'ia32', 'mips', 'ppc', 's390', 's390x']).toContain(info.arch);
    });
  });

  describe('getUserAgent', () => {
    it('should generate RFC 9110 compliant User-Agent', () => {
      const platform: PlatformInfo = {
        nodeVersion: 'v18.17.0',
        platform: 'linux',
        arch: 'x64',
      };

      const ua = getUserAgent('1.0.0', platform);
      expect(ua).toBe('wazapin-wa/1.0.0 (Node/v18.17.0; linux; x64)');
    });

    it('should handle different versions', () => {
      const platform: PlatformInfo = {
        nodeVersion: 'v20.0.0',
        platform: 'darwin',
        arch: 'arm64',
      };

      const ua = getUserAgent('2.5.3', platform);
      expect(ua).toBe('wazapin-wa/2.5.3 (Node/v20.0.0; darwin; arm64)');
    });

    it('should start with product name and version', () => {
      const platform: PlatformInfo = {
        nodeVersion: 'v18.17.0',
        platform: 'linux',
        arch: 'x64',
      };

      const ua = getUserAgent('1.0.0', platform);
      expect(ua).toMatch(/^wazapin-wa\/\d+\.\d+\.\d+/);
    });

    it('should include platform details in parentheses', () => {
      const platform: PlatformInfo = {
        nodeVersion: 'v18.17.0',
        platform: 'linux',
        arch: 'x64',
      };

      const ua = getUserAgent('1.0.0', platform);
      expect(ua).toMatch(/\(Node\/v[\d.]+; \w+; \w+\)$/);
    });
  });

  describe('getSDKMetadata', () => {
    it('should return complete metadata', () => {
      const metadata = getSDKMetadata();

      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('userAgent');
      expect(metadata).toHaveProperty('platform');
    });

    it('should return valid version', () => {
      const metadata = getSDKMetadata();
      expect(metadata.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should return valid User-Agent', () => {
      const metadata = getSDKMetadata();
      expect(metadata.userAgent).toMatch(/^wazapin-wa\/\d+\.\d+\.\d+ \(Node\/v[\d.]+; \w+; \w+\)$/);
    });

    it('should return valid platform info', () => {
      const metadata = getSDKMetadata();
      
      expect(metadata.platform).toHaveProperty('nodeVersion');
      expect(metadata.platform).toHaveProperty('platform');
      expect(metadata.platform).toHaveProperty('arch');
    });

    it('should cache metadata for performance', () => {
      const metadata1 = getSDKMetadata();
      const metadata2 = getSDKMetadata();

      // Should return the same object reference (cached)
      expect(metadata1).toBe(metadata2);
    });

    it('should respect cache clearing', () => {
      const metadata1 = getSDKMetadata();
      clearMetadataCache();
      const metadata2 = getSDKMetadata();

      // Should return different object references after cache clear
      expect(metadata1).not.toBe(metadata2);
      
      // But values should still be the same
      expect(metadata1.version).toBe(metadata2.version);
      expect(metadata1.userAgent).toBe(metadata2.userAgent);
    });
  });
});
