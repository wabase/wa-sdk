/**
 * Webhook payload parsing functionality
 * Supports all WhatsApp Cloud API webhook field types
 */

import type {
  WebhookEvent,
  WebhookField,
  WebhookMessage,
  WebhookStatus,
  MessagesWebhookValue,
  AccountAlertsWebhookValue,
  AccountReviewUpdateWebhookValue,
  AccountUpdateWebhookValue,
  BusinessCapabilityUpdateWebhookValue,
  PhoneNumberNameUpdateWebhookValue,
  PhoneNumberQualityUpdateWebhookValue,
  SecurityWebhookValue,
  MessageTemplateStatusUpdateWebhookValue,
  MessageTemplateQualityUpdateWebhookValue,
  MessageTemplateComponentsUpdateWebhookValue,
  TemplateCategoryUpdateWebhookValue,
  HistoryWebhookValue,
  PartnerSolutionsWebhookValue,
  PaymentConfigurationUpdateWebhookValue,
  SmbAppStateSyncWebhookValue,
  SmbMessageEchoesWebhookValue,
  UserPreferencesWebhookValue,
  AutomaticEventsWebhookValue,
} from "../types/webhooks.js";
import type { Validator } from "../validation/validator.js";
import { webhookEventSchema } from "../validation/schemas/webhooks.js";
import { ValidationError } from "../types/errors.js";

/**
 * All supported webhook field types
 */
export const WEBHOOK_FIELDS: WebhookField[] = [
  "messages",
  "account_alerts",
  "account_review_update",
  "account_update",
  "business_capability_update",
  "phone_number_name_update",
  "phone_number_quality_update",
  "security",
  "message_template_status_update",
  "message_template_quality_update",
  "message_template_components_update",
  "template_category_update",
  "flows",
  "history",
  "partner_solutions",
  "payment_configuration_update",
  "smb_app_state_sync",
  "smb_message_echoes",
  "user_preferences",
  "calls",
  "automatic_events",
];

/**
 * Parse webhook payload into typed event objects
 *
 * @param payload - Raw webhook payload
 * @param validator - Optional validator instance
 * @returns Parsed webhook event
 * @throws ValidationError if payload is invalid
 */
export function parseWebhook(
  payload: unknown,
  validator?: Validator,
): WebhookEvent {
  if (!payload || typeof payload !== "object") {
    throw new ValidationError("Webhook payload must be an object", "payload");
  }

  if (validator) {
    // @ts-expect-error - Schema validation returns compatible type at runtime
    return validator.validate(webhookEventSchema, payload);
  }

  const data = payload as Record<string, unknown>;

  if (data.object !== "whatsapp_business_account") {
    throw new ValidationError(
      'Invalid webhook object type. Expected "whatsapp_business_account"',
      "object",
    );
  }

  if (!Array.isArray(data.entry)) {
    throw new ValidationError(
      'Webhook payload must have an "entry" array',
      "entry",
    );
  }

  // Use double assertion since we've validated the structure above
  return payload as unknown as WebhookEvent;
}

/**
 * Get all changes of a specific field type from a webhook event
 */
export function getChangesByField<T extends WebhookField>(
  event: WebhookEvent,
  field: T,
): WebhookChangeResult<T> {
  const results: WebhookChangeResult<T> = [];

  for (const entry of event.entry) {
    for (const change of entry.changes) {
      if (change.field === field) {
        results.push({
          wabaId: entry.id,
          time: entry.time,
          value: change.value as WebhookValueType<T>,
        });
      }
    }
  }

  return results;
}

/**
 * Check if a webhook event contains a specific field type
 */
export function hasField(event: WebhookEvent, field: WebhookField): boolean {
  for (const entry of event.entry) {
    for (const change of entry.changes) {
      if (change.field === field) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get all unique field types present in a webhook event
 */
export function getFields(event: WebhookEvent): WebhookField[] {
  const fields = new Set<WebhookField>();

  for (const entry of event.entry) {
    for (const change of entry.changes) {
      if (WEBHOOK_FIELDS.includes(change.field as WebhookField)) {
        fields.add(change.field as WebhookField);
      }
    }
  }

  return Array.from(fields);
}

/**
 * Get messages from a webhook event (convenience helper)
 */
export function getMessages(event: WebhookEvent): WebhookMessage[] {
  const changes = getChangesByField(event, "messages");
  return changes.flatMap((c) => c.value.messages || []);
}

/**
 * Get statuses from a webhook event (convenience helper)
 */
export function getStatuses(event: WebhookEvent): WebhookStatus[] {
  const changes = getChangesByField(event, "messages");
  return changes.flatMap((c) => c.value.statuses || []);
}

/**
 * Get reaction messages from a webhook event
 */
export function getReactions(event: WebhookEvent): WebhookMessage[] {
  return getMessages(event).filter((message) => message.type === "reaction");
}

/**
 * Get account alerts from a webhook event
 */
export function getAccountAlerts(
  event: WebhookEvent,
): WebhookChangeResult<"account_alerts"> {
  return getChangesByField(event, "account_alerts");
}

/**
 * Get account review updates from a webhook event
 */
export function getAccountReviewUpdates(
  event: WebhookEvent,
): WebhookChangeResult<"account_review_update"> {
  return getChangesByField(event, "account_review_update");
}

/**
 * Get account updates from a webhook event
 */
export function getAccountUpdates(
  event: WebhookEvent,
): WebhookChangeResult<"account_update"> {
  return getChangesByField(event, "account_update");
}

/**
 * Get business capability updates from a webhook event
 */
export function getBusinessCapabilityUpdates(
  event: WebhookEvent,
): WebhookChangeResult<"business_capability_update"> {
  return getChangesByField(event, "business_capability_update");
}

/**
 * Get phone number name updates from a webhook event
 */
export function getPhoneNumberNameUpdates(
  event: WebhookEvent,
): WebhookChangeResult<"phone_number_name_update"> {
  return getChangesByField(event, "phone_number_name_update");
}

/**
 * Get template status updates from a webhook event
 */
export function getTemplateStatusUpdates(
  event: WebhookEvent,
): WebhookChangeResult<"message_template_status_update"> {
  return getChangesByField(event, "message_template_status_update");
}

/**
 * Get template quality updates from a webhook event
 */
export function getTemplateQualityUpdates(
  event: WebhookEvent,
): WebhookChangeResult<"message_template_quality_update"> {
  return getChangesByField(event, "message_template_quality_update");
}

/**
 * Get security events from a webhook event
 */
export function getSecurityEvents(
  event: WebhookEvent,
): WebhookChangeResult<"security"> {
  return getChangesByField(event, "security");
}

/**
 * Get phone number quality updates from a webhook event
 */
export function getPhoneNumberQualityUpdates(
  event: WebhookEvent,
): WebhookChangeResult<"phone_number_quality_update"> {
  return getChangesByField(event, "phone_number_quality_update");
}

/**
 * Get user preference updates from a webhook event
 */
export function getUserPreferences(
  event: WebhookEvent,
): WebhookChangeResult<"user_preferences"> {
  return getChangesByField(event, "user_preferences");
}

/**
 * Type mapping for webhook field values
 */
type WebhookValueType<T extends WebhookField> = T extends "messages"
  ? MessagesWebhookValue
  : T extends "account_alerts"
    ? AccountAlertsWebhookValue
    : T extends "account_review_update"
      ? AccountReviewUpdateWebhookValue
      : T extends "account_update"
        ? AccountUpdateWebhookValue
        : T extends "business_capability_update"
          ? BusinessCapabilityUpdateWebhookValue
          : T extends "phone_number_name_update"
            ? PhoneNumberNameUpdateWebhookValue
            : T extends "phone_number_quality_update"
              ? PhoneNumberQualityUpdateWebhookValue
              : T extends "security"
                ? SecurityWebhookValue
                : T extends "message_template_status_update"
                  ? MessageTemplateStatusUpdateWebhookValue
                  : T extends "message_template_quality_update"
                    ? MessageTemplateQualityUpdateWebhookValue
                    : T extends "message_template_components_update"
                      ? MessageTemplateComponentsUpdateWebhookValue
                      : T extends "template_category_update"
                        ? TemplateCategoryUpdateWebhookValue
                        : T extends "history"
                          ? HistoryWebhookValue
                          : T extends "partner_solutions"
                            ? PartnerSolutionsWebhookValue
                            : T extends "payment_configuration_update"
                              ? PaymentConfigurationUpdateWebhookValue
                              : T extends "smb_app_state_sync"
                                ? SmbAppStateSyncWebhookValue
                                : T extends "smb_message_echoes"
                                  ? SmbMessageEchoesWebhookValue
                                  : T extends "user_preferences"
                                    ? UserPreferencesWebhookValue
                                    : T extends "automatic_events"
                                      ? AutomaticEventsWebhookValue
                                      : never;

type WebhookChangeResult<T extends WebhookField> = Array<{
  wabaId: string;
  time?: number;
  value: WebhookValueType<T>;
}>;
