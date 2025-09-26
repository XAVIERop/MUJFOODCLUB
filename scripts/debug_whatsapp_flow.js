// Debug WhatsApp Flow
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Twilio WhatsApp API credentials
const TWILIO_CONFIG = {
  accountSid: process.env.VITE_TWILIO_ACCOUNT_SID,
  authToken: process.env.VITE_TWILIO_AUTH_TOKEN,
  whatsappFrom: process.env.VITE_TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
};

async function debugWhatsAppFlow() {
  console.log('🔍 Debugging WhatsApp Flow...\n');

  // 1. Check environment variables
  console.log('1️⃣ Environment Variables:');
  console.log('   VITE_TWILIO_ACCOUNT_SID:', TWILIO_CONFIG.accountSid ? 'Set' : 'Missing');
  console.log('   VITE_TWILIO_AUTH_TOKEN:', TWILIO_CONFIG.authToken ? 'Set' : 'Missing');
  console.log('   VITE_TWILIO_WHATSAPP_FROM:', TWILIO_CONFIG.whatsappFrom);

  // 2. Check Cook House configuration
  console.log('\n2️⃣ Cook House Configuration:');
  const { data: cookHouse, error: cookHouseError } = await supabase
    .from('cafes')
    .select('id, name, whatsapp_phone, whatsapp_enabled, whatsapp_notifications')
    .eq('name', 'COOK HOUSE')
    .single();

  if (cookHouseError) {
    console.error('❌ Error fetching Cook House:', cookHouseError);
  } else {
    console.log('   ID:', cookHouse.id);
    console.log('   Name:', cookHouse.name);
    console.log('   WhatsApp Phone:', cookHouse.whatsapp_phone);
    console.log('   WhatsApp Enabled:', cookHouse.whatsapp_enabled);
    console.log('   WhatsApp Notifications:', cookHouse.whatsapp_notifications);
  }

  // 3. Test Twilio API directly
  console.log('\n3️⃣ Testing Twilio API:');
  try {
    const testMessage = `🍽️ *Debug Test Message*

📋 *Order:* #DEBUG-${Date.now()}
👤 *Customer:* Debug Customer
📱 *Phone:* +91 9876543210
📍 *Block:* B1
💰 *Total:* ₹250
⏰ *Time:* ${new Date().toLocaleString('en-IN')}

📝 *Items:*
• Debug Item x1 - ₹250

🔗 *Manage Order:* https://mujfoodclub.in/pos-dashboard`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;
    
    const formData = new FormData();
    formData.append('To', 'whatsapp:+918383080140'); // Test number
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
      console.log('   Message SID:', result.sid);
      console.log('   Status:', result.status);
      console.log('   To:', result.to);
      console.log('   From:', result.from);
    } else {
      const error = await response.text();
      console.error('❌ Twilio API test failed:', error);
    }
  } catch (error) {
    console.error('❌ Twilio API test error:', error);
  }

  // 4. Check if there are any recent orders
  console.log('\n4️⃣ Recent Orders:');
  const { data: recentOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, cafe_id, created_at, status')
    .eq('cafe_id', cookHouse.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error('❌ Error fetching recent orders:', ordersError);
  } else {
    console.log('   Recent orders for Cook House:');
    recentOrders.forEach(order => {
      console.log(`   - ${order.order_number} (${order.status}) - ${new Date(order.created_at).toLocaleString()}`);
    });
  }

  console.log('\n🎯 Next Steps:');
  console.log('   1. Check if you received the debug test message on 8383080140');
  console.log('   2. Try placing a real order in Cook House');
  console.log('   3. Check browser console for WhatsApp service logs');
}

// Run the debug
debugWhatsAppFlow();
