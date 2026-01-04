/**
 * Typing Indicators Tests (API v24.0)
 * @module messages/typing.test
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { TypingIndicatorAPI } from "./typing.js";
import type { HttpClient } from "../client/http.js";

describe("TypingIndicatorAPI (v24.0)", () => {
  let typingAPI: TypingIndicatorAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = "123456789";
  const testRecipient = "628123456789";

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    typingAPI = new TypingIndicatorAPI(mockHttpClient, testPhoneNumberId);
  });

  describe("sendTypingIndicator", () => {
    it("should send typing indicator with v24.0 format", async () => {
      const mockResponse = { success: true };
      (mockHttpClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      await typingAPI.sendTypingIndicator({
        to: testRecipient,
        state: "composing",
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${testPhoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: testRecipient,
          type: "typing",
          typing: {
            state: "composing",
          },
        },
      );
    });

    it("should work with different recipient numbers", async () => {
      const mockResponse = { success: true };
      const recipients = ["628123456789", "6281234567890", "14155551234"];

      (mockHttpClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      for (const recipient of recipients) {
        await typingAPI.sendTypingIndicator({
          to: recipient,
          state: "composing",
        });

        const callArgs = (mockHttpClient.post as ReturnType<typeof vi.fn>).mock.calls[
          (mockHttpClient.post as ReturnType<typeof vi.fn>).mock.calls.length - 1
        ][1];
        expect(callArgs.to).toBe(recipient);
        expect(callArgs.type).toBe("typing");
        expect(callArgs.typing.state).toBe("composing");
      }
    });
  });
});
