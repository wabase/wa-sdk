/**
 * Example: WhatsApp Embedded Signup with @wabase/wa-sdk
 * 
 * This example demonstrates how to implement the complete WhatsApp Embedded Signup
 * flow using the SDK's new OAuth and EmbeddedSignupFlow modules.
 * 
 * BEFORE: 30+ lines of manual fetch() calls
 * AFTER: < 10 lines with SDK helpers
 */

import {
  OAuthHelper,
  EmbeddedSignupFlow,
  WhatsAppClient,
} from '@wabase/wa-sdk';

// =============================================================================
// Configuration (store these in environment variables!)
// =============================================================================
const config = {
  appId: process.env.META_APP_ID!,
  appSecret: process.env.META_APP_SECRET!,
  configId: process.env.META_CONFIG_ID!,
  redirectUri: process.env.META_REDIRECT_URI!,
  systemUserToken: process.env.SYSTEM_USER_TOKEN!,
};

// =============================================================================
// STEP 1: Generate Signup URL (Frontend/API)
// =============================================================================
async function generateSignupUrl() {
  const oauth = new OAuthHelper();

  // Generate the embedded signup URL
  const { url, state } = oauth.generateSignupUrl({
    appId: config.appId,
    configId: config.configId,
    redirectUri: config.redirectUri,
  });

  // IMPORTANT: Store the state token for CSRF verification
  // In production, save this to your database with expiration
  await saveStateToDB(state, {
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  return { url, state };
}

// =============================================================================
// STEP 2: Handle OAuth Callback (Backend API)
// =============================================================================
async function handleCallback(code: string, state: string) {
  // 1. Verify CSRF state token
  const savedState = await getStateFromDB(state);
  if (!savedState || savedState.expiresAt < new Date()) {
    throw new Error('Invalid or expired state token');
  }

  // 2. Complete the onboarding flow with ONE function call!
  // IMPORTANT: For Cloudflare Workers, you MUST pass fetch.bind(globalThis)
  const flow = new EmbeddedSignupFlow({
    systemUserToken: config.systemUserToken,
    // Required for Cloudflare Workers compatibility:
    fetch: fetch.bind(globalThis),
  });

  const result = await flow.complete({
    code,
    state,
    appId: config.appId,
    appSecret: config.appSecret,
    redirectUri: config.redirectUri,
    options: {
      autoSubscribeWebhooks: true,  // Subscribe to WABA webhooks
      autoRegisterPhone: true,       // Register phone with 2-step verification
      // pin: '123456',              // Optional: provide your own PIN
    },
  });

  // 3. Save the credentials to your database
  await saveChannelToDB({
    wabaId: result.wabaId,
    phoneNumberId: result.phoneNumberId,
    phoneNumber: result.phoneNumber,
    displayName: result.displayName,
    qualityRating: result.qualityRating,
    pin: result.pin, // Save securely! Needed for future phone re-registration
  });

  console.log('Channel connected successfully!');
  console.log(`WABA ID: ${result.wabaId}`);
  console.log(`Phone Number ID: ${result.phoneNumberId}`);
  console.log(`Display Name: ${result.displayName}`);
  console.log(`PIN: ${result.pin}`);

  return result;
}

// =============================================================================
// STEP 3: Use the Channel to Send Messages
// =============================================================================
async function sendMessage(phoneNumberId: string, accessToken: string) {
  const client = new WhatsAppClient({
    phoneNumberId,
    accessToken, // Use your System User Token
  });

  // Send a test message
  const response = await client.messages.sendText({
    to: '+1234567890',
    text: 'Hello from WhatsApp SDK! 🎉',
  });

  console.log('Message sent:', response.messages[0].id);
}

// =============================================================================
// Alternative: Step-by-Step Flow (More Control)
// =============================================================================
async function stepByStepFlow(code: string) {
  const oauth = new OAuthHelper();

  // Step 1: Exchange code for token
  const { accessToken } = await oauth.exchangeCodeForToken({
    code,
    appId: config.appId,
    appSecret: config.appSecret,
    redirectUri: config.redirectUri,
  });

  // Step 2: Get WABA IDs
  const wabaIds = await oauth.getWABAIds(accessToken, config.systemUserToken);
  console.log('WABA IDs:', wabaIds);

  // Step 3: Use WhatsAppClient for remaining operations
  const client = new WhatsAppClient({
    phoneNumberId: 'placeholder', // Will be updated
    accessToken: config.systemUserToken,
  });

  // Get primary phone number from WABA
  const primaryPhone = await client.embeddedSignup.getPrimaryPhoneNumber(wabaIds[0]);
  console.log('Primary Phone:', primaryPhone);

  // Subscribe to webhooks
  await client.embeddedSignup.subscribeToWABA(wabaIds[0]);

  // Register phone (you need businessToken for this, not systemUserToken)
  const phoneClient = new WhatsAppClient({
    phoneNumberId: primaryPhone.phoneNumberId,
    accessToken, // Use business token here
  });

  await phoneClient.registration.registerPhone({
    messaging_product: 'whatsapp',
    pin: '123456',
  });

  return {
    wabaId: wabaIds[0],
    ...primaryPhone,
  };
}

// =============================================================================
// Helper functions (implement these for your database)
// =============================================================================
async function saveStateToDB(state: string, data: { createdAt: Date; expiresAt: Date }) {
  // TODO: Implement your database storage
  console.log('Saving state to DB:', state, data);
}

async function getStateFromDB(state: string): Promise<{ expiresAt: Date } | null> {
  // TODO: Implement your database retrieval
  return { expiresAt: new Date(Date.now() + 60000) };
}

async function saveChannelToDB(channel: {
  wabaId: string;
  phoneNumberId: string;
  phoneNumber: string;
  displayName: string;
  qualityRating?: string;
  pin?: string;
}) {
  // TODO: Implement your database storage
  console.log('Saving channel to DB:', channel);
}

// =============================================================================
// Express.js Example Routes
// =============================================================================
/*
import express from 'express';
const app = express();

// Route: Start embedded signup
app.get('/api/whatsapp/signup', async (req, res) => {
  const { url, state } = await generateSignupUrl();
  res.json({ url, state });
});

// Route: OAuth callback
app.get('/api/whatsapp/callback', async (req, res) => {
  const { code, state } = req.query;
  
  try {
    const result = await handleCallback(code as string, state as string);
    res.redirect(`/channels/${result.wabaId}?success=true`);
  } catch (error) {
    res.redirect(`/channels/create?error=${encodeURIComponent(error.message)}`);
  }
});
*/

// =============================================================================
// Run example
// =============================================================================
async function main() {
  // Example 1: Generate signup URL
  console.log('=== Generating Signup URL ===');
  const { url, state } = await generateSignupUrl();
  console.log('Signup URL:', url);
  console.log('State token:', state);

  // Example 2: Handle callback (simulate with fake code)
  // In production, this would be called from your OAuth callback route
  // console.log('\n=== Handling Callback ===');
  // const result = await handleCallback('AUTH_CODE_FROM_META', state);
}

main().catch(console.error);
