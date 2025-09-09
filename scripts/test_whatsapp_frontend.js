// Test WhatsApp Frontend Integration
// This script will help debug the frontend WhatsApp service

console.log('🧪 Testing WhatsApp Frontend Integration...');

// Check if environment variables are loaded
console.log('📋 Environment Variables Check:');
console.log('VITE_TWILIO_ACCOUNT_SID:', import.meta.env.VITE_TWILIO_ACCOUNT_SID ? '✅ Loaded' : '❌ Missing');
console.log('VITE_TWILIO_AUTH_TOKEN:', import.meta.env.VITE_TWILIO_AUTH_TOKEN ? '✅ Loaded' : '❌ Missing');
console.log('VITE_TWILIO_WHATSAPP_FROM:', import.meta.env.VITE_TWILIO_WHATSAPP_FROM || '❌ Missing');

// Test the WhatsApp service directly
import { whatsappService } from './src/services/whatsappService.js';

const testOrderData = {
  id: 'test-order-id',
  order_number: 'TEST-' + Date.now(),
  customer_name: 'Console Test Customer',
  phone_number: '+91 98765 43210',
  delivery_block: 'B1',
  total_amount: 250,
  created_at: new Date().toISOString(),
  delivery_notes: 'Console test for WhatsApp integration',
  order_items: [
    {
      quantity: 1,
      menu_item: {
        name: 'Console Test Item',
        price: 250
      },
      total_price: 250
    }
  ]
};

// Test with Cook House cafe ID (from the debug results)
const cookHouseId = '48cabbce-6b24-4be6-8be6-f2f01f21752b';

console.log('📱 Testing WhatsApp service...');
whatsappService.sendOrderNotification(cookHouseId, testOrderData)
  .then(success => {
    if (success) {
      console.log('✅ WhatsApp test successful!');
    } else {
      console.log('❌ WhatsApp test failed');
    }
  })
  .catch(error => {
    console.error('❌ WhatsApp test error:', error);
  });
