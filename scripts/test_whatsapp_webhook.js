// Test WhatsApp Webhook Handler
// This simulates how the webhook would process incoming messages

const { WhatsAppWebhookHandler } = require('./src/api/whatsappWebhook.ts');

async function testWhatsAppWebhook() {
  console.log('🧪 Testing WhatsApp Webhook Handler...\n');

  // Test cases
  const testMessages = [
    {
      MessageSid: 'SM1234567890',
      From: 'whatsapp:+918905962406', // Chatkara phone
      To: 'whatsapp:+14155238886',
      Body: 'CONFIRM CHA000113',
      MessageStatus: 'received'
    },
    {
      MessageSid: 'SM1234567891',
      From: 'whatsapp:+918905962406',
      To: 'whatsapp:+14155238886',
      Body: 'PREPARING CHA000113',
      MessageStatus: 'received'
    },
    {
      MessageSid: 'SM1234567892',
      From: 'whatsapp:+918905962406',
      To: 'whatsapp:+14155238886',
      Body: 'READY CHA000113',
      MessageStatus: 'received'
    },
    {
      MessageSid: 'SM1234567893',
      From: 'whatsapp:+918905962406',
      To: 'whatsapp:+14155238886',
      Body: 'DELIVERED CHA000113',
      MessageStatus: 'received'
    },
    {
      MessageSid: 'SM1234567894',
      From: 'whatsapp:+918905962406',
      To: 'whatsapp:+14155238886',
      Body: 'Hello, how are you?', // Invalid command
      MessageStatus: 'received'
    }
  ];

  for (const message of testMessages) {
    console.log(`📱 Testing message: "${message.Body}"`);
    console.log(`   From: ${message.From}`);
    
    try {
      const result = await WhatsAppWebhookHandler.processMessage(message);
      console.log(`   Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (result.response) {
        console.log(`   Response: ${result.response}`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎉 WhatsApp Webhook test completed!');
  console.log('\n📝 To make this work in production:');
  console.log('   1. Set up Twilio webhook URL in your Twilio console');
  console.log('   2. Deploy the webhook endpoint to your server');
  console.log('   3. Configure the webhook to point to your API endpoint');
  console.log('   4. Test with real WhatsApp messages');
}

// Run the test
testWhatsAppWebhook();
