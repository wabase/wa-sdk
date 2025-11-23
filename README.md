# @wazapin/wa-sdk

> TypeScript SDK for WhatsApp Business Cloud API - Production-ready with gold standard quality

[![npm version](https://img.shields.io/npm/v/@wazapin/wa-sdk.svg)](https://www.npmjs.com/package/@wazapin/wa-sdk)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/tests-491%20passing-brightgreen.svg)](./coverage)

A modern, type-safe TypeScript SDK for the WhatsApp Business Cloud API. Built with developer experience in mind, featuring full TypeScript support, runtime validation, automatic retries, and cross-platform compatibility.

## Features

- **Full TypeScript Support** - Complete type definitions with strict mode
- **Runtime Validation** - Optional Zod validation (off/relaxed/strict modes)
- **Smart Retry Logic** - Automatic retry with exponential backoff
- **Cross-Platform** - Works in Node.js, Deno, Bun, and browsers
- **Tree-Shakeable** - Pure ESM modules for optimal bundle size
- **Complete API Coverage** - All message types, media, webhooks, and more
- **Well Tested** - 491 comprehensive unit tests (100% implementation coverage)
- **Framework Agnostic** - No dependencies on specific frameworks
- **Secure** - Built-in webhook signature verification
- **Great DX** - Intuitive API with clear error messages

---

## Installation

```bash
# npm
npm install @wazapin/wa-sdk

# pnpm
pnpm add @wazapin/wa-sdk

# yarn
yarn add @wazapin/wa-sdk

# bun
bun add @wazapin/wa-sdk
```

---

## Quick Start

### 1. Initialize the Client

```typescript
import { WhatsAppClient } from '@wazapin/wa-sdk';

const client = new WhatsAppClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',
});
```

### 2. Send Your First Message

```typescript
// Send a text message
const response = await client.messages.sendText({
  to: '+1234567890',
  text: 'Hello from WhatsApp SDK!',
  previewUrl: true, // Enable link preview
});

console.log('Message sent:', response.messages[0].id);
```

### 3. Send Media

```typescript
// Send an image
await client.messages.sendImage({
  to: '+1234567890',
  url: 'https://example.com/image.jpg',
  caption: 'Check out this image!',
});

// Send a document
await client.messages.sendDocument({
  to: '+1234567890',
  url: 'https://example.com/document.pdf',
  caption: 'Here is the document you requested',
  filename: 'invoice.pdf',
});
```

---

## Core Concepts

### Configuration Options

```typescript
const client = new WhatsAppClient({
  // Required
  accessToken: 'YOUR_ACCESS_TOKEN',
  phoneNumberId: 'YOUR_PHONE_NUMBER_ID',

  // Optional
  apiVersion: 'v24.0', // Default: latest
  validation: 'relaxed', // 'off' | 'relaxed' | 'strict'
  baseUrl: 'https://graph.facebook.com', // Custom base URL
  timeout: 30000, // Request timeout in ms (default: 30s)
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },

  // Custom fetch implementation (for testing)
  fetch: customFetchImplementation,
});
```

### Validation Modes

The SDK supports three validation modes:

```typescript
// 1. Off - No validation (fastest, use in production if you trust your data)
const client = new WhatsAppClient({
  // ...
  validation: 'off',
});

// 2. Relaxed - Validates required fields only (recommended)
const client = new WhatsAppClient({
  // ...
  validation: 'relaxed', // Default
});

// 3. Strict - Validates all fields strictly
const client = new WhatsAppClient({
  // ...
  validation: 'strict',
});
```

---

## 🔧 Logger & Debugging

### Automatic HTTP Headers

Every request to WhatsApp API automatically includes SDK identification headers:

```http
User-Agent: wazapin-wa/1.0.0 (Node/v22.21.0; linux; x64)
Wazapin-SDK-Version: 1.0.0
```

These headers help:
- Meta track SDK usage for better support
- Debug issues specific to SDK versions
- Monitor SDK adoption and performance

### Logger Configuration

The SDK includes a structured logger with automatic sensitive data redaction:

```typescript
// Default: INFO level (recommended for production)
const client = new WhatsAppClient({
  phoneNumberId: 'xxx',
  accessToken: 'xxx',
  // No logger config = INFO level by default
});

// Debug mode (development)
const devClient = new WhatsAppClient({
  phoneNumberId: 'xxx',
  accessToken: 'xxx',
  logger: {
    level: 'debug',      // Log everything
    timestamp: true,     // Add timestamps
  },
});

// Silent mode (production with minimal logs)
const prodClient = new WhatsAppClient({
  phoneNumberId: 'xxx',
  accessToken: 'xxx',
  logger: {
    level: 'error',      // Only log errors
  },
});

// Custom logger handler
import { WazapinLogger } from '@wazapin/wa-sdk';

const customLogger = new WazapinLogger({
  level: 'info',
  timestamp: true,
  handler: {
    debug: (msg) => myDebugLogger(msg),
    info: (msg) => myInfoLogger(msg),
    warn: (msg) => myWarnLogger(msg),
    error: (msg) => myErrorLogger(msg),
  },
});

const client = new WhatsAppClient({
  phoneNumberId: 'xxx',
  accessToken: 'xxx',
  logger: customLogger,
});
```

### Log Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| **debug** | All operations including HTTP requests/responses | Development, troubleshooting |
| **info** | Important operations (client init, messages sent) | Production (default) |
| **warn** | Warning conditions | Production |
| **error** | Error conditions only | Minimal logging |

### Log Format

```
[wazapin-wa] [LEVEL] Message
[wazapin-wa] [INFO] WhatsApp Client initialized { phoneNumberId: "123...", apiVersion: "v18.0" }
[wazapin-wa] [DEBUG] POST /messages { body: {...} }
[wazapin-wa] [DEBUG] POST /messages - Success { status: 200 }
[wazapin-wa] [ERROR] POST /messages - Failed { error: {...} }
```

With timestamps:
```
[2025-11-22T10:19:49.423Z] [wazapin-wa] [INFO] Message
```

### Sensitive Data Redaction

The logger automatically redacts sensitive information:

```typescript
logger.info('Request data', {
  accessToken: 'secret123',    // Redacted
  password: 'mypass',           // Redacted
  apiKey: 'key123',             // Redacted
  phoneNumberId: '123456',      // Kept
  to: '+1234567890',            // Kept
});

// Output:
// [wazapin-wa] [INFO] Request data {
//   "accessToken": "[REDACTED]",
//   "password": "[REDACTED]",
//   "apiKey": "[REDACTED]",
//   "phoneNumberId": "123456",
//   "to": "+1234567890"
// }
```

**Redacted fields:**
- `accessToken`, `access_token`
- `password`
- `secret`
- `token`
- `apiKey`, `api_key`
- `authorization`, `auth`

### Debug Mode Example

```typescript
const client = new WhatsAppClient({
  phoneNumberId: 'xxx',
  accessToken: 'xxx',
  logger: { level: 'debug', timestamp: true },
});

await client.messages.sendText({
  to: '+1234567890',
  text: 'Hello',
});

// Console output:
// [2025-11-22T10:19:49.420Z] [wazapin-wa] [DEBUG] HTTPClient initialized { baseUrl: "...", apiVersion: "v18.0", sdkVersion: "1.0.0" }
// [2025-11-22T10:19:49.423Z] [wazapin-wa] [INFO] WhatsApp Client initialized { phoneNumberId: "xxx", apiVersion: "v18.0" }
// [2025-11-22T10:19:49.425Z] [wazapin-wa] [DEBUG] POST 123456789/messages { body: { to: "+1234567890", text: "Hello" } }
// [2025-11-22T10:19:49.520Z] [wazapin-wa] [DEBUG] POST 123456789/messages - Success { status: 200 }
```

---

## 📱 Sending Messages

### Text Messages

```typescript
// Simple text
await client.messages.sendText({
  to: '+1234567890',
  text: 'Hello World!',
});

// With link preview
await client.messages.sendText({
  to: '+1234567890',
  text: 'Check out this link: https://example.com',
  previewUrl: true,
});

// Reply to a message
await client.messages.sendText({
  to: '+1234567890',
  text: 'This is a reply',
  context: {
    messageId: 'wamid.HBgL...', // Message ID to reply to
  },
});
```

### Image Messages

```typescript
// Using URL
await client.messages.sendImage({
  to: '+1234567890',
  url: 'https://example.com/image.jpg',
  caption: 'Beautiful sunset 🌅',
});

// Using uploaded media ID
await client.messages.sendImage({
  to: '+1234567890',
  mediaId: '1234567890',
  caption: 'Previously uploaded image',
});
```

### Video Messages

```typescript
await client.messages.sendVideo({
  to: '+1234567890',
  url: 'https://example.com/video.mp4',
  caption: 'Check out this video!',
});
```

### Audio Messages

```typescript
await client.messages.sendAudio({
  to: '+1234567890',
  url: 'https://example.com/audio.mp3',
});
```

### Document Messages

```typescript
await client.messages.sendDocument({
  to: '+1234567890',
  url: 'https://example.com/document.pdf',
  caption: 'Important document',
  filename: 'invoice-2025.pdf',
});
```

### Location Messages

```typescript
await client.messages.sendLocation({
  to: '+1234567890',
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'San Francisco',
  address: 'San Francisco, CA, USA',
});
```

### Contact Messages

```typescript
await client.messages.sendContact({
  to: '+1234567890',
  contacts: [
    {
      name: {
        formatted_name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
      },
      phones: [
        {
          phone: '+1234567890',
          type: 'MOBILE',
        },
      ],
      emails: [
        {
          email: 'john@example.com',
          type: 'WORK',
        },
      ],
    },
  ],
});
```

### Reaction Messages

```typescript
// Add reaction
await client.messages.sendReaction({
  to: '+1234567890',
  messageId: 'wamid.HBgL...',
  emoji: '👍',
});

// Remove reaction
await client.messages.sendReaction({
  to: '+1234567890',
  messageId: 'wamid.HBgL...',
  emoji: '', // Empty string removes reaction
});
```

### Interactive Messages - Buttons

```typescript
await client.messages.sendInteractiveButtons({
  to: '+1234567890',
  body: 'Choose an option:',
  buttons: [
    { id: 'btn1', title: 'Option 1' },
    { id: 'btn2', title: 'Option 2' },
    { id: 'btn3', title: 'Option 3' },
  ],
  header: {
    type: 'text',
    text: 'Interactive Buttons',
  },
  footer: 'Powered by WhatsApp SDK',
});
```

### Interactive Messages - List

```typescript
await client.messages.sendInteractiveList({
  to: '+1234567890',
  body: 'Select a product:',
  buttonText: 'View Menu',
  sections: [
    {
      title: 'Main Dishes',
      rows: [
        { id: 'item1', title: 'Pizza', description: 'Delicious pizza' },
        { id: 'item2', title: 'Burger', description: 'Juicy burger' },
      ],
    },
    {
      title: 'Desserts',
      rows: [
        { id: 'item3', title: 'Ice Cream', description: 'Cool treat' },
      ],
    },
  ],
});
```

### Interactive Messages - CTA URL Buttons

Send messages with call-to-action URL buttons that provide a cleaner, more professional appearance than raw URLs:

```typescript
// Basic CTA message
await client.messages.sendInteractiveCTA({
  to: '+1234567890',
  body: 'Check out our new products!',
  action: {
    displayText: 'View Products',
    url: 'https://example.com/products'
  }
});

// CTA with image header and footer
await client.messages.sendInteractiveCTA({
  to: '+1234567890',
  header: {
    type: 'image',
    image: { link: 'https://example.com/banner.jpg' }
  },
  body: 'Tap the button below to see available dates.',
  action: {
    displayText: 'See Dates',
    url: 'https://example.com/calendar?ref=whatsapp'
  },
  footer: 'Dates subject to change.'
});

// CTA with video header
await client.messages.sendInteractiveCTA({
  to: '+1234567890',
  header: {
    type: 'video',
    video: { link: 'https://example.com/promo.mp4' }
  },
  body: 'Watch our latest promotional video!',
  action: {
    displayText: 'Learn More',
    url: 'https://example.com/about'
  }
});
```

**Supported Header Types**:
- Text (max 60 characters)
- Image (from URL or media ID)
- Video (from URL or media ID)
- Document (from URL or media ID)

**Character Limits**:
- Header text: 60 characters
- Body text: 1024 characters
- Button text: 20 characters
- Footer text: 60 characters

### Flow Messages

Send interactive WhatsApp Flows (forms, surveys, appointments):

```typescript
// Send a published flow
await client.flows.send(phoneNumberId, {
  to: '+1234567890',
  header: { type: 'text', text: 'Book Your Appointment' },
  body: { text: 'Complete your booking in a few steps' },
  footer: { text: 'Powered by Your Business' },
  flow_id: 'your-flow-id',
  flow_cta: 'Book Now',
  flow_action: 'navigate',
  flow_action_payload: {
    screen: 'WELCOME',
    data: { service: 'consultation' }
  },
  flow_token: 'session-123'
});

// Test a draft flow by name
await client.flows.send(phoneNumberId, {
  to: '+1234567890',
  body: { text: 'Test flow' },
  flow_name: 'My Test Flow',
  flow_cta: 'Start',
  mode: 'draft'
});
```

### Template Messages

```typescript
await client.messages.sendTemplate({
  to: '+1234567890',
  templateName: 'hello_world',
  languageCode: 'en',
  components: [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'John' },
      ],
    },
  ],
});
```

### Mark Messages as Read

```typescript
await client.messages.markAsRead('wamid.HBgL...');
```

---

## 📤 Media Operations

### Upload Media

```typescript
import { readFile } from 'fs/promises';

// Upload from file
const fileBuffer = await readFile('./image.jpg');
const uploadResponse = await client.media.upload(
  fileBuffer,
  'image/jpeg'
);

console.log('Media ID:', uploadResponse.id);

// Use uploaded media in message
await client.messages.sendImage({
  to: '+1234567890',
  mediaId: uploadResponse.id,
  caption: 'Uploaded image',
});
```

### Download Media

```typescript
// Get media URL and metadata
const mediaInfo = await client.media.getUrl('MEDIA_ID');
console.log('URL:', mediaInfo.url); // Valid for 5 minutes
console.log('MIME Type:', mediaInfo.mime_type);
console.log('File Size:', mediaInfo.file_size);

// Download media directly
const downloadResponse = await client.media.download('MEDIA_ID');
console.log('Buffer:', downloadResponse.buffer);
console.log('MIME Type:', downloadResponse.mimeType);
```

### Media File Limits

| Media Type | Max Size | Supported Formats |
|------------|----------|-------------------|
| **Image** | 5 MB | JPEG, PNG |
| **Video** | 16 MB | 3GPP, MP4 |
| **Audio** | 16 MB | AAC, AMR, MP3, M4A, OGG (OPUS) |
| **Document** | 100 MB | TXT, XLS, XLSX, DOC, DOCX, PPT, PPTX, PDF |
| **Sticker** | 500 KB (animated), 100 KB (static) | WebP |

---

## 🚀 Embedded Signup

Onboard businesses to WhatsApp Cloud API using the Embedded Signup flow:

### Complete Onboarding Flow

```typescript
import { WhatsAppClient } from '@wazapin/wa-sdk';

const client = new WhatsAppClient({
  phoneNumberId: 'your-phone-id',
  accessToken: 'your-system-user-token' // System User token required
});

// Step 1: Debug OAuth token from signup flow
const tokenInfo = await client.embeddedSignup.debugToken(oauthToken);
const wabaIds = tokenInfo.data.granular_scopes
  .find(scope => scope.scope === 'whatsapp_business_management')
  ?.target_ids || [];

console.log('Shared WABAs:', wabaIds);

// Step 2: Get WABA details
const wabas = await client.embeddedSignup.listSharedWABAs(businessId);
wabas.data.forEach(waba => {
  console.log(`WABA: ${waba.name} (${waba.id})`);
  console.log(`Currency: ${waba.currency}`);
});

// Step 3: Add system user with permissions
await client.embeddedSignup.addSystemUser(wabaId, {
  user: systemUserId,
  tasks: ['MANAGE'] // or ['DEVELOP'] or both
});

// Step 4: Share credit line for billing
const allocation = await client.embeddedSignup.attachCreditLine(creditLineId, {
  waba_id: wabaId,
  waba_currency: 'USD'
});
console.log('Allocation Config ID:', allocation.allocation_config_id);

// Step 5: Verify credit sharing
const record = await client.embeddedSignup.verifyCreditSharing(
  allocation.allocation_config_id
);
if (record.receiving_credential?.id) {
  console.log('Credit successfully shared');
}

// Step 6: Subscribe to webhooks
await client.embeddedSignup.subscribeToWABA(wabaId);
console.log('Subscribed to WABA webhooks');
```

### Filter and Sort WABAs

```typescript
// Get WABAs created after timestamp
const recentWabas = await client.embeddedSignup.listOwnedWABAs(businessId, {
  filtering: [{
    field: 'creation_time',
    operator: 'GREATER_THAN',
    value: '1604962813'
  }],
  sort: 'creation_time_descending'
});
```

### Manage Credit Lines

```typescript
// Get credit lines
const credits = await client.embeddedSignup.getExtendedCredits(businessId, [
  'id', 'legal_entity_name', 'credit_available', 'balance', 'currency'
]);

credits.data.forEach(credit => {
  console.log(`${credit.legal_entity_name}`);
  console.log(`Available: ${credit.credit_available} cents`);
});

// Get credit sharing status
const record = await client.embeddedSignup.getCreditSharingRecord(allocationConfigId);
console.log('Status:', record.request_status); // 'ACTIVE' or 'DELETED'

// Revoke credit access
await client.embeddedSignup.revokeCreditSharing(allocationConfigId);
```

### Override Webhook URL per WABA

```typescript
// Set alternate webhook URL for specific WABA
await client.embeddedSignup.overrideCallbackURL(wabaId, {
  override_callback_uri: 'https://alternate.example.com/webhook',
  verify_token: 'my_verify_token'
});

// Verify override was set
const subs = await client.embeddedSignup.listSubscriptions(wabaId);
console.log('Override URL:', subs.data[0].override_callback_uri);
```

### Manage Phone Numbers and Templates

```typescript
// List phone numbers with filtering
const livePhones = await client.embeddedSignup.listPhoneNumbers(wabaId, {
  filtering: [{
    field: 'account_mode',
    operator: 'EQUAL',
    value: 'LIVE'
  }]
});

// Get display name certificates
const certs = await client.embeddedSignup.getPhoneNumberCertificate(wabaId);
certs.data.forEach(phone => {
  console.log(`${phone.display_phone_number}: ${phone.name_status}`);
  if (phone.new_certificate) {
    console.log('New certificate:', phone.new_certificate);
  }
});

// List message templates
const templates = await client.embeddedSignup.listMessageTemplates(wabaId);
const approved = templates.data.filter(t => t.status === 'APPROVED');
console.log(`${approved.length} approved templates`);

// Get template namespace
const ns = await client.embeddedSignup.getTemplateNamespace(wabaId);
console.log('Namespace:', ns.message_template_namespace);
```

---

## 🔔 Webhooks

### Parse Webhook Events

```typescript
import { WebhookEvent } from '@wazapin/wa-sdk';

// In your webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    // Parse incoming webhook
    const event: WebhookEvent = client.webhooks.parse(req.body);

    // Handle different event types
    if (event.entry[0]?.changes[0]?.value?.messages) {
      const messages = event.entry[0].changes[0].value.messages;
      
      for (const message of messages) {
        if (message.type === 'text') {
          console.log('Received text:', message.text.body);
        } else if (message.type === 'image') {
          console.log('Received image:', message.image.id);
        }
        // ... handle other types
      }
    }

    // Handle status updates
    if (event.entry[0]?.changes[0]?.value?.statuses) {
      const statuses = event.entry[0].changes[0].value.statuses;
      
      for (const status of statuses) {
        console.log('Message status:', status.status); // sent, delivered, read, failed
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});
```

### Verify Webhook Signatures

```typescript
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const rawBody = JSON.stringify(req.body);

  // Verify signature
  const isValid = await client.webhooks.verify(
    rawBody,
    signature,
    'YOUR_APP_SECRET'
  );

  if (!isValid) {
    return res.sendStatus(403);
  }

  // Process webhook...
  res.sendStatus(200);
});
```

---

## 📊 Messaging Limits

WhatsApp enforces messaging limits to control the number of unique users your business can message within a 24-hour period. Understanding and monitoring these limits is crucial for managing your WhatsApp Business operations.

### What are Messaging Limits?

Messaging limits are the maximum number of unique WhatsApp user phone numbers your business can deliver messages to, **outside of a customer service window**, within a moving 24-hour period.

**Important**: These limits are calculated at the **business portfolio level** and shared by all phone numbers within a portfolio.

### Available Tiers

| Tier | Max Unique Contacts | Availability |
|------|-------------------|--------------|
| **TIER_250** | 250 per 24 hours | Default for new accounts |
| **TIER_2000** | 2,000 per 24 hours | After verification or quality messaging |
| **TIER_10K** | 10,000 per 24 hours | Via automatic scaling |
| **TIER_100K** | 100,000 per 24 hours | Via automatic scaling |
| **TIER_UNLIMITED** | Unlimited | Via automatic scaling |

### Check Your Current Limit

```typescript
// Get your current messaging limit
const limit = await client.account.getMessagingLimit();

console.log('Current tier:', limit.whatsapp_business_manager_messaging_limit);
console.log('Phone number ID:', limit.id);

// Example output:
// Current tier: TIER_250
// Phone number ID: 106540352242922
```

### Understanding Tier Values

```typescript
import type { MessagingLimitTier } from '@wazapin/wa-sdk';

const limit = await client.account.getMessagingLimit();

// Check your tier and take action
switch (limit.whatsapp_business_manager_messaging_limit) {
  case 'TIER_250':
    console.log('You can message up to 250 unique contacts per 24 hours');
    console.log('Complete verification or send quality messages to increase');
    break;
  
  case 'TIER_2000':
    console.log('You can message up to 2,000 unique contacts per 24 hours');
    console.log('Use at least 50% of your limit to trigger automatic scaling');
    break;
  
  case 'TIER_10K':
    console.log('You can message up to 10,000 unique contacts per 24 hours');
    break;
  
  case 'TIER_100K':
    console.log('You can message up to 100,000 unique contacts per 24 hours');
    break;
  
  case 'TIER_UNLIMITED':
    console.log('You have unlimited messaging capability!');
    break;
}
```

### How to Increase Your Limit

#### From TIER_250 to TIER_2000

Complete **one** of these paths:

1. **Verify Your Business**
   - Complete business verification through Meta Business Suite
   - [Verification Guide →](https://www.facebook.com/business/help/2058515294227817)

2. **Partner Verification**
   - Have your solution provider verify your business (if applicable)

3. **Quality Messaging**
   - Send 2,000 delivered messages outside customer service windows
   - To unique WhatsApp user phone numbers
   - Within a 30-day moving period
   - Using templates with high quality ratings

#### From TIER_2000 and Above (Automatic Scaling)

Once you reach TIER_2000, WhatsApp will **automatically increase** your limit if you meet these criteria:

- ✅ Send **high-quality messages** across all phone numbers and templates
- ✅ Utilize **at least 50%** of your current limit in the last 7 days

**Timeline**: Limit increases happen **within 6 hours** when criteria are met.

### Best Practices

#### 1. Monitor Your Limits Regularly

```typescript
// Check limits daily
const checkDailyLimit = async () => {
  const limit = await client.account.getMessagingLimit();
  
  // Store in your database
  await db.limits.create({
    tier: limit.whatsapp_business_manager_messaging_limit,
    checkedAt: new Date(),
  });
  
  // Alert if still at TIER_250 after 30 days
  if (limit.whatsapp_business_manager_messaging_limit === 'TIER_250') {
    console.warn('Still at basic tier - consider business verification');
  }
};
```

#### 2. Track Message Volume

```typescript
// Track messages sent per day
const trackMessageVolume = async () => {
  const sentToday = await db.messages.count({
    date: new Date().toDateString(),
  });
  
  const limit = await client.account.getMessagingLimit();
  const maxPerDay = getTierLimit(limit.whatsapp_business_manager_messaging_limit);
  
  console.log(`Sent: ${sentToday}/${maxPerDay} (${(sentToday/maxPerDay*100).toFixed(1)}%)`);
  
  // Alert when approaching limit
  if (sentToday >= maxPerDay * 0.8) {
    console.warn('Approaching daily messaging limit!');
  }
};

function getTierLimit(tier: MessagingLimitTier): number {
  const limits = {
    TIER_250: 250,
    TIER_2000: 2000,
    TIER_10K: 10000,
    TIER_100K: 100000,
    TIER_UNLIMITED: Infinity,
  };
  return limits[tier];
}
```

#### 3. Maintain Message Quality

```typescript
// Tips for maintaining high quality ratings:
const qualityBestPractices = {
  // ✅ DO:
  personalizedMessages: 'Use customer names and relevant context',
  timing: 'Send during appropriate hours for the recipient timezone',
  templates: 'Use approved message templates with clear value',
  optIn: 'Ensure customers have opted in to receive messages',
  
  // ❌ DON'T:
  spam: 'Avoid sending too many messages to same user',
  generic: 'Avoid generic, impersonal bulk messages',
  clickbait: 'Avoid misleading or clickbait content',
  blocking: 'Monitor and reduce user blocks/reports',
};
```

### Important Notes

- **Limits Reset**: The 24-hour period is a **moving window**, not a calendar day
- **Shared Limits**: All phone numbers in your portfolio share the same limit
- **Quality Matters**: Poor message quality can prevent automatic scaling
- **Customer Service Window**: Messages within 24 hours of user interaction don't count toward limits
- **One Phone Can Consume All**: One phone number can potentially use the entire portfolio limit

### Related Resources

- [Official Messaging Limits Documentation](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- [Message Quality Guidelines](https://developers.facebook.com/docs/whatsapp/messaging-limits#message-quality)
- [Business Verification Guide](https://www.facebook.com/business/help/2058515294227817)

---

## 🏢 Business Profile Management

Manage your WhatsApp Business profile information including business description, contact details, address, category, and profile picture.

### Get Business Profile

Retrieve your current business profile information:

```typescript
// Get all profile fields
const profile = await client.account.getBusinessProfile();

const data = profile.data[0];
console.log('About:', data.about);
console.log('Address:', data.address);
console.log('Email:', data.email);
console.log('Websites:', data.websites);
console.log('Vertical:', data.vertical);
console.log('Profile Picture:', data.profile_picture_url);

// Get specific fields only
const basicProfile = await client.account.getBusinessProfile([
  'about',
  'email',
  'websites'
]);
```

**Available Fields**:
- `about` - Business description (max 139 characters)
- `address` - Business address (max 256 characters)
- `description` - Extended description (max 512 characters)
- `email` - Contact email (max 128 characters)
- `messaging_product` - Always "whatsapp"
- `profile_picture_url` - Profile picture URL (read-only)
- `vertical` - Business category
- `websites` - Array of website URLs (max 2)

### Update Business Profile

Update your business profile information:

```typescript
// Update complete profile
await client.account.updateBusinessProfile({
  messaging_product: 'whatsapp',
  about: 'Your friendly neighborhood business',
  address: '123 Main St, City, Country',
  description: 'We provide excellent service with quality products for all your needs.',
  email: 'contact@business.com',
  vertical: 'RETAIL',
  websites: ['https://business.com', 'https://shop.business.com']
});

// Update partial profile
await client.account.updateBusinessProfile({
  messaging_product: 'whatsapp',
  about: 'New business description',
  email: 'newemail@business.com'
});
```

**Field Limits**:
- `about`: Maximum 139 characters
- `address`: Maximum 256 characters
- `description`: Maximum 512 characters
- `email`: Maximum 128 characters, must be valid email format
- `websites`: Maximum 2 URLs

### Business Categories (Verticals)

Valid business category options:

| Category | Description |
|----------|-------------|
| `AUTOMOTIVE` | Automotive industry |
| `BEAUTY` | Beauty & cosmetics |
| `APPAREL` | Clothing & fashion |
| `EDU` | Education |
| `ENTERTAIN` | Entertainment |
| `EVENT_PLAN` | Event planning |
| `FINANCE` | Financial services |
| `GROCERY` | Grocery & food retail |
| `GOVT` | Government services |
| `HOTEL` | Hotels & lodging |
| `HEALTH` | Healthcare |
| `NONPROFIT` | Non-profit organizations |
| `PROF_SERVICES` | Professional services |
| `RETAIL` | Retail & e-commerce |
| `TRAVEL` | Travel & tourism |
| `RESTAURANT` | Restaurants & dining |
| `OTHER` | Other industries |

### Update Profile Picture

To update your profile picture, you must first upload the image via the Media API:

```typescript
// Step 1: Upload profile picture
const mediaBuffer = fs.readFileSync('profile-picture.jpg');
const uploadResult = await client.media.upload(mediaBuffer, 'image/jpeg');

// Step 2: Update profile with media handle
await client.account.updateBusinessProfile({
  messaging_product: 'whatsapp',
  profile_picture_handle: uploadResult.id
});

// Step 3: Verify the update
const updatedProfile = await client.account.getBusinessProfile(['profile_picture_url']);
console.log('New profile picture:', updatedProfile.data[0].profile_picture_url);
```

### Best Practices

1. **Keep Information Current**: Regularly update your business profile to reflect accurate information
2. **Use Appropriate Category**: Select the vertical that best represents your business
3. **Professional Description**: Use clear, professional language in your about and description fields
4. **Valid Contact Information**: Ensure email and website URLs are valid and accessible
5. **Quality Profile Picture**: Use a high-quality, professional image for your profile picture
6. **Character Limits**: Stay within field character limits to avoid validation errors

### Related Resources

- [Business Profile API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/business-profiles)
- [WhatsApp Business Profile Guidelines](https://www.facebook.com/business/help/757569725593362)

---

## 💬 Conversational Components

Configure in-chat features to make it easier for WhatsApp users to interact with your business. Includes welcome messages, ice breakers (prompts), and slash commands.

### Configure Welcome Messages

Enable webhook notifications when users open chat for the first time:

```typescript
await client.account.configureConversationalAutomation({
  enableWelcomeMessage: true
});
```

**Note**: Welcome messages trigger a `request_welcome` webhook event that you can handle to send custom welcome messages.

### Configure Ice Breakers (Prompts)

Set up tappable text strings that appear when users first chat with you:

```typescript
await client.account.configureConversationalAutomation({
  prompts: [
    'Book a flight',
    'Plan a vacation',
    'Find hotels',
    'Rent a car'
  ]
});
```

**Limits**:
- Maximum 4 prompts
- Maximum 80 characters per prompt
- Emojis not supported

### Configure Slash Commands

Set up commands that users can access by typing "/" in the chat:

```typescript
await client.account.configureConversationalAutomation({
  commands: [
    {
      commandName: 'tickets',
      commandDescription: 'Book flight tickets'
    },
    {
      commandName: 'hotel',
      commandDescription: 'Find and book hotels'
    },
    {
      commandName: 'help',
      commandDescription: 'Get help with our services'
    }
  ]
});
```

**Limits**:
- Maximum 30 commands
- Command name: Maximum 32 characters
- Command description: Maximum 256 characters
- Emojis not supported

### Configure All Features Together

You can configure multiple features in a single call:

```typescript
await client.account.configureConversationalAutomation({
  enableWelcomeMessage: true,
  prompts: [
    'Book a flight',
    'Plan a vacation'
  ],
  commands: [
    {
      commandName: 'tickets',
      commandDescription: 'Book flight tickets'
    },
    {
      commandName: 'hotel',
      commandDescription: 'Find and book hotels'
    }
  ]
});
```

### Get Current Configuration

Retrieve the current conversational components configuration:

```typescript
const config = await client.account.getConversationalAutomation();

console.log('Welcome enabled:', config.conversational_automation.enable_welcome_message);
console.log('Prompts:', config.conversational_automation.prompts);
console.log('Commands:', config.conversational_automation.commands);

// List all prompts
config.conversational_automation.prompts?.forEach((prompt, index) => {
  console.log(`Prompt ${index + 1}: ${prompt}`);
});

// List all commands
config.conversational_automation.commands?.forEach((cmd) => {
  console.log(`/${cmd.command_name}: ${cmd.command_description}`);
});
```

### Best Practices

1. **Clear Prompts**: Use concise, action-oriented prompts that clearly indicate what users can do
2. **Descriptive Commands**: Write command descriptions that explain exactly what the command does
3. **Logical Organization**: Group related commands together with consistent naming
4. **Test Thoroughly**: Test all prompts and commands to ensure they work as expected
5. **Update Regularly**: Keep prompts and commands updated based on user feedback and business needs

### Related Resources

- [Conversational Components Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components)
- [Welcome Messages Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers/conversational-components#welcome-messages)

---

## 🔧 Error Handling

The SDK provides typed error classes for different scenarios:

```typescript
import {
  APIError,
  ValidationError,
  NetworkError,
  RateLimitError,
} from '@wazapin/wa-sdk';

try {
  await client.messages.sendText({
    to: '+1234567890',
    text: 'Hello!',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    // Invalid parameters
    console.error('Validation failed:', error.message);
    console.error('Failed field:', error.field);
  } else if (error instanceof APIError) {
    // API returned an error
    console.error('API Error:', error.statusCode, error.message);
    console.error('Error code:', error.code);
  } else if (error instanceof RateLimitError) {
    // Rate limit hit
    console.error('Rate limited. Retry after:', error.retryAfter);
  } else if (error instanceof NetworkError) {
    // Network issue
    console.error('Network error:', error.message);
  } else {
    // Unknown error
    console.error('Unknown error:', error);
  }
}
```

---

## Retry Logic

The SDK automatically retries failed requests with exponential backoff:

```typescript
const client = new WhatsAppClient({
  accessToken: 'YOUR_TOKEN',
  phoneNumberId: 'YOUR_PHONE_ID',
  
  retry: {
    maxRetries: 3,           // Max number of retry attempts
    initialDelay: 1000,      // Initial delay in ms
    maxDelay: 10000,         // Maximum delay in ms
    backoffMultiplier: 2,    // Multiply delay by this factor
  },
});

// The SDK will automatically retry:
// - Network errors
// - 5xx server errors
// - Rate limit errors (respects retry-after header)
//
// The SDK will NOT retry:
// - 4xx client errors (except rate limits)
// - Validation errors
```

---

## Cross-Platform Support

### Node.js

```typescript
import { WhatsAppClient } from '@wazapin/wa-sdk';

const client = new WhatsAppClient({
  accessToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.PHONE_NUMBER_ID!,
});
```

### Deno

```typescript
import { WhatsAppClient } from 'npm:@wazapin/wa-sdk';

const client = new WhatsAppClient({
  accessToken: Deno.env.get('WHATSAPP_TOKEN')!,
  phoneNumberId: Deno.env.get('PHONE_NUMBER_ID')!,
});
```

### Bun

```typescript
import { WhatsAppClient } from '@wazapin/wa-sdk';

const client = new WhatsAppClient({
  accessToken: Bun.env.WHATSAPP_TOKEN!,
  phoneNumberId: Bun.env.PHONE_NUMBER_ID!,
});
```

### Browser

```typescript
import { WhatsAppClient } from '@wazapin/wa-sdk';

const client = new WhatsAppClient({
  accessToken: 'YOUR_TOKEN', // CAUTION: Don't expose tokens in frontend!
  phoneNumberId: 'YOUR_PHONE_ID',
});

// Note: For production, always proxy WhatsApp API requests through your backend
```

---

## 🔄 WhatsApp Flows Management

Create, manage, and analyze interactive WhatsApp Flows:

### Create and Publish Flows

```typescript
// Create a new flow
const flow = await client.flows.create({
  name: 'Appointment Booking',
  categories: ['APPOINTMENT_BOOKING', 'CUSTOMER_SUPPORT'],
  endpoint_uri: 'https://your-server.com/flow-webhook'
});

console.log('Flow ID:', flow.id);

// Upload Flow JSON definition
const flowJSON = {
  version: '5.0',
  screens: [
    {
      id: 'WELCOME',
      title: 'Book Appointment',
      layout: {
        type: 'SingleColumnLayout',
        children: [
          { type: 'TextHeading', text: 'Welcome!' },
          { type: 'TextBody', text: 'Select your preferred time' },
          {
            type: 'Footer',
            label: 'Continue',
            on-click-action: { name: 'complete', payload: {} }
          }
        ]
      }
    }
  ]
};

await client.flows.uploadJSON(flow.id, flowJSON);

// Publish the flow (makes it immutable)
await client.flows.publish(flow.id);
console.log('Flow published successfully');
```

### Manage Flows

```typescript
// List all flows
const flows = await client.flows.list();
flows.data.forEach(flow => {
  console.log(`${flow.name} - ${flow.status}`);
  console.log(`Categories: ${flow.categories.join(', ')}`);
});

// Get flow details with health status
const flowDetails = await client.flows.get(
  flowId,
  ['id', 'name', 'status', 'health_status', 'validation_errors']
);

console.log('Can send:', flowDetails.health_status?.can_send_message);

// Update flow metadata
await client.flows.update(flowId, {
  name: 'Updated Flow Name',
  endpoint_uri: 'https://new-endpoint.com/webhook'
});

// Get preview URL for testing
const preview = await client.flows.getPreview(flowId);
console.log('Preview URL:', preview.preview?.preview_url);
console.log('Expires at:', preview.preview?.expires_at);

// Deprecate an old flow
await client.flows.deprecate(oldFlowId);

// Delete a draft flow
await client.flows.delete(draftFlowId);
```

### Clone and Migrate Flows

```typescript
// Clone an existing flow
const clonedFlow = await client.flows.create({
  name: 'Cloned Flow',
  categories: ['LEAD_GENERATION'],
  clone_flow_id: 'original-flow-id'
});

// Migrate flows between WABAs
const result = await client.flows.migrate({
  source_waba_id: 'source-waba-123',
  source_flow_names: ['Flow 1', 'Flow 2']
});

console.log('Migrated:', result.migrated_flows.length);
console.log('Failed:', result.failed_flows.length);
```

### Flow Analytics

```typescript
// Get endpoint request count
const requestMetrics = await client.flows.getAnalytics(flowId, {
  metric_name: 'ENDPOINT_REQUEST_COUNT',
  granularity: 'DAY',
  since: '2024-01-01',
  until: '2024-01-31'
});

requestMetrics.metric.data_points.forEach(point => {
  console.log(`${point.timestamp}: ${point.data[0].value} requests`);
});

// Get error rate
const errorRate = await client.flows.getAnalytics(flowId, {
  metric_name: 'ENDPOINT_REQUEST_ERROR_RATE',
  granularity: 'LIFETIME',
  since: '2024-01-01',
  until: '2024-01-31'
});

console.log('Error rate:', errorRate.metric.data_points[0].data[0].value);

// Monitor endpoint latency
const latency = await client.flows.getAnalytics(flowId, {
  metric_name: 'ENDPOINT_REQUEST_LATENCY_SECONDS_CEIL',
  granularity: 'DAY',
  since: '2024-01-01',
  until: '2024-01-31'
});

// Check endpoint availability
const availability = await client.flows.getAnalytics(flowId, {
  metric_name: 'ENDPOINT_AVAILABILITY',
  granularity: 'DAY',
  since: '2024-01-01',
  until: '2024-01-31'
});
```

### List Flow Assets

```typescript
// Get Flow JSON download URL
const assets = await client.flows.listAssets(flowId);
assets.data.forEach(asset => {
  console.log(`${asset.name} (${asset.asset_type})`);
  console.log(`Download: ${asset.download_url}`);
});
```

---

## Advanced Usage

### Using Zod Schemas Directly

```typescript
import { schemas } from '@wazapin/wa-sdk';

// Validate data manually
const result = schemas.sendTextParamsSchema.safeParse({
  to: '+1234567890',
  text: 'Hello',
});

if (!result.success) {
  console.error('Validation errors:', result.error);
}

// Use schemas for your own validation
import { z } from 'zod';

const mySchema = z.object({
  textMessage: schemas.sendTextParamsSchema,
  // ... your other fields
});
```

### Custom Fetch Implementation

```typescript
// Useful for testing or adding custom middleware
const customFetch = async (url: RequestInfo, init?: RequestInit) => {
  console.log('Making request to:', url);
  const response = await fetch(url, init);
  console.log('Response status:', response.status);
  return response;
};

const client = new WhatsAppClient({
  accessToken: 'YOUR_TOKEN',
  phoneNumberId: 'YOUR_PHONE_ID',
  fetch: customFetch,
});
```

---

## API Reference

### Client Namespaces

The `WhatsAppClient` organizes methods into four namespaces:

#### `client.messages.*`
- `sendText()` - Send text messages
- `sendImage()` - Send image messages  
- `sendVideo()` - Send video messages
- `sendAudio()` - Send audio messages
- `sendDocument()` - Send document messages
- `sendSticker()` - Send sticker messages
- `sendLocation()` - Send location messages
- `sendContact()` - Send contact messages
- `sendReaction()` - Send reaction (emoji) messages
- `sendInteractiveButtons()` - Send interactive button messages
- `sendInteractiveList()` - Send interactive list messages
- `sendTemplate()` - Send template messages
- `markAsRead()` - Mark message as read

#### `client.media.*`
- `upload()` - Upload media file
- `download()` - Download media file
- `getUrl()` - Get media URL and metadata

#### `client.webhooks.*`
- `parse()` - Parse webhook payload
- `verify()` - Verify webhook signature

#### `client.account.*`
- `getMessagingLimit()` - Get current messaging limit tier

#### `client.embeddedSignup.*`
- `debugToken()` - Debug OAuth token to get shared WABA IDs
- `listSharedWABAs()` - List client WABAs shared via embedded signup
- `listOwnedWABAs()` - List owned/client WABAs with filtering
- `getWABAInfo()` - Get detailed WABA information
- `getAssignedUsers()` - List users assigned to a WABA
- `addSystemUser()` - Add system user with permissions
- `listSystemUsers()` - Get business system users
- `getExtendedCredits()` - Get credit lines for billing
- `attachCreditLine()` - Share credit line with client WABA
- `verifyCreditSharing()` - Verify credit sharing
- `getCreditSharingRecord()` - Get credit sharing details
- `revokeCreditSharing()` - Remove credit line access
- `subscribeToWABA()` - Subscribe app to WABA webhooks
- `listSubscriptions()` - List webhook subscriptions
- `unsubscribeFromWABA()` - Remove webhook subscription
- `overrideCallbackURL()` - Set alternate webhook URL
- `listPhoneNumbers()` - List phone numbers with filtering
- `getPhoneNumberCertificate()` - Get display name certificates
- `listMessageTemplates()` - Get pre-approved templates
- `getTemplateNamespace()` - Get template namespace

---

## Important Notes

### Phone Number Format

Always include the country code with `+` prefix:

```typescript
// ✅ Good
await client.messages.sendText({
  to: '+1234567890', // Country code + number
  text: 'Hello',
});

// ❌ Bad (may result in misdelivered messages)
await client.messages.sendText({
  to: '1234567890', // Missing +
  text: 'Hello',
});
```

### Media Expiration

- **Uploaded media IDs**: Valid for 30 days
- **Webhook media IDs**: Valid for 7 days  
- **Media URLs**: Valid for 5 minutes only!

```typescript
// Get URL
const mediaInfo = await client.media.getUrl('MEDIA_ID');

// Use URL within 5 minutes
const response = await fetch(mediaInfo.url);

// After 5 minutes, get a new URL
const newMediaInfo = await client.media.getUrl('MEDIA_ID');
```

### Rate Limits

WhatsApp enforces rate limits. The SDK automatically handles rate limit errors by:
1. Reading the `retry-after` header
2. Waiting the specified time
3. Retrying the request

---

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions:

```typescript
import type {
  WhatsAppClient,
  SendTextParams,
  MessageResponse,
  WebhookEvent,
  MediaUploadResponse,
} from '@wazapin/wa-sdk';

// Full autocomplete and type checking
const params: SendTextParams = {
  to: '+1234567890',
  text: 'Hello',
  previewUrl: true,
};

const response: MessageResponse = await client.messages.sendText(params);
```

---

## Contributing

Contributions are welcome! See our documentation for details:

- 📖 **[Contributing Guide](./docs/CONTRIBUTING.md)** - Setup, coding standards, workflow
- 🔍 **[API Verification](./docs/API_VERIFICATION.md)** - How we ensure API compliance
- 📊 **[Project Status](./docs/PROJECT_STATUS.md)** - Current progress and roadmap

**Quick commands**:
```bash
npm test              # Run tests
npm run lint          # Lint code
npm run build         # Build distribution
npm run test:coverage # Coverage report
```

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for complete development guide

---

## License

Wazapin WhatsApp SDK is licensed under the Apache License 2.0, with the following additional conditions:

**LOGO and copyright information**: In the process of using Wazapin WhatsApp SDK's frontend components, you may not remove or modify the LOGO or copyright information in the Wazapin console or applications. This restriction is inapplicable to uses of Wazapin WhatsApp SDK that do not involve its frontend components.

**Usage Notification Requirement**: If Wazapin WhatsApp SDK is used as part of any project, including closed-source systems (e.g., proprietary software), the user is required to display a clear notification within the system that Wazapin WhatsApp SDK is being utilized. This notification should be visible to system administrators and accessible from the system's documentation or settings page. Failure to comply with this requirement may result in the necessity for a commercial license, as determined by the producer.

Please contact hello@wazapin.com to inquire about licensing matters.

Apart from the specific conditions mentioned above, all other rights and restrictions follow the Apache License 2.0. Detailed information about the Apache License 2.0 can be found at http://www.apache.org/licenses/LICENSE-2.0.

© 2025 Wazapin

---

## Links

**Documentation**:
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [API Verification](./docs/API_VERIFICATION.md)
- [Project Status](./docs/PROJECT_STATUS.md)
- [Publishing Guide](./docs/PUBLISHING.md) - How to publish and update the package
- [Changelog](./CHANGELOG.md)

**WhatsApp Resources**:
- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)
- [API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Get Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

---

## Support

- Email: hello@wazapin.com
- [Issues](https://github.com/wazapin/wa-sdk/issues)
- [Discussions](https://github.com/wazapin/wa-sdk/discussions)

---

## 🙏 Acknowledgments

Built with ❤️ by the Wazapin team.

Special thanks to:
- [Meta WhatsApp Team](https://developers.facebook.com/docs/whatsapp) for the excellent API
- [Zod](https://zod.dev/) for runtime validation
- All contributors and users of this SDK

---

**Made with TypeScript** 🔷
