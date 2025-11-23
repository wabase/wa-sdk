/**
 * Interactive message event classes for button and list replies
 */

import { MessageEvent } from './base.js';
import type { WhatsAppClient } from '../../client/WhatsAppClient.js';
import type { WebhookMetadata } from '../../types/webhooks.js';

/**
 * Button reply event
 *
 * Emitted when a user replies to an interactive button message
 *
 * @class ButtonReplyEvent
 * @extends {MessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:interactive:button', async (event) => {
 *   console.log(`Button clicked: ${event.buttonId}`);
 *   console.log(`Button title: ${event.title}`);
 *   await event.reply({ text: `You clicked: ${event.title}` });
 * });
 * ```
 */
export class ButtonReplyEvent extends MessageEvent {
  /**
   * Button ID
   */
  public readonly buttonId: string;

  /**
   * Button title/text
   */
  public readonly title: string;

  /**
   * Creates a button reply event
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
    buttonId: string;
    title: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
    });
    this.buttonId = params.buttonId;
    this.title = params.title;
  }
}

/**
 * List reply event
 *
 * Emitted when a user replies to an interactive list message
 *
 * @class ListReplyEvent
 * @extends {MessageEvent}
 *
 * @example
 * ```typescript
 * handler.on('message:interactive:list', async (event) => {
 *   console.log(`List item selected: ${event.listId}`);
 *   console.log(`Title: ${event.title}`);
 *   if (event.description) {
 *     console.log(`Description: ${event.description}`);
 *   }
 * });
 * ```
 */
export class ListReplyEvent extends MessageEvent {
  /**
   * List item ID
   */
  public readonly listId: string;

  /**
   * List item title
   */
  public readonly title: string;

  /**
   * List item description (optional)
   */
  public readonly description?: string;

  /**
   * Creates a list reply event
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
    listId: string;
    title: string;
    description?: string;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      from: params.from,
      timestamp: params.timestamp,
      metadata: params.metadata,
      isForwarded: params.isForwarded,
    });
    this.listId = params.listId;
    this.title = params.title;
    this.description = params.description;
  }
}
