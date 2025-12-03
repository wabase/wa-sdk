import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { WhatsAppClient } from '../dist/index.js';

const client = new WhatsAppClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  wabaId: process.env.WHATSAPP_WABA_ID!,
});

async function main() {
  console.log('Sending message to:', process.env.TEST_RECIPIENT_PHONE);
  const response = await client.messages.sendText({
    to: process.env.TEST_RECIPIENT_PHONE!,
    text: 'Test message dari wa-sdk! 🎉',
  });
  console.log('Message sent! ID:', response.messages[0].id);
}

main().catch(console.error);
