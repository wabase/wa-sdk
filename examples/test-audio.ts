import 'dotenv/config';
import { WhatsAppClient } from '../dist/index.js';

const client = new WhatsAppClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  wabaId: process.env.WHATSAPP_WABA_ID!,
});

async function sendAudio() {
  console.log('🎵 Sending audio message...\n');
  
  const audioUrl = 'https://file-examples.com/wp-content/storage/2017/11/file_example_MP3_1MG.mp3';
  const recipient = process.env.TEST_RECIPIENT_PHONE!;
  
  console.log(`To: ${recipient}`);
  console.log(`Audio URL: ${audioUrl}\n`);
  
  try {
    const response = await client.messages.sendAudio({
      to: recipient,
      audio: { link: audioUrl },
    });
    
    console.log('✅ Audio message sent successfully!');
    console.log(`Message ID: ${response.messages[0].id}`);
    console.log('\n🎧 Check your WhatsApp for the audio message!');
  } catch (error: any) {
    console.error('❌ Failed to send audio:', error.message);
  }
}

sendAudio();
