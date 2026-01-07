import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMediaUrl } from "./media-helper.js";
import type { WhatsAppClient } from "../client/index.js";
import type { WebhookMedia } from "../types/webhooks.js";

describe("getMediaUrl", () => {
  let mockClient: Pick<WhatsAppClient, "media">;

  beforeEach(() => {
    mockClient = {
      media: {
        getUrl: vi.fn().mockResolvedValue({ url: "https://api-fetched-url.com/media" }),
      } as any,
    };
  });

  it("should return URL directly if present (v23.0+ optimization)", async () => {
    const media: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
      url: "https://webhook-url.com/media",
    };

    const result = await getMediaUrl(media, mockClient as WhatsAppClient);

    expect(result).toBe("https://webhook-url.com/media");
    expect(mockClient.media.getUrl).not.toHaveBeenCalled();
  });

  it("should fallback to API call if URL not present (v20.0-v22.0)", async () => {
    const media: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
    };

    const result = await getMediaUrl(media, mockClient as WhatsAppClient);

    expect(result).toBe("https://api-fetched-url.com/media");
    expect(mockClient.media.getUrl).toHaveBeenCalledWith("abc123");
  });

  it("should handle empty string URL as absent", async () => {
    const media: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
      url: "",
    };

    const result = await getMediaUrl(media, mockClient as WhatsAppClient);

    expect(result).toBe("https://api-fetched-url.com/media");
    expect(mockClient.media.getUrl).toHaveBeenCalledWith("abc123");
  });

  it("should throw error if API fallback fails", async () => {
    mockClient.media.getUrl = vi.fn().mockRejectedValue(new Error("API error"));

    const media: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
    };

    await expect(getMediaUrl(media, mockClient as WhatsAppClient)).rejects.toThrow("API error");
  });
});
