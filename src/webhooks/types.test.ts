import { describe, it, expect } from 'vitest';
import type {
  MessageReactionEvent,
  SessionEndEvent,
  CartUpdateEvent,
  CommerceCheckoutEvent,
  AccountUpdateEvent,
  WebhookEvent,
} from './types.js';

describe('Webhook Event Types', () => {
  it('should accept valid MessageReactionEvent', () => {
    const event: MessageReactionEvent = {
      type: 'message_reaction',
      reaction: {
        message_id: 'wamid.123',
        emoji: '👍',
        timestamp: 1704556800,
      },
      from: '+1234567890',
    };
    
    expect(event.type).toBe('message_reaction');
    expect(event.reaction.emoji).toBe('👍');
  });

  it('should accept valid SessionEndEvent', () => {
    const event: SessionEndEvent = {
      type: 'session_end',
      session: {
        phone_number: '+1234567890',
        end_time: 1704556800,
        duration_seconds: 86400,
      },
    };
    
    expect(event.type).toBe('session_end');
    expect(event.session.duration_seconds).toBe(86400);
  });

  it('should accept valid CartUpdateEvent', () => {
    const event: CartUpdateEvent = {
      type: 'cart_update',
      cart: {
        cart_id: 'cart_123',
        phone_number: '+1234567890',
        items: [
          {
            product_id: 'prod_1',
            quantity: 2,
            item_price: 1000,
          },
        ],
        total_amount: 2000,
        action: 'add',
      },
    };
    
    expect(event.cart.action).toBe('add');
    expect(event.cart.total_amount).toBe(2000);
  });

  it('should accept valid CommerceCheckoutEvent', () => {
    const event: CommerceCheckoutEvent = {
      type: 'commerce_checkout',
      checkout: {
        checkout_id: 'checkout_123',
        phone_number: '+1234567890',
        total_amount: 5000,
        currency: 'USD',
        status: 'initiated',
      },
    };
    
    expect(event.checkout.status).toBe('initiated');
  });

  it('should accept valid AccountUpdateEvent', () => {
    const event: AccountUpdateEvent = {
      type: 'account_update',
      event: 'AD_ACCOUNT_LINKED',
      data: {
        waba_id: '123456789',
        timestamp: 1704556800,
      },
    };
    
    expect(event.event).toBe('AD_ACCOUNT_LINKED');
  });

  it('should enforce discriminated union types', () => {
    const events: WebhookEvent[] = [
      {
        type: 'message_reaction',
        reaction: { message_id: '123', emoji: '👍', timestamp: 1704556800 },
        from: '+1234567890',
      },
      {
        type: 'session_end',
        session: { phone_number: '+1234567890', end_time: 1704556800, duration_seconds: 86400 },
      },
    ];
    
    expect(events).toHaveLength(2);
  });
});
