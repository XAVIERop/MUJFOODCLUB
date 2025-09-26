// Test WhatsApp message to new number 8383080140
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const TWILIO_CONFIG = {
  accountSid: process.env.VITE_TWILIO_ACCOUNT_SID,
  authToken: process.env.VITE_TWILIO_AUTH_TOKEN,
  whatsappFrom: process.env.VITE_TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
};

async function sendTestToNewNumber() {
  console.log('🧪 Sending test message to new number 8383080140...\n');

  if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
    console.error('❌ Missing Twilio credentials');
    return;
  }

  try {
    const testMessage = `🍽️ *Test Message to New Number*

📋 *Order:* #TEST-${Date.now()}
👤 *Customer:* Test Customer
📱 *Phone:* +91 98765 43210
📍 *Block:* B1
💰 *Total:* ₹250
⏰ *Time:* ${new Date().toLocaleString('en-IN')}

📝 *Items:*
• Test Item x1 - ₹250

🔗 *Manage Order:* https://mujfoodclub.in/pos-dashboard`;

    console.log('📱 Sending to: whatsapp:+91 8383080140');
    
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;
    
    const formData = new FormData();
    formData.append('To', 'whatsapp:+918383080140'); // New test number (no spaces)
    formData.append('From', TWILIO_CONFIG.whatsappFrom);
    formData.append('Body', testMessage);
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`).toString('base64')}`
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test message sent successfully!');
      console.log('📱 Message SID:', result.sid);
      console.log('📱 Status:', result.status);
      console.log('📱 To:', result.to);
      console.log('📱 From:', result.from);
      console.log('\n🎉 Check WhatsApp number 8383080140 for the test message!');
    } else {
      const error = await response.text();
      console.error('❌ Failed to send test message:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
sendTestToNewNumber();
