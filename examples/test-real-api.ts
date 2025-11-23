/**
 * Real WhatsApp API Testing Script
 * 
 * This script tests all SDK endpoints with real WhatsApp Cloud API
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Fill in your credentials from https://developers.facebook.com/apps
 * 3. Run: npm install dotenv
 * 4. Run: npx tsx examples/test-real-api.ts
 */

import 'dotenv/config';
import { WhatsAppClient } from '../dist/index.js';

// Configuration
const config = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  wabaId: process.env.WHATSAPP_WABA_ID!,
  businessId: process.env.WHATSAPP_BUSINESS_ID!,
  testRecipient: process.env.TEST_RECIPIENT_PHONE!,
  appSecret: process.env.WHATSAPP_APP_SECRET,
  templateName: process.env.TEST_TEMPLATE_NAME || 'hello_world',
  flowId: process.env.TEST_FLOW_ID,
  flowName: process.env.TEST_FLOW_NAME,
};

// Validate required config
function validateConfig() {
  const required = [
    'accessToken',
    'phoneNumberId',
    'wabaId',
    'businessId',
    'testRecipient',
  ];

  const missing = required.filter((key) => !config[key as keyof typeof config]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - WHATSAPP_${key.toUpperCase()}`));
    console.error('\n📝 Please copy .env.example to .env and fill in your credentials');
    process.exit(1);
  }
}

// Initialize client with logger
const client = new WhatsAppClient({
  accessToken: config.accessToken,
  phoneNumberId: config.phoneNumberId,
  wabaId: config.wabaId,
  logger: {
    level: 'info',
    timestamp: true,
  },
});

// Test results tracker
const results: Array<{
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  duration?: number;
}> = [];

function recordResult(
  category: string,
  test: string,
  status: 'pass' | 'fail' | 'skip',
  error?: any,
  duration?: number
) {
  results.push({
    category,
    test,
    status,
    error: error?.message || error,
    duration,
  });

  const emoji = status === 'pass' ? '✅' : status === 'skip' ? '⏭️' : '❌';
  const durationStr = duration ? ` (${duration}ms)` : '';
  console.log(`${emoji} ${category}: ${test}${durationStr}`);
  if (error) {
    console.error(`   Error: ${error.message || error}`);
  }
}

async function runTest(
  category: string,
  testName: string,
  testFn: () => Promise<void>,
  skipIf?: boolean
) {
  if (skipIf) {
    recordResult(category, testName, 'skip');
    return;
  }

  const start = Date.now();
  try {
    await testFn();
    recordResult(category, testName, 'pass', undefined, Date.now() - start);
  } catch (error) {
    recordResult(category, testName, 'fail', error, Date.now() - start);
  }
}

// ==================== TESTS ====================

async function testMessaging() {
  console.log('\n📱 Testing Messaging APIs...\n');

  // Text message
  await runTest('Messaging', 'Send Text Message', async () => {
    const response = await client.messages.sendText({
      to: config.testRecipient,
      text: '🧪 Test message from @wazapin/wa-sdk',
      previewUrl: true,
    });
    console.log(`   Message ID: ${response.messages[0].id}`);
  });

  // Reaction
  await runTest('Messaging', 'Send Reaction', async () => {
    const textResponse = await client.messages.sendText({
      to: config.testRecipient,
      text: 'React to this message',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await client.messages.sendReaction({
      to: config.testRecipient,
      messageId: textResponse.messages[0].id,
      emoji: '👍',
    });
  });

  // Location
  await runTest('Messaging', 'Send Location', async () => {
    await client.messages.sendLocation({
      to: config.testRecipient,
      latitude: -6.2088,
      longitude: 106.8456,
      name: 'Jakarta',
      address: 'Jakarta, Indonesia',
    });
  });

  // Contact
  await runTest('Messaging', 'Send Contact', async () => {
    await client.messages.sendContact({
      to: config.testRecipient,
      contacts: [
        {
          name: {
            formattedName: 'Test Contact',
            firstName: 'Test',
            lastName: 'Contact',
          },
          phones: [
            {
              phone: '+1234567890',
              type: 'WORK',
            },
          ],
        },
      ],
    });
  });

  // Interactive Buttons
  await runTest('Messaging', 'Send Interactive Buttons', async () => {
    await client.messages.sendInteractiveButtons({
      to: config.testRecipient,
      body: 'Choose an option:',
      buttons: [
        { id: 'btn1', title: 'Option 1' },
        { id: 'btn2', title: 'Option 2' },
        { id: 'btn3', title: 'Option 3' },
      ],
      header: {
        type: 'text',
        text: 'Interactive Test',
      },
      footer: 'Powered by @wazapin/wa-sdk',
    });
  });

  // Interactive List
  await runTest('Messaging', 'Send Interactive List', async () => {
    await client.messages.sendInteractiveList({
      to: config.testRecipient,
      body: 'Please select from the menu:',
      buttonText: 'View Menu',
      sections: [
        {
          title: 'Section 1',
          rows: [
            { id: 'row1', title: 'Option 1', description: 'Description 1' },
            { id: 'row2', title: 'Option 2', description: 'Description 2' },
          ],
        },
      ],
      header: {
        type: 'text',
        text: 'Menu',
      },
    });
  });
}

async function testAccount() {
  console.log('\n👤 Testing Account APIs...\n');

  await runTest('Account', 'Get Business Profile', async () => {
    const profile = await client.account.getBusinessProfile();
    console.log(`   Business: ${profile.data[0].about || 'No description'}`);
  });

  await runTest('Account', 'Get Messaging Limit', async () => {
    const limit = await client.account.getMessagingLimit();
    console.log(`   Current Tier: ${limit.whatsapp_business_manager_messaging_limit}`);
  });

  await runTest('Account', 'List Phone Numbers', async () => {
    const phones = await client.phoneNumbers.list(config.wabaId);
    console.log(`   Found ${phones.data.length} phone number(s)`);
  });

  await runTest('Account', 'Get Phone Number Details', async () => {
    const details = await client.phoneNumbers.get(config.phoneNumberId);
    console.log(`   Display Name: ${details.display_phone_number}`);
  });
}

async function testTemplates() {
  console.log('\n📄 Testing Templates API...\n');

  await runTest('Templates', 'List Templates', async () => {
    const templates = await client.templates.list();
    console.log(`   Found ${templates.data.length} template(s)`);
  });

  await runTest(
    'Templates',
    'Send Template Message',
    async () => {
      await client.messages.sendTemplate({
        to: config.testRecipient,
        template: {
          name: config.templateName,
          language: 'en_US',
        },
      });
    },
    !config.templateName
  );
}

async function testFlows() {
  console.log('\n🔄 Testing Flows API...\n');

  await runTest('Flows', 'List Flows', async () => {
    const flows = await client.flows.list();
    console.log(`   Found ${flows.data.length} flow(s)`);
    if (flows.data.length > 0) {
      flows.data.forEach((flow) => {
        console.log(`   - ${flow.name} (${flow.status})`);
      });
    }
  });

  await runTest(
    'Flows',
    'Get Flow Details',
    async () => {
      const flowId = config.flowId || '';
      const flow = await client.flows.get(flowId);
      console.log(`   Flow: ${flow.name}`);
      console.log(`   Status: ${flow.status}`);
      console.log(`   Categories: ${flow.categories.join(', ')}`);
    },
    !config.flowId
  );

  await runTest(
    'Flows',
    'Get Flow Preview',
    async () => {
      const flowId = config.flowId || '';
      const preview = await client.flows.getPreview(flowId);
      if (preview.preview) {
        console.log(`   Preview URL: ${preview.preview.preview_url}`);
        console.log(`   Expires: ${preview.preview.expires_at}`);
      }
    },
    !config.flowId
  );

  await runTest(
    'Flows',
    'List Flow Assets',
    async () => {
      const flowId = config.flowId || '';
      const assets = await client.flows.listAssets(flowId);
      console.log(`   Found ${assets.data.length} asset(s)`);
    },
    !config.flowId
  );

  // Create test flow (will create in DRAFT)
  let createdFlowId: string | undefined;
  await runTest('Flows', 'Create Flow', async () => {
    const flow = await client.flows.create({
      name: `Test Flow ${Date.now()}`,
      categories: ['OTHER'],
    });
    createdFlowId = flow.id;
    console.log(`   Created Flow ID: ${flow.id}`);
  });

  // Update created flow
  await runTest(
    'Flows',
    'Update Flow',
    async () => {
      if (createdFlowId) {
        await client.flows.update(createdFlowId, {
          name: `Updated Test Flow ${Date.now()}`,
        });
      }
    },
    !createdFlowId
  );

  // Delete created flow
  await runTest(
    'Flows',
    'Delete Flow',
    async () => {
      if (createdFlowId) {
        await client.flows.delete(createdFlowId);
        console.log(`   Deleted Flow ID: ${createdFlowId}`);
      }
    },
    !createdFlowId
  );
}

async function testAnalytics() {
  console.log('\n📊 Testing Analytics API...\n');

  await runTest('Analytics', 'Get Analytics', async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const analytics = await client.analytics.getAnalytics({
      start: Math.floor(thirtyDaysAgo.getTime() / 1000),
      end: Math.floor(now.getTime() / 1000),
      granularity: 'DAILY',
    });

    console.log(`   Data points: ${analytics.data[0]?.data_points?.length || 0}`);
  });
}

async function testEmbeddedSignup() {
  console.log('\n🔗 Testing Embedded Signup API...\n');

  await runTest('Embedded Signup', 'List Shared WABAs', async () => {
    const wabas = await client.embeddedSignup.listSharedWABAs(config.businessId);
    console.log(`   Found ${wabas.data.length} shared WABA(s)`);
  });

  await runTest('Embedded Signup', 'Get WABA Info', async () => {
    const info = await client.embeddedSignup.getWABAInfo(config.wabaId, ['id', 'name']);
    console.log(`   WABA: ${info.name || info.id}`);
  });

  await runTest('Embedded Signup', 'List System Users', async () => {
    const users = await client.embeddedSignup.listSystemUsers(config.businessId);
    console.log(`   Found ${users.data.length} system user(s)`);
  });

  await runTest('Embedded Signup', 'Get Extended Credits', async () => {
    const credits = await client.embeddedSignup.getExtendedCredits(config.businessId);
    console.log(`   Found ${credits.data.length} credit line(s)`);
  });

  await runTest('Embedded Signup', 'List Subscriptions', async () => {
    const subs = await client.embeddedSignup.listSubscriptions(config.wabaId);
    console.log(`   Active subscriptions: ${subs.data.length}`);
  });
}

// Main test runner
async function main() {
  console.log('🧪 WhatsApp Cloud API - Real Testing Script');
  console.log('==========================================\n');

  validateConfig();

  console.log('📋 Configuration:');
  console.log(`   Phone Number ID: ${config.phoneNumberId}`);
  console.log(`   WABA ID: ${config.wabaId}`);
  console.log(`   Test Recipient: ${config.testRecipient}`);
  console.log('');

  const startTime = Date.now();

  try {
    await testMessaging();
    await testAccount();
    await testTemplates();
    await testFlows();
    await testAnalytics();
    await testEmbeddedSignup();
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  }

  const duration = Date.now() - startTime;

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;
  const total = results.length;

  console.log(`\n✅ Passed:  ${passed}/${total}`);
  console.log(`❌ Failed:  ${failed}/${total}`);
  console.log(`⏭️  Skipped: ${skipped}/${total}`);
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);

  // Show failed tests
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        console.log(`   - ${r.category}: ${r.test}`);
        console.log(`     ${r.error}`);
      });
  }

  // Show skipped tests
  if (skipped > 0) {
    console.log('\n⏭️  Skipped Tests (missing config):');
    results
      .filter((r) => r.status === 'skip')
      .forEach((r) => {
        console.log(`   - ${r.category}: ${r.test}`);
      });
  }

  // Category breakdown
  console.log('\n📈 By Category:');
  const categories = [...new Set(results.map((r) => r.category))];
  categories.forEach((cat) => {
    const catResults = results.filter((r) => r.category === cat);
    const catPassed = catResults.filter((r) => r.status === 'pass').length;
    const catTotal = catResults.length;
    const percentage = ((catPassed / catTotal) * 100).toFixed(0);
    console.log(`   ${cat}: ${catPassed}/${catTotal} (${percentage}%)`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(
    failed === 0
      ? '🎉 All tests passed!'
      : `⚠️  ${failed} test(s) failed - check errors above`
  );
  console.log('='.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
main().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
