/**
 * Status update event classes for message delivery status
 */

import { StatusUpdateEvent } from './base.js';
import type { WhatsAppClient } from '../../client/WhatsAppClient.js';
import type { WebhookMetadata } from '../../types/webhooks.js';

/**
 * Message sent event
 *
 * Emitted when a message is sent from WhatsApp server
 *
 * @class MessageSentEvent
 * @extends {StatusUpdateEvent}
 *
 * @example
 * ```typescript
 * handler.on('status:sent', (event) => {
 *   console.log(`Message ${event.messageId} sent to ${event.context.from}`);
 * });
 * ```
 */
export class MessageSentEvent extends StatusUpdateEvent {
  /**
   * Creates a message sent event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    recipientId: string;
    timestamp: string;
    metadata: WebhookMetadata;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      recipientId: params.recipientId,
      timestamp: params.timestamp,
      metadata: params.metadata,
      status: 'sent',
    });
  }
}

/**
 * Message delivered event
 *
 * Emitted when a message is delivered to recipient's device
 *
 * @class MessageDeliveredEvent
 * @extends {StatusUpdateEvent}
 *
 * @example
 * ```typescript
 * handler.on('status:delivered', (event) => {
 *   console.log(`Message ${event.messageId} delivered`);
 * });
 * ```
 */
export class MessageDeliveredEvent extends StatusUpdateEvent {
  /**
   * Creates a message delivered event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    recipientId: string;
    timestamp: string;
    metadata: WebhookMetadata;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      recipientId: params.recipientId,
      timestamp: params.timestamp,
      metadata: params.metadata,
      status: 'delivered',
    });
  }
}

/**
 * Message read event
 *
 * Emitted when a message is read by recipient
 *
 * @class MessageReadEvent
 * @extends {StatusUpdateEvent}
 *
 * @example
 * ```typescript
 * handler.on('status:read', (event) => {
 *   console.log(`Message ${event.messageId} read by ${event.context.from}`);
 * });
 * ```
 */
export class MessageReadEvent extends StatusUpdateEvent {
  /**
   * Creates a message read event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    recipientId: string;
    timestamp: string;
    metadata: WebhookMetadata;
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      recipientId: params.recipientId,
      timestamp: params.timestamp,
      metadata: params.metadata,
      status: 'read',
    });
  }
}

/**
 * Message failed event
 *
 * Emitted when a message fails to be delivered
 *
 * @class MessageFailedEvent
 * @extends {StatusUpdateEvent}
 *
 * @example
 * ```typescript
 * handler.on('status:failed', (event) => {
 *   console.log(`Message ${event.messageId} failed`);
 *   if (event.error) {
 *     console.log(`Error: ${event.error.title} - ${event.error.message}`);
 *   }
 * });
 * ```
 */
export class MessageFailedEvent extends StatusUpdateEvent {
  /**
   * Error information (if available)
   */
  public readonly error?: {
    code: number;
    title: string;
    message?: string;
    details?: string;
  };

  /**
   * Creates a message failed event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    messageId: string;
    recipientId: string;
    timestamp: string;
    metadata: WebhookMetadata;
    error?: {
      code: number;
      title: string;
      message?: string;
      errorData?: {
        details: string;
      };
    };
  }) {
    super({
      client: params.client,
      messageId: params.messageId,
      recipientId: params.recipientId,
      timestamp: params.timestamp,
      metadata: params.metadata,
      status: 'failed',
    });

    if (params.error) {
      this.error = {
        code: params.error.code,
        title: params.error.title,
        message: params.error.message,
        details: params.error.errorData?.details,
      };
    }
  }
}
