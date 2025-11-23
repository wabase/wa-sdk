import 'dotenv/config';
import { WhatsAppClient } from '../dist/index.js';

const client = new WhatsAppClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  wabaId: process.env.WHATSAPP_WABA_ID!,
});

async function checkTemplates() {
  console.log('🔍 Checking templates...\n');
  
  const templates = await client.templates.list({ limit: 20 });
  
  console.log(`Found ${templates.data.length} template(s):\n`);
  
  templates.data.forEach((template, idx) => {
    console.log(`${idx + 1}. ID: ${template.id}`);
    console.log(`   Name: ${template.name}`);
    console.log(`   Status: ${template.status}`);
    console.log(`   Language: ${template.language}`);
    console.log(`   Category: ${template.category}`);
    console.log('');
  });
  
  // Check for the specific template created
  const createdTemplate = templates.data.find(t => t.id === '4477186882508559');
  if (createdTemplate) {
    console.log('✅ Template 4477186882508559 found!');
    console.log(JSON.stringify(createdTemplate, null, 2));
  } else {
    console.log('❌ Template 4477186882508559 NOT found in list');
  }
}

checkTemplates().catch(console.error);
