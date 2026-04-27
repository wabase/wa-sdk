/**
 * Analytics Tests
 * @module analytics/index.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AnalyticsAPI } from "./index.js";
import type { HTTPClient } from "../client/http.js";
import type { AnalyticsData } from "../types/analytics.js";

describe("AnalyticsAPI", () => {
  let analyticsAPI: AnalyticsAPI;
  let mockHttpClient: HTTPClient;
  const testWabaId = "waba_123456789";

  beforeEach(() => {
    mockHttpClient = {
      get: async () => ({
        data: [],
      }),
    } as unknown as HTTPClient;
    analyticsAPI = new AnalyticsAPI(mockHttpClient, testWabaId);
  });

  describe("getMessageAnalytics", () => {
    it("should get message analytics with basic params", async () => {
      const mockResponse: AnalyticsData = {
        data: [
          {
            start: 1609459200,
            end: 1609545600,
            sent: 500,
            delivered: 480,
            read: 450,
          },
        ],
      };

      mockHttpClient.get = async () => mockResponse;

      const result = await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1609545600,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].sent).toBe(500);
      expect(result.data[0].delivered).toBe(480);
      expect(result.data[0].read).toBe(450);
    });

    it("should support granularity parameter", async () => {
      let capturedEndpoint = '';
      mockHttpClient.get = async (endpoint: string) => {
        capturedEndpoint = endpoint;
        return { data: [] };
      };

      await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1612137600,
        granularity: "DAILY",
      });

      expect(capturedEndpoint).toContain("granularity=DAILY");
    });

    it("should filter by phone numbers", async () => {
      let capturedEndpoint = '';
      mockHttpClient.get = async (endpoint: string) => {
        capturedEndpoint = endpoint;
        return { data: [] };
      };

      await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1609545600,
        phone_numbers: ["+1234567890"],
      });

      expect(capturedEndpoint).toContain("phone_numbers");
    });

    it("should handle all metric types", async () => {
      const mockResponse: AnalyticsData = {
        data: [
          {
            start: 1609459200,
            end: 1609545600,
            sent: 100,
            delivered: 95,
            read: 90,
          },
        ],
      };

      mockHttpClient.get = async () => mockResponse;

      const result = await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1609545600,
      });

      expect(result.data[0]).toHaveProperty("sent");
      expect(result.data[0]).toHaveProperty("delivered");
      expect(result.data[0]).toHaveProperty("read");
    });

    it("should handle ISO 8601 date format", async () => {
      let capturedEndpoint = '';
      mockHttpClient.get = async (endpoint: string) => {
        capturedEndpoint = endpoint;
        return { data: [] };
      };

      await analyticsAPI.getMessageAnalytics({
        start: "2025-01-01T00:00:00Z",
        end: "2025-01-31T23:59:59Z",
      });

      expect(capturedEndpoint).toContain("start=2025-01-01T00%3A00%3A00Z");
    });
  });

  describe("documented aliases", () => {
    it("should expose getMessagingAnalytics as an alias for message analytics", async () => {
      let capturedEndpoint = '';
      mockHttpClient.get = async (endpoint: string) => {
        capturedEndpoint = endpoint;
        return { data: [] };
      };

      await analyticsAPI.getMessagingAnalytics({
        start: 1609459200,
        end: 1609545600,
      });

      expect(capturedEndpoint).toContain(`${testWabaId}/analytics`);
    });

    it("should expose getConversationAnalytics as an alias for conversation analytics", async () => {
      let capturedEndpoint = '';
      mockHttpClient.get = async (endpoint: string) => {
        capturedEndpoint = endpoint;
        return { conversation_analytics: { data: [] }, id: testWabaId };
      };

      await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1609545600,
        granularity: "DAILY",
      });

      expect(capturedEndpoint).toContain(`${testWabaId}?fields=`);
      expect(capturedEndpoint).toContain("conversation_analytics");
    });
  });
});
