/**
 * System event classes for account updates and unknown events
 */

import { BaseEvent } from './base.js';
import type { WhatsAppClient } from '../../client/WhatsAppClient.js';

/**
 * Account update event
 *
 * Emitted when account-related updates occur
 *
 * @class AccountUpdateEvent
 * @extends {BaseEvent}
 *
 * @example
 * ```typescript
 * handler.on('account:update', (event) => {
 *   console.log(`Account update: ${event.eventType}`);
 *   console.log(`Data:`, event.data);
 * });
 * ```
 */
export class AccountUpdateEvent extends BaseEvent {
  /**
   * Event type/field
   */
  public readonly eventType: string;

  /**
   * Event data
   */
  public readonly data: Record<string, unknown>;

  /**
   * Creates an account update event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    timestamp: string;
    eventType: string;
    data: Record<string, unknown>;
  }) {
    super({
      client: params.client,
      timestamp: params.timestamp,
    });
    this.eventType = params.eventType;
    this.data = params.data;
  }
}

/**
 * Unknown event
 *
 * Emitted when an unrecognized event type is received
 *
 * @class UnknownEvent
 * @extends {BaseEvent}
 *
 * @example
 * ```typescript
 * handler.on('unknown', (event) => {
 *   console.log(`Unknown event type: ${event.type}`);
 *   console.log(`Data:`, event.data);
 * });
 * ```
 */
export class UnknownEvent extends BaseEvent {
  /**
   * Unknown event type
   */
  public readonly type: string;

  /**
   * Raw event data
   */
  public readonly data: unknown;

  /**
   * Error information (if available)
   */
  public readonly error?: {
    code: number;
    title: string;
    message?: string;
  };

  /**
   * Creates an unknown event
   *
   * @param params - Event parameters
   */
  constructor(params: {
    client: WhatsAppClient;
    timestamp: string;
    type: string;
    data: unknown;
    error?: {
      code: number;
      title: string;
      message?: string;
    };
  }) {
    super({
      client: params.client,
      timestamp: params.timestamp,
    });
    this.type = params.type;
    this.data = params.data;
    this.error = params.error;
  }
}
