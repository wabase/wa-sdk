/**
 * Message event classes for different message types
 */

import { MessageEvent, MediaMessageEvent } from './base.js';
import type { WhatsAppClient } from '../../client/WhatsAppClient.js';
import type {
  WebhookMetadata,
  WebhookContact,
  WebhookLocation,
} from '../../types/webhooks.js';

/**
 * Text message event
 *
 * Emitted when a text message is received
 *
 * @class TextMessageEvent
 * @extends {MessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:text', async (event) => {
 *   console.log(`Text: ${event.text}`);
 *   await event.reply({ text: 'Got your message!' });
 * });
 * ```
 */
export class TextMessageEvent extends MessageEvent {
  /**
   * Text message body
   */
  public readonly text: string;

  /**
   * Creates a text message event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    from: string;
    timestamp: string;
    metadata: WebhookMetadata;
    isForwarded: boolean;
    text: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
    });
    this.text = params.text;
  }
}

/**
 * Image message event
 *
 * Emitted when an image message is received
 *
 * @class ImageMessageEvent
 * @extends {MediaMessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:image', async (event) => {
 *   const url = await event.getUrl();
 *   console.log(`Image: ${url}`);
 *   if (event.caption) console.log(`Caption: ${event.caption}`);
 * });
 * ```
 */
export class ImageMessageEvent extends MediaMessageEvent {
  /**
   * Image caption (optional)
   */
  public readonly caption?: string;

  /**
   * Creates an image message event
   *
   * @param params - Event parameters
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
    caption?: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
      mediaId: params.mediaId,
      mimeType: params.mimeType,
      sha256: params.sha256,
    });
    this.caption = params.caption;
  }
}

/**
 * Video message event
 *
 * Emitted when a video message is received
 *
 * @class VideoMessageEvent
 * @extends {MediaMessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:video', async (event) => {
 *   const url = await event.getUrl();
 *   console.log(`Video: ${url}`);
 * });
 * ```
 */
export class VideoMessageEvent extends MediaMessageEvent {
  /**
   * Video caption (optional)
   */
  public readonly caption?: string;

  /**
   * Creates a video message event
   *
   * @param params - Event parameters
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
    caption?: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
      mediaId: params.mediaId,
      mimeType: params.mimeType,
      sha256: params.sha256,
    });
    this.caption = params.caption;
  }
}

/**
 * Audio message event
 *
 * Emitted when an audio message is received
 *
 * @class AudioMessageEvent
 * @extends {MediaMessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:audio', async (event) => {
 *   const url = await event.getUrl();
 *   console.log(`Audio: ${url}`);
 * });
 * ```
 */
export class AudioMessageEvent extends MediaMessageEvent {
  /**
   * Creates an audio message event
   *
   * @param params - Event parameters
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
      mediaId: params.mediaId,
      mimeType: params.mimeType,
      sha256: params.sha256,
    });
  }
}

/**
 * Document message event
 *
 * Emitted when a document message is received
 *
 * @class DocumentMessageEvent
 * @extends {MediaMessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:document', async (event) => {
 *   console.log(`Document: ${event.filename}`);
 *   const url = await event.getUrl();
 * });
 * ```
 */
export class DocumentMessageEvent extends MediaMessageEvent {
  /**
   * Document filename
   */
  public readonly filename?: string;

  /**
   * Document caption (optional)
   */
  public readonly caption?: string;

  /**
   * Creates a document message event
   *
   * @param params - Event parameters
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
    filename?: string;
    caption?: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
      mediaId: params.mediaId,
      mimeType: params.mimeType,
      sha256: params.sha256,
    });
    this.filename = params.filename;
    this.caption = params.caption;
  }
}

/**
 * Sticker message event
 *
 * Emitted when a sticker message is received
 *
 * @class StickerMessageEvent
 * @extends {MediaMessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:sticker', async (event) => {
 *   console.log(`Received sticker`);
 * });
 * ```
 */
export class StickerMessageEvent extends MediaMessageEvent {
  /**
   * Creates a sticker message event
   *
   * @param params - Event parameters
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
      mediaId: params.mediaId,
      mimeType: params.mimeType,
      sha256: params.sha256,
    });
  }
}

/**
 * Location message event
 *
 * Emitted when a location message is received
 *
 * @class LocationMessageEvent
 * @extends {MessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:location', async (event) => {
 *   console.log(`Location: ${event.latitude}, ${event.longitude}`);
 *   if (event.name) console.log(`Name: ${event.name}`);
 * });
 * ```
 */
export class LocationMessageEvent extends MessageEvent {
  /**
   * Location latitude
   */
  public readonly latitude: number;

  /**
   * Location longitude
   */
  public readonly longitude: number;

  /**
   * Location name (optional)
   */
  public readonly name?: string;

  /**
   * Location address (optional)
   */
  public readonly address?: string;

  /**
   * Creates a location message event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    from: string;
    timestamp: string;
    metadata: WebhookMetadata;
    isForwarded: boolean;
    location: WebhookLocation;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
    });
    this.latitude = params.location.latitude;
    this.longitude = params.location.longitude;
    this.name = params.location.name;
    this.address = params.location.address;
  }
}

/**
 * Contact message event
 *
 * Emitted when a contact message is received
 *
 * @class ContactMessageEvent
 * @extends {MessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:contact', async (event) => {
 *   console.log(`Received ${event.contacts.length} contact(s)`);
 *   event.contacts.forEach(contact => {
 *     console.log(`- ${contact.profile.name}`);
 *   });
 * });
 * ```
 */
export class ContactMessageEvent extends MessageEvent {
  /**
   * Array of contacts
   */
  public readonly contacts: WebhookContact[];

  /**
   * Creates a contact message event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    from: string;
    timestamp: string;
    metadata: WebhookMetadata;
    isForwarded: boolean;
    contacts: WebhookContact[];
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
    });
    this.contacts = params.contacts;
  }
}

/**
 * Reaction message event
 *
 * Emitted when a reaction to a message is received
 *
 * @class ReactionMessageEvent
 * @extends {MessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:reaction', async (event) => {
 *   console.log(`Reaction ${event.emoji} to message ${event.reactionMessageId}`);
 * });
 * ```
 */
export class ReactionMessageEvent extends MessageEvent {
  /**
   * Emoji used for reaction
   */
  public readonly emoji: string;

  /**
   * Message ID being reacted to
   */
  public readonly reactionMessageId: string;

  /**
   * Creates a reaction message event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    from: string;
    timestamp: string;
    metadata: WebhookMetadata;
    isForwarded: boolean;
    emoji: string;
    reactionMessageId: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
    });
    this.emoji = params.emoji;
    this.reactionMessageId = params.reactionMessageId;
  }
}
