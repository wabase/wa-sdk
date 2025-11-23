/**
 * Base event classes for webhook events
 */

import type { WhatsAppClient } from '../../client/WhatsAppClient.js';
import type { WebhookMetadata } from '../../types/webhooks.js';
import type { MessageResponse } from '../../types/responses.js';

/**
 * Message context information
 */
export interface MessageContext {
  /**
   * Sender's phone number (in WhatsApp format)
   */
  from: string;

  /**
   * Phone number ID receiving the message
   */
  phoneNumberId: string;

  /**
   * Display phone number
   */
  displayPhoneNumber: string;
}

/**
 * Base event interface
 */
export interface BaseEventInterface {
  /**
   * WhatsApp client instance
   */
  client: WhatsAppClient;

  /**
   * Event timestamp (Unix timestamp in seconds)
   */
  timestamp: number;
}

/**
 * Base event class for all webhook events
 *
 * @class BaseEvent
 * @implements {BaseEventInterface}
 *
 * @example
 * ```typescript
 * // Base class - not used directly
 * // Extended by MessageEvent, StatusUpdateEvent, etc.
 * ```
 */
export class BaseEvent implements BaseEventInterface {
  /**
   * WhatsApp client instance
   */
  public readonly client: WhatsAppClient;

  /**
   * Event timestamp (Unix timestamp in seconds)
   */
  public readonly timestamp: number;

  /**
   * Creates a base event
   *
   * @param params - Event parameters
   * @param params.client - WhatsApp client instance
   * @param params.timestamp - Event timestamp
   */
  constructor(params: { client: WhatsAppClient; timestamp: string }) {
    this.client = params.client;
    this.timestamp = Number(params.timestamp);
  }
}

/**
 * Message event interface
 */
export interface MessageEventInterface extends BaseEventInterface {
  /**
   * Message ID
   */
  messageId: string;

  /**
   * Message context (sender info, metadata)
   */
  context: MessageContext;

  /**
   * Whether the message was forwarded
   */
  isForwarded: boolean;
}

/**
 * Base class for all message events
 *
 * @class MessageEvent
 * @extends {BaseEvent}
 * @implements {MessageEventInterface}
 *
 * @example
 * ```typescript
 * handler.on('message:text', async (event: TextMessageEvent) => {
 *   console.log(event.messageId);
 *   await event.reply({ text: 'Hello!' });
 *   await event.react({ emoji: '👍' });
 *   await event.read();
 * });
 * ```
 */
export abstract class MessageEvent extends BaseEvent implements MessageEventInterface {
  /**
   * Message ID
   */
  public readonly messageId: string;

  /**
   * Message context (sender info, metadata)
   */
  public readonly context: MessageContext;

  /**
   * Whether the message was forwarded
   */
  public readonly isForwarded: boolean;

  /**
   * Creates a message event
   *
   * @param params - Event parameters
   * @param params.client - WhatsApp client instance
   * @param params.messageId - Message ID
   * @param params.from - Sender's phone number
   * @param params.timestamp - Message timestamp
   * @param params.metadata - Webhook metadata
   * @param params.isForwarded - Whether message was forwarded
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    from: string;
    timestamp: string;
    metadata: WebhookMetadata;
    isForwarded: boolean;
  }) {
    super({ client: params.client, timestamp: params.timestamp });
    this.messageId = params.messageId;
    this.isForwarded = params.isForwarded;
    this.context = {
      from: params.from,
      phoneNumberId: params.metadata.phoneNumberId,
      displayPhoneNumber: params.metadata.displayPhoneNumber,
    };
  }

  /**
   * Reply to this message
   *
   * @param params - Reply parameters
   * @param params.text - Text message to send
   * @returns Message response
   *
   * @example
   * ```typescript
   * await event.reply({ text: 'Thanks for your message!' });
   * ```
   */
  async reply(params: { text: string }): Promise<MessageResponse> {
    return this.client.messages.sendText({
      to: this.context.from,
      text: params.text,
      context: { messageId: this.messageId },
    });
  }

  /**
   * React to this message with an emoji
   *
   * @param params - Reaction parameters
   * @param params.emoji - Emoji to react with
   * @returns Message response
   *
   * @example
   * ```typescript
   * await event.react({ emoji: '👍' });
   * await event.react({ emoji: '❤️' });
   * ```
   */
  async react(params: { emoji: string }): Promise<MessageResponse> {
    return this.client.messages.sendReaction({
      to: this.context.from,
      messageId: this.messageId,
      emoji: params.emoji,
    });
  }

  /**
   * Mark this message as read
   *
   * @returns Success response
   *
   * @example
   * ```typescript
   * await event.read();
   * ```
   */
  async read(): Promise<{ success: boolean }> {
    return this.client.messages.markAsRead(this.messageId);
  }
}

/**
 * Media message event interface
 */
export interface MediaMessageEventInterface extends MessageEventInterface {
  /**
   * Media ID
   */
  mediaId: string;

  /**
   * Media MIME type
   */
  mimeType: string;

  /**
   * Media SHA256 hash
   */
  sha256: string;
}

/**
 * Base class for all media message events
 *
 * @class MediaMessageEvent
 * @extends {MessageEvent}
 * @implements {MediaMessageEventInterface}
 *
 * @example
 * ```typescript
 * handler.on('message:image', async (event: ImageMessageEvent) => {
 *   const url = await event.getUrl();
 *   console.log(`Image URL: ${url}`);
 * });
 * ```
 */
export abstract class MediaMessageEvent
  extends MessageEvent
  implements MediaMessageEventInterface
{
  /**
   * Media ID
   */
  public readonly mediaId: string;

  /**
   * Media MIME type
   */
  public readonly mimeType: string;

  /**
   * Media SHA256 hash
   */
  public readonly sha256: string;

  /**
   * Creates a media message event
   *
   * @param params - Event parameters
   * @param params.client - WhatsApp client instance
   * @param params.messageId - Message ID
   * @param params.from - Sender's phone number
   * @param params.timestamp - Message timestamp
   * @param params.metadata - Webhook metadata
   * @param params.isForwarded - Whether message was forwarded
   * @param params.mediaId - Media ID
   * @param params.mimeType - Media MIME type
   * @param params.sha256 - Media SHA256 hash
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    from: string;
    timestamp: string;
    metadata: WebhookMetadata;
    isForwarded: boolean;
    mediaId: string;
    mimeType: string;
    sha256: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
    });
    this.mediaId = params.mediaId;
    this.mimeType = params.mimeType;
    this.sha256 = params.sha256;
  }

  /**
   * Get the download URL for this media
   *
   * @returns Media URL
   *
   * @example
   * ```typescript
   * const url = await event.getUrl();
   * // Download the media from the URL
   * const response = await fetch(url);
   * const buffer = await response.arrayBuffer();
   * ```
   */
  async getUrl(): Promise<string> {
    const response = await this.client.media.getUrl(this.mediaId);
    return response.url;
  }
}

/**
 * Status update event interface
 */
export interface StatusUpdateEventInterface extends BaseEventInterface {
  /**
   * Message context (recipient info)
   */
  context: MessageContext;

  /**
   * Message ID that this status update refers to
   */
  messageId: string;

  /**
   * Status type
   */
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

/**
 * Base class for all status update events
 *
 * @class StatusUpdateEvent
 * @extends {BaseEvent}
 * @implements {StatusUpdateEventInterface}
 *
 * @example
 * ```typescript
 * handler.on('status:delivered', (event: MessageDeliveredEvent) => {
 *   console.log(`Message ${event.messageId} delivered to ${event.context.from}`);
 * });
 * ```
 */
export abstract class StatusUpdateEvent
  extends BaseEvent
  implements StatusUpdateEventInterface
{
  /**
   * Message context (recipient info)
   */
  public readonly context: MessageContext;

  /**
   * Message ID that this status update refers to
   */
  public readonly messageId: string;

  /**
   * Status type
   */
  public readonly status: 'sent' | 'delivered' | 'read' | 'failed';

  /**
   * Creates a status update event
   *
   * @param params - Event parameters
   * @param params.client - WhatsApp client instance
   * @param params.messageId - Message ID
   * @param params.recipientId - Recipient's phone number
   * @param params.timestamp - Status update timestamp
   * @param params.metadata - Webhook metadata
   * @param params.status - Status type
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    recipientId: string;
    timestamp: string;
    metadata: WebhookMetadata;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }) {
    super({ client: params.client, timestamp: params.timestamp });
    this.messageId = params.messageId;
    this.status = params.status;
    this.context = {
      from: params.recipientId,
      phoneNumberId: params.metadata.phoneNumberId,
      displayPhoneNumber: params.metadata.displayPhoneNumber,
    };
  }
}
