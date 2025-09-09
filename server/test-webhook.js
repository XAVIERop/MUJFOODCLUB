// Test WhatsApp Webhook Handler
// This tests the webhook functionality locally

const { WhatsAppWebhookHandler } = require('./whatsapp-webhook');

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
}

// Run the test
testWhatsAppWebhook();
