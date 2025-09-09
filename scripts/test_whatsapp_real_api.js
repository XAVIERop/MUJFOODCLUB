// Test WhatsApp Integration with Real API Credentials
// This script tests the actual Twilio WhatsApp API integration

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Twilio WhatsApp API credentials
const TWILIO_CONFIG = {
  accountSid: 'AC76248d54645e7159a660b9c48a354e9c',
  authToken: '43d432ffdcfff2b16158b471e38748c5',
  whatsappFrom: 'whatsapp:+18507906019'
};

async function testWhatsAppAPI() {
  console.log('🧪 Testing WhatsApp API with Real Credentials...\n');

  try {
    // 1. Test Twilio API directly
    console.log('1️⃣ Testing Twilio WhatsApp API directly...');
    
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
    } else {
      const error = await response.text();
      console.error('❌ Twilio API test failed:', error);
    }

    // 2. Test database function
    console.log('\n2️⃣ Testing database WhatsApp function...');
    
    const testOrderData = {
      order_number: `TEST-${Date.now()}`,
      customer_name: 'API Test Customer',
      phone_number: '+91 98765 43210',
      delivery_block: 'B1',
      total_amount: '350',
      created_at: new Date().toISOString(),
      items_text: '• API Test Item x1 - ₹350',
      delivery_notes: 'Testing WhatsApp API integration',
      frontend_url: 'https://mujfoodclub.in'
    };

    // Get Cook House cafe ID
    const { data: cookHouse, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name, whatsapp_phone, whatsapp_enabled')
      .eq('name', 'Cook House')
      .single();

    if (cafeError) {
      console.error('❌ Error fetching Cook House cafe:', cafeError);
      return;
    }

    console.log('📋 Cook House cafe found:', cookHouse.name);
    console.log('📱 WhatsApp phone:', cookHouse.whatsapp_phone);
    console.log('✅ WhatsApp enabled:', cookHouse.whatsapp_enabled);

    // Test the database function
    const { data: functionResult, error: functionError } = await supabase
      .rpc('send_whatsapp_notification', {
        p_cafe_id: cookHouse.id,
        p_order_data: testOrderData
      });

    if (functionError) {
      console.error('❌ Database function test failed:', functionError);
    } else {
      console.log('✅ Database function test successful:', functionResult);
    }

    console.log('\n🎉 WhatsApp API integration test completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check Cook House WhatsApp for test messages');
    console.log('   2. Test with real orders in the app');
    console.log('   3. Configure other cafe phone numbers as needed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWhatsAppAPI();
