import { describe, it, expect, vi } from "vitest";
import { getMediaUrl } from "./media-helper.js";
import { WhatsAppClient } from "../client/index.js";
import type { WebhookMedia } from "../types/webhooks.js";

describe("getMediaUrl - Integration scenarios", () => {
  it("E2E: v23.0 user gets immediate URL (no API call)", async () => {
    const callLog: string[] = [];
    
    const mockClient = {
      media: {
        getUrl: vi.fn(() => {
          callLog.push("API_CALLED");
          return Promise.resolve({ url: "fallback-url" });
        }),
      },
    } as unknown as WhatsAppClient;

    const mediaV23: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
      url: "https://direct-url.com/image.jpg",
    };

    const url = await getMediaUrl(mediaV23, mockClient);

    expect(url).toBe("https://direct-url.com/image.jpg");
    expect(callLog).toEqual([]); // No API call!
  });

  it("E2E: v20-v22 user falls back to API call", async () => {
    const callLog: string[] = [];
    
    const mockClient = {
      media: {
        getUrl: vi.fn((id: string) => {
          callLog.push(`API_CALLED:${id}`);
          return Promise.resolve({ url: "https://api-url.com/media" });
        }),
      },
    } as unknown as WhatsAppClient;

    const mediaLegacy: WebhookMedia = {
      id: "abc123",
      mimeType: "image/jpeg",
      // No url field
    };

    const url = await getMediaUrl(mediaLegacy, mockClient);

    expect(url).toBe("https://api-url.com/media");
    expect(callLog).toEqual(["API_CALLED:abc123"]);
  });

  it("E2E: Mixed webhook batch (some with URL, some without)", async () => {
    const callLog: string[] = [];
    
    const mockClient = {
      media: {
        getUrl: vi.fn((id: string) => {
          callLog.push(`API_CALL:${id}`);
          return Promise.resolve({ url: `https://fallback/${id}` });
        }),
      },
    } as unknown as WhatsAppClient;

    const media1: WebhookMedia = { id: "img1", mimeType: "image/jpeg", url: "https://direct1.com" };
    const media2: WebhookMedia = { id: "img2", mimeType: "image/jpeg" }; // No URL
    const media3: WebhookMedia = { id: "img3", mimeType: "image/jpeg", url: "https://direct3.com" };

    const urls = await Promise.all([
      getMediaUrl(media1, mockClient),
      getMediaUrl(media2, mockClient),
      getMediaUrl(media3, mockClient),
    ]);

    expect(urls).toEqual([
      "https://direct1.com",
      "https://fallback/img2",
      "https://direct3.com",
    ]);
    expect(callLog).toEqual(["API_CALL:img2"]); // Only media2 triggered API call
  });
});
