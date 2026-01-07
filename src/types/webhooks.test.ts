import { describe, it, expect } from "vitest";
import type { WebhookMedia, WebhookMessage } from "./webhooks.js";

describe("WebhookMedia types", () => {
  it("should accept media with URL (v23.0+)", () => {
    const media: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
      sha256: "hash123",
      url: "https://lookaside.fbsbx.com/media/v1/...",
    };
    expect(media.url).toBe("https://lookaside.fbsbx.com/media/v1/...");
  });

  it("should accept media without URL (v20.0-v22.0)", () => {
    const media: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
      sha256: "hash123",
    };
    expect(media.url).toBeUndefined();
  });

  it("should type-check image message with URL", () => {
    const message: WebhookMessage = {
      id: "msg123",
      from: "1234567890",
      timestamp: "1704556800",
      type: "image",
      image: {
        id: "img123",
        mimeType: "image/jpeg",
        sha256: "hash",
        url: "https://lookaside.fbsbx.com/...",
        caption: "Test image",
      },
    };
    expect(message.image?.url).toBeDefined();
  });
});
