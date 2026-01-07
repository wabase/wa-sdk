/**
 * Unit tests for webhook parser
 */

import { describe, it, expect } from "vitest";
import {
  parseWebhook,
  getReactions,
  getBusinessCapabilityUpdates,
  getPhoneNumberNameUpdates,
  getTemplateQualityUpdates,
  getUserPreferences,
} from "./parser.js";
import { Validator } from "../validation/validator.js";
import { ValidationError } from "../types/errors.js";

describe("parseWebhook", () => {
  const validWebhookPayload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "123456789",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "+1234567890",
                phone_number_id: "123456789",
              },
              contacts: [
                {
                  profile: {
                    name: "John Doe",
                  },
                  wa_id: "1234567890",
                },
              ],
              messages: [
                {
                  from: "1234567890",
                  id: "wamid.123",
                  timestamp: "1234567890",
                  type: "text",
                  text: {
                    body: "Hello",
                  },
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };

  describe("successful parsing", () => {
    it("should parse valid webhook payload", () => {
      const result = parseWebhook(validWebhookPayload);

      expect(result).toBeDefined();
      expect(result.object).toBe("whatsapp_business_account");
      expect(result.entry).toHaveLength(1);
    });

    it("should parse webhook with text message", () => {
      const result = parseWebhook(validWebhookPayload);

      expect(result.entry[0].changes[0].value.messages).toBeDefined();
      expect(result.entry[0].changes[0].value.messages![0].type).toBe("text");
    });

    it("should parse webhook with status update", () => {
      const statusPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123456789",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "+1234567890",
                    phone_number_id: "123456789",
                  },
                  statuses: [
                    {
                      id: "wamid.123",
                      status: "delivered",
                      timestamp: "1234567890",
                      recipient_id: "1234567890",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const result = parseWebhook(statusPayload);

      expect(result.entry[0].changes[0].value.statuses).toBeDefined();
      expect(result.entry[0].changes[0].value.statuses![0].status).toBe(
        "delivered",
      );
    });

    it("should parse webhook with multiple entries", () => {
      const multiEntryPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "+1234567890",
                    phone_number_id: "123",
                  },
                },
                field: "messages",
              },
            ],
          },
          {
            id: "456",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "+0987654321",
                    phone_number_id: "456",
                  },
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const result = parseWebhook(multiEntryPayload);

      expect(result.entry).toHaveLength(2);
    });

    it("should parse webhook with validator in off mode", () => {
      const validator = new Validator("off");
      const result = parseWebhook(validWebhookPayload, validator);

      expect(result).toBeDefined();
    });
  });

  describe("validation errors", () => {
    it("should throw error for null payload", () => {
      expect(() => parseWebhook(null)).toThrow(ValidationError);
      expect(() => parseWebhook(null)).toThrow("must be an object");
    });

    it("should throw error for undefined payload", () => {
      expect(() => parseWebhook(undefined)).toThrow(ValidationError);
    });

    it("should throw error for non-object payload", () => {
      expect(() => parseWebhook("invalid")).toThrow(ValidationError);
      expect(() => parseWebhook(123)).toThrow(ValidationError);
      expect(() => parseWebhook([])).toThrow(ValidationError);
    });

    it("should throw error for invalid object type", () => {
      const invalidPayload = {
        object: "invalid_type",
        entry: [],
      };

      expect(() => parseWebhook(invalidPayload)).toThrow(ValidationError);
      expect(() => parseWebhook(invalidPayload)).toThrow(
        "whatsapp_business_account",
      );
    });

    it("should throw error for missing entry array", () => {
      const invalidPayload = {
        object: "whatsapp_business_account",
      };

      expect(() => parseWebhook(invalidPayload)).toThrow(ValidationError);
      expect(() => parseWebhook(invalidPayload)).toThrow("entry");
    });

    it("should throw error for non-array entry", () => {
      const invalidPayload = {
        object: "whatsapp_business_account",
        entry: "not-an-array",
      };

      expect(() => parseWebhook(invalidPayload)).toThrow(ValidationError);
    });

    it("should provide field information in validation error", () => {
      try {
        parseWebhook(null);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.field).toBe("payload");
      }
    });
  });

  describe("different message types", () => {
    it("should parse image message", () => {
      const imagePayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "+1234567890",
                    phone_number_id: "123",
                  },
                  messages: [
                    {
                      from: "1234567890",
                      id: "wamid.123",
                      timestamp: "1234567890",
                      type: "image",
                      image: {
                        id: "media123",
                        mime_type: "image/jpeg",
                      },
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const result = parseWebhook(imagePayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe("image");
    });

    it("should parse location message", () => {
      const locationPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "+1234567890",
                    phone_number_id: "123",
                  },
                  messages: [
                    {
                      from: "1234567890",
                      id: "wamid.123",
                      timestamp: "1234567890",
                      type: "location",
                      location: {
                        latitude: 37.7749,
                        longitude: -122.4194,
                      },
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const result = parseWebhook(locationPayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe(
        "location",
      );
    });

    it("should parse interactive message response", () => {
      const interactivePayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "+1234567890",
                    phone_number_id: "123",
                  },
                  messages: [
                    {
                      from: "1234567890",
                      id: "wamid.123",
                      timestamp: "1234567890",
                      type: "interactive",
                      interactive: {
                        type: "button_reply",
                        button_reply: {
                          id: "btn1",
                          title: "Option 1",
                        },
                      },
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const result = parseWebhook(interactivePayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe(
        "interactive",
      );
    });

    it("should parse unsupported message", () => {
      const unsupportedPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "102290129340398",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "15550783881",
                    phone_number_id: "106540352242922",
                  },
                  contacts: [
                    {
                      profile: {
                        name: "Sheena Nelson",
                      },
                      wa_id: "16505551234",
                    },
                  ],
                  messages: [
                    {
                      from: "16505551234",
                      id: "wamid.HBgLMTY1MDM4Nzk0MzkVAgASGBQzQUFERjg0NDEzNDdFODU3MUMxMAA=",
                      timestamp: "1750090702",
                      type: "unsupported",
                      errors: [
                        {
                          code: 131051,
                          title: "Message type unknown",
                          message: "Message type unknown",
                          error_data: {
                            details: "Message type is currently not supported.",
                          },
                        },
                      ],
                      unsupported: {
                        type: "edit",
                      },
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const result = parseWebhook(unsupportedPayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe(
        "unsupported",
      );
      expect(
        result.entry[0].changes[0].value.messages![0].errors,
      ).toBeDefined();
      expect(
        result.entry[0].changes[0].value.messages![0].errors![0].code,
      ).toBe(131051);
      expect(
        result.entry[0].changes[0].value.messages![0].unsupported,
      ).toBeDefined();
      expect(
        result.entry[0].changes[0].value.messages![0].unsupported!.type,
      ).toBe("edit");
    });

    it("should parse contact with identity key hash", () => {
      const identityPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "123",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "+1234567890",
                    phone_number_id: "123",
                  },
                  contacts: [
                    {
                      profile: {
                        name: "John Doe",
                      },
                      wa_id: "1234567890",
                      identity_key_hash: "DF2lS5v2W6x=",
                    },
                  ],
                  messages: [
                    {
                      from: "1234567890",
                      id: "wamid.123",
                      timestamp: "1234567890",
                      type: "text",
                      text: {
                        body: "Hello",
                      },
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const result = parseWebhook(identityPayload);
      const contact = result.entry[0].changes[0].value.contacts![0] as any;

      expect(contact.wa_id).toBe("1234567890");
      expect(contact.identity_key_hash).toBe("DF2lS5v2W6x=");
    });
  });
});

// Enhanced Webhook Parser - New Event Parsers
describe("getReactions", () => {
  it("should extract reaction messages from webhook", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123456789",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1234567890",
                  phone_number_id: "123456789",
                },
                messages: [
                  {
                    from: "1234567890",
                    id: "wamid.reaction1",
                    timestamp: "1704556800",
                    type: "reaction",
                    reaction: {
                      message_id: "wamid.123",
                      emoji: "👍",
                    },
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const reactions = getReactions(event);

    expect(reactions).toHaveLength(1);
    expect(reactions[0].type).toBe("reaction");
    expect(reactions[0].reaction?.message_id).toBe("wamid.123");
    expect(reactions[0].reaction?.emoji).toBe("👍");
  });

  it("should return empty array when no reactions", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1234567890",
                  phone_number_id: "123",
                },
                messages: [
                  {
                    from: "1234567890",
                    id: "wamid.123",
                    timestamp: "1234567890",
                    type: "text",
                    text: { body: "Hello" },
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const reactions = getReactions(event);

    expect(reactions).toHaveLength(0);
  });

  it("should handle multiple reactions across entries", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1111111111",
                  phone_number_id: "111",
                },
                messages: [
                  {
                    from: "1111111111",
                    id: "wamid.r1",
                    timestamp: "1704556800",
                    type: "reaction",
                    reaction: { message_id: "wamid.1", emoji: "❤️" },
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
        {
          id: "456",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+2222222222",
                  phone_number_id: "222",
                },
                messages: [
                  {
                    from: "2222222222",
                    id: "wamid.r2",
                    timestamp: "1704556801",
                    type: "reaction",
                    reaction: { message_id: "wamid.2", emoji: "👍" },
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const reactions = getReactions(event);

    expect(reactions).toHaveLength(2);
    expect(reactions[0].reaction?.emoji).toBe("❤️");
    expect(reactions[1].reaction?.emoji).toBe("👍");
  });
});

describe("getBusinessCapabilityUpdates", () => {
  it("should extract business capability updates from webhook", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123456789",
          changes: [
            {
              value: {
                wabaId: "123456789",
                capabilities: {
                  messagingCapability: "tier_50k",
                },
              },
              field: "business_capability_update",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getBusinessCapabilityUpdates(event);

    expect(updates).toHaveLength(1);
    expect(updates[0].value.wabaId).toBe("123456789");
    expect(updates[0].value.capabilities.messagingCapability).toBe("tier_50k");
  });

  it("should return empty array when no capability updates", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1234567890",
                  phone_number_id: "123",
                },
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getBusinessCapabilityUpdates(event);

    expect(updates).toHaveLength(0);
  });

  it("should handle multiple capability updates", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "111",
          changes: [
            {
              value: {
                wabaId: "111",
                capabilities: { messagingCapability: "tier_10k" },
              },
              field: "business_capability_update",
            },
          ],
        },
        {
          id: "222",
          changes: [
            {
              value: {
                wabaId: "222",
                capabilities: { messagingCapability: "tier_100k" },
              },
              field: "business_capability_update",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getBusinessCapabilityUpdates(event);

    expect(updates).toHaveLength(2);
    expect(updates[0].value.capabilities.messagingCapability).toBe("tier_10k");
    expect(updates[1].value.capabilities.messagingCapability).toBe("tier_100k");
  });
});

describe("getPhoneNumberNameUpdates", () => {
  it("should extract phone number name updates from webhook", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123456789",
          changes: [
            {
              value: {
                phoneNumberId: "123456789",
                displayName: "My Business",
                decision: "APPROVED",
              },
              field: "phone_number_name_update",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getPhoneNumberNameUpdates(event);

    expect(updates).toHaveLength(1);
    expect(updates[0].value.phoneNumberId).toBe("123456789");
    expect(updates[0].value.displayName).toBe("My Business");
    expect(updates[0].value.decision).toBe("APPROVED");
  });

  it("should return empty array when no name updates", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1234567890",
                  phone_number_id: "123",
                },
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getPhoneNumberNameUpdates(event);

    expect(updates).toHaveLength(0);
  });

  it("should handle rejected name updates", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                phoneNumberId: "123",
                displayName: "Bad Name",
                decision: "REJECTED",
                rejectionReason: "Violates policies",
              },
              field: "phone_number_name_update",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getPhoneNumberNameUpdates(event);

    expect(updates).toHaveLength(1);
    expect(updates[0].value.decision).toBe("REJECTED");
    expect(updates[0].value.rejectionReason).toBe("Violates policies");
  });
});

describe("getTemplateQualityUpdates", () => {
  it("should extract template quality updates from webhook", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123456789",
          changes: [
            {
              value: {
                messageTemplateId: "template123",
                messageTemplateName: "order_confirmation",
                messageTemplateLanguage: "en",
                quality: "GREEN",
                previousQuality: "YELLOW",
              },
              field: "message_template_quality_update",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getTemplateQualityUpdates(event);

    expect(updates).toHaveLength(1);
    expect(updates[0].value.messageTemplateId).toBe("template123");
    expect(updates[0].value.quality).toBe("GREEN");
    expect(updates[0].value.previousQuality).toBe("YELLOW");
  });

  it("should return empty array when no quality updates", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1234567890",
                  phone_number_id: "123",
                },
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getTemplateQualityUpdates(event);

    expect(updates).toHaveLength(0);
  });

  it("should handle quality degradation", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messageTemplateId: "template456",
                messageTemplateName: "promo_message",
                messageTemplateLanguage: "en",
                quality: "RED",
                previousQuality: "GREEN",
                reason: "High block rate",
              },
              field: "message_template_quality_update",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const updates = getTemplateQualityUpdates(event);

    expect(updates).toHaveLength(1);
    expect(updates[0].value.quality).toBe("RED");
    expect(updates[0].value.reason).toBe("High block rate");
  });
});

describe("getUserPreferences", () => {
  it("should extract user preferences from webhook", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123456789",
          changes: [
            {
              value: {
                phoneNumberId: "123456789",
                userId: "user123",
                preferences: {
                  notifications: true,
                  language: "en",
                },
              },
              field: "user_preferences",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const preferences = getUserPreferences(event);

    expect(preferences).toHaveLength(1);
    expect(preferences[0].value.phoneNumberId).toBe("123456789");
    expect(preferences[0].value.userId).toBe("user123");
  });

  it("should return empty array when no user preferences", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+1234567890",
                  phone_number_id: "123",
                },
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const preferences = getUserPreferences(event);

    expect(preferences).toHaveLength(0);
  });

  it("should handle multiple user preferences", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "111",
          changes: [
            {
              value: {
                phoneNumberId: "111",
                userId: "user1",
                preferences: { notifications: true },
              },
              field: "user_preferences",
            },
          ],
        },
        {
          id: "222",
          changes: [
            {
              value: {
                phoneNumberId: "222",
                userId: "user2",
                preferences: { notifications: false },
              },
              field: "user_preferences",
            },
          ],
        },
      ],
    };

    const event = parseWebhook(payload);
    const preferences = getUserPreferences(event);

    expect(preferences).toHaveLength(2);
    expect(preferences[0].value.userId).toBe("user1");
    expect(preferences[1].value.userId).toBe("user2");
  });
});

describe("parseWebhook - Phase 2 enhancements", () => {
  it("should parse image message with URL (v23.0+)", () => {
    const webhook = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "1234567890",
                  phone_number_id: "phone123",
                },
                messages: [
                  {
                    id: "msg123",
                    from: "user123",
                    timestamp: "1704556800",
                    type: "image",
                    image: {
                      id: "img123",
                      mime_type: "image/jpeg",
                      url: "https://lookaside.fbsbx.com/media/v1/...",
                      caption: "Test",
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
    expect(result.entry[0].changes[0].value.messages?.[0].image?.url).toBe(
      "https://lookaside.fbsbx.com/media/v1/...",
    );
  });

  it("should parse voice message with transcription (v23.0+)", () => {
    const webhook = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "1234567890",
                  phone_number_id: "phone123",
                },
                messages: [
                  {
                    id: "msg123",
                    from: "user123",
                    timestamp: "1704556800",
                    type: "audio",
                    audio: {
                      id: "voice123",
                      mime_type: "audio/ogg",
                      voice: true,
                      text: "Hello world",
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
    expect(result.entry[0].changes[0].value.messages?.[0].audio?.voice).toBe(
      true,
    );
    expect(result.entry[0].changes[0].value.messages?.[0].audio?.text).toBe(
      "Hello world",
    );
  });

  it("should parse 'played' status (v20.0+)", () => {
    const webhook = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "1234567890",
                  phone_number_id: "phone123",
                },
                statuses: [
                  {
                    id: "msg123",
                    status: "played",
                    timestamp: "1704556800",
                    recipient_id: "user123",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = parseWebhook(webhook);
    expect(result.entry[0].changes[0].value.statuses?.[0].status).toBe(
      "played",
    );
  });
});
