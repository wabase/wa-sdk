import { describe, it, expect } from "vitest";
import type { WebhookMedia, WebhookMessage, WebhookStatus } from "./webhooks.js";

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

describe("Voice transcription types", () => {
  it("should accept audio with voice=true and transcription", () => {
    const message: WebhookMessage = {
      id: "msg123",
      from: "1234567890",
      timestamp: "1704556800",
      type: "audio",
      audio: {
        id: "voice123",
        mimeType: "audio/ogg",
        sha256: "hash",
        url: "https://lookaside.fbsbx.com/...",
        voice: true,
        text: "Hello, this is a test message",
      },
    };
    expect(message.audio?.voice).toBe(true);
    expect(message.audio?.text).toBe("Hello, this is a test message");
  });

  it("should accept voice message without transcription", () => {
    const message: WebhookMessage = {
      id: "msg123",
      from: "1234567890",
      timestamp: "1704556800",
      type: "audio",
      audio: {
        id: "voice123",
        mimeType: "audio/ogg",
        voice: true,
      },
    };
    expect(message.audio?.voice).toBe(true);
    expect(message.audio?.text).toBeUndefined();
  });

  it("should accept regular audio file (not voice)", () => {
    const message: WebhookMessage = {
      id: "msg123",
      from: "1234567890",
      timestamp: "1704556800",
      type: "audio",
      audio: {
        id: "audio123",
        mimeType: "audio/mp3",
      },
    };
    expect(message.audio?.voice).toBeUndefined();
    expect(message.audio?.text).toBeUndefined();
  });
});

describe("Message status types", () => {
  it("should accept 'played' status for media messages", () => {
    const status: WebhookStatus = {
      id: "msg123",
      status: "played",
      timestamp: "1704556800",
      recipientId: "1234567890",
    };
    expect(status.status).toBe("played");
  });

  it("should accept all status values", () => {
    const statuses: Array<WebhookStatus["status"]> = [
      "sent",
      "delivered",
      "read",
      "played",
      "failed",
    ];
    statuses.forEach((s) => {
      const status: WebhookStatus = {
        id: "msg123",
        status: s,
        timestamp: "1704556800",
        recipientId: "1234567890",
      };
      expect(status.status).toBe(s);
    });
  });
});
