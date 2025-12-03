/**
 * HTTP client for WhatsApp Cloud API
 */

import type { WhatsAppClientConfig } from '../types/config.js';
import {
  APIError,
  NetworkError,
  RateLimitError,
} from '../types/errors.js';
import { getSDKMetadata } from '../utils/version.js';
import type { WazapinLogger } from '../utils/logger.js';

/**
 * HTTP client for making requests to WhatsApp Cloud API
 */
export class HTTPClient {
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly accessToken: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;
  private readonly sdkVersion: string;
  private readonly userAgent: string;
  private readonly logger: WazapinLogger;

  constructor(config: WhatsAppClientConfig, logger: WazapinLogger) {
    this.baseUrl = config.baseUrl || 'https://graph.facebook.com';
    this.apiVersion = config.apiVersion || 'v18.0';
    this.accessToken = config.accessToken;
    this.timeout = config.timeout || 30000;
    
    // Bind fetch to prevent "Illegal invocation" errors in environments like Cloudflare Workers
    const fetchFn = config.fetch || globalThis.fetch;
    this.fetchImpl = fetchFn.bind(globalThis);

    // Initialize SDK metadata
    const metadata = getSDKMetadata();
    this.sdkVersion = metadata.version;
    this.userAgent = metadata.userAgent;
    this.logger = logger;

    this.logger.debug('HTTPClient initialized', {
      baseUrl: this.baseUrl,
      apiVersion: this.apiVersion,
      sdkVersion: this.sdkVersion,
    });
  }

  /**
   * Make an HTTP request to the WhatsApp API
   */
  async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;

    this.logger.debug(`${method} ${endpoint}`, body ? { body } : undefined);

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
          'Wazapin-SDK-Version': this.sdkVersion,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const data = (await response.json()) as T;
      this.logger.debug(`${method} ${endpoint} - Success`, { status: response.status });

      return data;
    } catch (error) {
      // Log error
      this.logger.error(`${method} ${endpoint} - Failed`, { error });

      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(
          `Request timeout after ${this.timeout}ms`,
          error
        );
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError('Network request failed', error);
      }

      // Re-throw API errors
      if (
        error instanceof APIError ||
        error instanceof RateLimitError ||
        error instanceof NetworkError
      ) {
        throw error;
      }

      // Unknown error
      throw new NetworkError(
        'An unexpected error occurred',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleError(response: Response): Promise<never> {
    interface ErrorResponse {
      error?: {
        message?: string;
        code?: number;
        error_subcode?: number;
        fbtrace_id?: string;
      };
    }

    let errorData: ErrorResponse;

    try {
      errorData = (await response.json()) as ErrorResponse;
    } catch {
      // If response is not JSON, create a generic error
      errorData = {
        error: {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: 0,
        },
      };
    }

    const error = errorData.error || {};
    const message = error.message || `HTTP ${response.status}: ${response.statusText}`;
    const errorCode = error.code || 0;
    const errorSubcode = error.error_subcode;
    const fbtraceId = error.fbtrace_id;

    // Handle rate limit errors
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new RateLimitError(
        message,
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    }

    // Handle other API errors
    throw new APIError(message, response.status, errorCode, errorSubcode, fbtraceId);
  }

  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    let url = endpoint;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, String(value));
      }
      url = `${endpoint}?${searchParams.toString()}`;
    }
    
    return this.request<T>('GET', url);
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * Make a POST request with multipart/form-data
   * Used for file uploads (e.g., Flow JSON)
   */
  async postMultipart<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;

    this.logger.debug(`POST (multipart) ${endpoint}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent,
          'Wazapin-SDK-Version': this.sdkVersion,
          // Note: Do NOT set Content-Type for FormData
          // Browser/Node will set it automatically with boundary
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const data = (await response.json()) as T;
      this.logger.debug(`POST (multipart) ${endpoint} - Success`, {
        status: response.status,
      });

      return data;
    } catch (error) {
      this.logger.error(`POST (multipart) ${endpoint} - Failed`, { error });

      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(
          `Request timeout after ${this.timeout}ms`,
          error
        );
      }

      if (error instanceof TypeError) {
        throw new NetworkError('Network request failed', error);
      }

      if (
        error instanceof APIError ||
        error instanceof RateLimitError ||
        error instanceof NetworkError
      ) {
        throw error;
      }

      throw new NetworkError(
        'An unexpected error occurred',
        error instanceof Error ? error : undefined
      );
    }
  }
}
