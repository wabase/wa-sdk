/**
 * SDK version and platform detection utilities
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Platform information
 */
export interface PlatformInfo {
  /**
   * Node.js version (e.g., "v18.17.0")
   */
  nodeVersion: string;

  /**
   * Operating system platform (e.g., "linux", "darwin", "win32")
   */
  platform: string;

  /**
   * CPU architecture (e.g., "x64", "arm64")
   */
  arch: string;
}

/**
 * SDK metadata
 */
export interface SDKMetadata {
  /**
   * SDK version (e.g., "1.0.0")
   */
  version: string;

  /**
   * User-Agent string (RFC 9110 compliant)
   */
  userAgent: string;

  /**
   * Platform information
   */
  platform: PlatformInfo;
}

// Cache for SDK metadata (performance optimization)
let cachedMetadata: SDKMetadata | null = null;

function isPackageMetadata(value: unknown): value is { version?: string } {
  return typeof value === 'object' && value !== null;
}

/**
 * Get SDK version from package.json
 * @returns SDK version string
 */
export function getSDKVersion(): string {
  try {
    // Get the directory of the current module
    const currentDir = typeof __dirname !== 'undefined'
      ? __dirname
      : dirname(fileURLToPath(import.meta.url));

    // Read package.json from project root
    const packageJsonPath = join(currentDir, '..', '..', 'package.json');
    const packageJson: unknown = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    if (isPackageMetadata(packageJson) && typeof packageJson.version === 'string') {
      return packageJson.version;
    }

    return '1.0.0';
  } catch {
    // Fallback version if package.json cannot be read
    return '1.0.0';
  }
}

/**
 * Get current platform information
 * @returns Platform information object
 */
export function getPlatformInfo(): PlatformInfo {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

/**
 * Generate User-Agent string (RFC 9110 compliant)
 * Format: <product>/<version> (<comment>)
 * Example: wazapin-wa/1.0.0 (Node/v18.17.0; linux; x64)
 *
 * @param version - SDK version
 * @param platform - Platform information
 * @returns User-Agent string
 */
export function getUserAgent(version: string, platform: PlatformInfo): string {
  return `wazapin-wa/${version} (Node/${platform.nodeVersion}; ${platform.platform}; ${platform.arch})`;
}

/**
 * Get complete SDK metadata (cached for performance)
 * @returns SDK metadata object
 */
export function getSDKMetadata(): SDKMetadata {
  if (cachedMetadata) {
    return cachedMetadata;
  }

  const version = getSDKVersion();
  const platform = getPlatformInfo();
  const userAgent = getUserAgent(version, platform);

  cachedMetadata = {
    version,
    userAgent,
    platform,
  };

  return cachedMetadata;
}

/**
 * Clear cached metadata (useful for testing)
 * @internal
 */
export function clearMetadataCache(): void {
  cachedMetadata = null;
}
