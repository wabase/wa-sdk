/**
 * Phase 2 E2E Scenario Tests
 * 
 * Comprehensive end-to-end tests for Phase 2 webhook features:
 * - Media URLs (v23.0+)
 * - Voice transcription (v23.0+)
 * - Played status (v20.0+)
 * - Backward compatibility (v20.0-v22.0)
 */

import { describe, it, expect } from "vitest";
import { parseWebhook, getMessages, getStatuses } from "./parser.js";
import type { WebhookEvent } from "../types/webhooks.js";

describe("Phase 2 E2E Scenarios", () => {
  describe("Scenario 1: Image message with immediate URL", () => {
    it("should parse complete flow without API roundtrip", () => {
      const webhook: WebhookEvent = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "waba123",
            changes: [
              {
                field: "messages",
                value: {
                  messagingProduct: "whatsapp",
                  metadata: {
                    displayPhoneNumber: "1234567890",
                    phoneNumberId: "phone123",
                  },
                  contacts: [
                    {
                      profile: { name: "John Doe" },
                      waId: "user123",
                    },
                  ],
                  messages: [
                    {
                      id: "msg123",
                      from: "user123",
                      timestamp: "1704556800",
                      type: "image",
                      image: {
                        id: "img123",
                        mimeType: "image/jpeg",
                        sha256: "abc123",
                        url: "https://lookaside.fbsbx.com/media/v1/xyz",
                        caption: "Check this out!",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = parseWebhook(webhook);
      const messages = getMessages(result);

      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe("image");
      expect(messages[0].image).toMatchObject({
        id: "img123",
        mimeType: "image/jpeg",
        url: "https://lookaside.fbsbx.com/media/v1/xyz",
        caption: "Check this out!",
      });
    });
  });

  describe("Scenario 2: Voice message with transcription", () => {
    it("should parse voice message with available transcription", () => {
      const webhook: WebhookEvent = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "waba123",
            changes: [
              {
                field: "messages",
                value: {
                  messagingProduct: "whatsapp",
                  metadata: {
                    displayPhoneNumber: "1234567890",
                    phoneNumberId: "phone123",
                  },
                  messages: [
                    {
                      id: "msg123",
                      from: "user123",
                      timestamp: "1704556800",
                      type: "audio",
                      audio: {
                        id: "voice123",
                        mimeType: "audio/ogg",
                        voice: true,
                        url: "https://lookaside.fbsbx.com/audio/voice.ogg",
                        text: "Hello, I would like to schedule an appointment for tomorrow at 3 PM",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = parseWebhook(webhook);
      const messages = getMessages(result);

      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe("audio");
      expect(messages[0].audio).toMatchObject({
        voice: true,
        text: "Hello, I would like to schedule an appointment for tomorrow at 3 PM",
        url: "https://lookaside.fbsbx.com/audio/voice.ogg",
      });
    });

    it("should parse voice message without transcription", () => {
      const webhook: WebhookEvent = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "waba123",
            changes: [
              {
                field: "messages",
                value: {
                  messagingProduct: "whatsapp",
                  metadata: {
                    displayPhoneNumber: "1234567890",
                    phoneNumberId: "phone123",
                  },
                  messages: [
                    {
                      id: "msg123",
                      from: "user123",
                      timestamp: "1704556800",
                      type: "audio",
                      audio: {
                        id: "voice123",
                        mimeType: "audio/ogg",
                        voice: true,
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = parseWebhook(webhook);
      const messages = getMessages(result);

      expect(messages[0].audio?.voice).toBe(true);
      expect(messages[0].audio?.text).toBeUndefined();
    });
  });

  describe("Scenario 3: Status progression with 'played'", () => {
    it("should handle complete status flow: sent → delivered → read → played", () => {
      const statuses: Array<WebhookEvent> = [
        {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "waba123",
              changes: [
                {
                  field: "messages",
                  value: {
                    messagingProduct: "whatsapp",
                    metadata: {
                      displayPhoneNumber: "1234567890",
                      phoneNumberId: "phone123",
                    },
                    statuses: [
                      {
                        id: "msg123",
                        status: "sent",
                        timestamp: "1704556800",
                        recipientId: "user123",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "waba123",
              changes: [
                {
                  field: "messages",
                  value: {
                    messagingProduct: "whatsapp",
                    metadata: {
                      displayPhoneNumber: "1234567890",
                      phoneNumberId: "phone123",
                    },
                    statuses: [
                      {
                        id: "msg123",
                        status: "delivered",
                        timestamp: "1704556810",
                        recipientId: "user123",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "waba123",
              changes: [
                {
                  field: "messages",
                  value: {
                    messagingProduct: "whatsapp",
                    metadata: {
                      displayPhoneNumber: "1234567890",
                      phoneNumberId: "phone123",
                    },
                    statuses: [
                      {
                        id: "msg123",
                        status: "read",
                        timestamp: "1704556820",
                        recipientId: "user123",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "waba123",
              changes: [
                {
                  field: "messages",
                  value: {
                    messagingProduct: "whatsapp",
                    metadata: {
                      displayPhoneNumber: "1234567890",
                      phoneNumberId: "phone123",
                    },
                    statuses: [
                      {
                        id: "msg123",
                        status: "played",
                        timestamp: "1704556830",
                        recipientId: "user123",
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ];

      const results = statuses.map((webhook) => {
        const parsed = parseWebhook(webhook);
        return getStatuses(parsed);
      });

      expect(results[0][0].status).toBe("sent");
      expect(results[1][0].status).toBe("delivered");
      expect(results[2][0].status).toBe("read");
      expect(results[3][0].status).toBe("played");
    });
  });

  describe("Scenario 4: Backward compatibility (v20-v22)", () => {
    it("should parse legacy media message without URL", () => {
      const webhook: WebhookEvent = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "waba123",
            changes: [
              {
                field: "messages",
                value: {
                  messagingProduct: "whatsapp",
                  metadata: {
                    displayPhoneNumber: "1234567890",
                    phoneNumberId: "phone123",
                  },
                  messages: [
                    {
                      id: "msg123",
                      from: "user123",
                      timestamp: "1704556800",
                      type: "video",
                      video: {
                        id: "video123",
                        mimeType: "video/mp4",
                        sha256: "hash123",
                        // No url field (v20-v22)
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = parseWebhook(webhook);
      const messages = getMessages(result);

      expect(messages[0].type).toBe("video");
      expect(messages[0].video?.id).toBe("video123");
      expect(messages[0].video?.url).toBeUndefined();
    });
  });
});
