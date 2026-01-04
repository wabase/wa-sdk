/**
 * Unit tests for HTTP client
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { HTTPClient } from "./http.js";
import { APIError, NetworkError, RateLimitError } from "../types/errors.js";
import type { WhatsAppClientConfig } from "../types/config.js";
import { WazapinLogger } from "../utils/logger.js";

describe("HTTPClient", () => {
  let config: WhatsAppClientConfig;
  let mockFetch: ReturnType<typeof vi.fn>;
  let logger: WazapinLogger;

  beforeEach(() => {
    mockFetch = vi.fn();
    logger = new WazapinLogger({ level: "error" }); // Silent logger for tests
    config = {
      accessToken: "test-token",
      phoneNumberId: "123456789",
      apiVersion: "v18.0",
      baseUrl: "https://graph.facebook.com",
      timeout: 5000,
      fetch: mockFetch as unknown as typeof fetch,
    };
  });

  describe("successful requests", () => {
    it("should make a successful GET request", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HTTPClient(config, logger);
      const result = await client.get("test-endpoint");

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://graph.facebook.com/v18.0/test-endpoint",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
            "User-Agent": expect.stringMatching(/^wazapin-wa\/\d+\.\d+\.\d+/),
            "Wazapin-SDK-Version": expect.stringMatching(/^\d+\.\d+\.\d+$/),
          }),
        }),
      );
    });

    it("should make a successful POST request with body", async () => {
      const mockResponse = { id: "123" };
      const requestBody = { message: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HTTPClient(config, logger);
      const result = await client.post("test-endpoint", requestBody);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://graph.facebook.com/v18.0/test-endpoint",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestBody),
        }),
      );
    });

    it("should make a successful DELETE request", async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HTTPClient(config, logger);
      const result = await client.delete("test-endpoint");

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://graph.facebook.com/v18.0/test-endpoint",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should throw APIError for 400 status code", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({
          error: {
            message: "Invalid parameter",
            code: 100,
            error_subcode: 2,
            fbtrace_id: "trace123",
          },
        }),
        headers: new Map(),
      });

      const client = new HTTPClient(config, logger);

      await expect(client.get("test-endpoint")).rejects.toThrow(APIError);
      await expect(client.get("test-endpoint")).rejects.toThrow(
        "Invalid parameter",
      );
    });

    it("should throw APIError with correct properties", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({
          error: {
            message: "Access denied",
            code: 200,
            error_subcode: 5,
            fbtrace_id: "trace456",
          },
        }),
        headers: new Map(),
      });

      const client = new HTTPClient(config, logger);

      try {
        await client.get("test-endpoint");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        const apiError = error as APIError;
        expect(apiError.statusCode).toBe(403);
        expect(apiError.errorCode).toBe(200);
        expect(apiError.errorSubcode).toBe(5);
        expect(apiError.fbtraceId).toBe("trace456");
      }
    });

    it("should throw RateLimitError for 429 status code", async () => {
      const headers = new Map();
      headers.set("retry-after", "60");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({
          error: {
            message: "Rate limit exceeded",
            code: 4,
          },
        }),
        headers,
      });

      const client = new HTTPClient(config, logger);

      try {
        await client.get("test-endpoint");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        const rateLimitError = error as RateLimitError;
        expect(rateLimitError.retryAfter).toBe(60);
      }
    });

    it("should handle non-JSON error responses", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => {
          throw new Error("Not JSON");
        },
        headers: new Map(),
      });

      const client = new HTTPClient(config, logger);

      await expect(client.get("test-endpoint")).rejects.toThrow(APIError);
      await expect(client.get("test-endpoint")).rejects.toThrow("HTTP 500");
    });
  });

  describe("timeout handling", () => {
    it("should throw NetworkError on timeout", async () => {
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        });
      });

      const client = new HTTPClient(config, logger);

      await expect(client.get("test-endpoint")).rejects.toThrow(NetworkError);
      await expect(client.get("test-endpoint")).rejects.toThrow(
        "Request timeout",
      );
    });
  });

  describe("network errors", () => {
    it("should throw NetworkError on network failure", async () => {
      mockFetch.mockRejectedValue(new TypeError("Network request failed"));

      const client = new HTTPClient(config, logger);

      await expect(client.get("test-endpoint")).rejects.toThrow(NetworkError);
      await expect(client.get("test-endpoint")).rejects.toThrow(
        "Network request failed",
      );
    });
  });

  describe("custom fetch implementation", () => {
    it("should use custom fetch implementation", async () => {
      const customFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ custom: true }),
      });

      const customConfig = {
        ...config,
        fetch: customFetch as unknown as typeof fetch,
      };

      const client = new HTTPClient(customConfig, logger);
      await client.get("test-endpoint");

      expect(customFetch).toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("configuration", () => {
    it("should use API version v24.0 by default", async () => {
      const minimalConfig: WhatsAppClientConfig = {
        accessToken: "test-token",
        phoneNumberId: "123456789",
        fetch: mockFetch as unknown as typeof fetch,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const client = new HTTPClient(minimalConfig, logger);
      await client.get("test");

      // Verify the request URL contains v24.0
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v24.0/"),
        expect.anything(),
      );
    });

    it("should use default values when not provided", async () => {
      const minimalConfig: WhatsAppClientConfig = {
        accessToken: "test-token",
        phoneNumberId: "123456789",
        fetch: mockFetch as unknown as typeof fetch,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const client = new HTTPClient(minimalConfig, logger);
      await client.get("test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://graph.facebook.com"),
        expect.anything(),
      );
    });

    it("should use custom base URL and API version", async () => {
      const customConfig = {
        ...config,
        baseUrl: "https://custom.api.com",
        apiVersion: "v20.0",
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const client = new HTTPClient(customConfig, logger);
      await client.get("test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://custom.api.com/v20.0/test",
        expect.anything(),
      );
    });
  });
});
