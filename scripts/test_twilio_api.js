// Test Twilio WhatsApp API directly
// This script tests the Twilio API with the provided credentials

const TWILIO_CONFIG = {
  accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  authToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  whatsappFrom: 'whatsapp:+18507906019'
};

async function testTwilioAPI() {
  console.log('🧪 Testing Twilio WhatsApp API directly...');
  
  try {
    const testMessage = `🍽️ *Test Message from MUJ Food Club*

📋 *Order:* #TEST-${Date.now()}
👤 *Customer:* Test Customer
📱 *Phone:* +91 98765 43210
📍 *Block:* B1
💰 *Total:* ₹250
⏰ *Time:* ${new Date().toLocaleString('en-IN')}

📝 *Items:*
• Test Item x1 - ₹250

🔗 *Manage Order:* https://mujfoodclub.in/pos-dashboard`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;
    
    const formData = new FormData();
    formData.append('To', 'whatsapp:+91 9116966635'); // Cook House number
    formData.append('From', TWILIO_CONFIG.whatsappFrom);
    formData.append('Body', testMessage);
    
    console.log('📱 Sending to:', 'whatsapp:+91 9116966635');
    console.log('📱 From:', TWILIO_CONFIG.whatsappFrom);
    console.log('📱 Message:', testMessage);
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`).toString('base64')}`
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Twilio API test successful!');
      console.log('📱 Message SID:', result.sid);
      console.log('📱 Status:', result.status);
      console.log('📱 To:', result.to);
      console.log('📱 From:', result.from);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Twilio API test failed:', error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testTwilioAPI();
