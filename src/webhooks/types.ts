/**
 * Webhook Event Type Definitions
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 */

/** Message Reaction Event - User reacts with emoji to a message */
export interface MessageReactionEvent {
  type: 'message_reaction';
  reaction: {
    message_id: string;
    emoji: string;
    timestamp: number;
  };
  from: string; // Phone number that reacted
}

/** Session End Event - 24-hour messaging window expires */
export interface SessionEndEvent {
  type: 'session_end';
  session: {
    phone_number: string;
    end_time: number;
    duration_seconds: number;
  };
}

/** Cart Update Event - Shopping cart modifications */
export interface CartUpdateEvent {
  type: 'cart_update';
  cart: {
    cart_id: string;
    phone_number: string;
    items: Array<{
      product_id: string;
      quantity: number;
      item_price: number;
    }>;
    total_amount: number;
    action: 'add' | 'remove' | 'update' | 'clear';
  };
}

/** Commerce Checkout Event - Checkout initiation */
export interface CommerceCheckoutEvent {
  type: 'commerce_checkout';
  checkout: {
    checkout_id: string;
    phone_number: string;
    total_amount: number;
    currency: string;
    status: 'initiated' | 'pending' | 'completed' | 'failed';
  };
}

/** Account Update Event - Account-level changes */
export interface AccountUpdateEvent {
  type: 'account_update';
  event: 'AD_ACCOUNT_LINKED' | 'PAYMENT_METHOD_SETUP';
  data: {
    waba_id: string;
    timestamp: number;
    details?: Record<string, unknown>;
  };
}

/** Union type for all webhook events (existing + new) */
export type WebhookEvent = 
  | MessageReactionEvent
  | SessionEndEvent
  | CartUpdateEvent
  | CommerceCheckoutEvent
  | AccountUpdateEvent;
