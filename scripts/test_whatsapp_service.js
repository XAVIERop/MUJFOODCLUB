// Test WhatsApp Service Directly
import { WhatsAppService } from '../src/services/whatsappService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testWhatsAppService() {
  console.log('🧪 Testing WhatsApp Service directly...\n');

  try {
    // Get WhatsApp service instance
    const whatsappService = WhatsAppService.getInstance();
    console.log('✅ WhatsApp service instance created');

    // Test order data
    const testOrderData = {
      id: 'test-order-id',
      order_number: 'TEST-12345',
      customer_name: 'Test Customer',
      phone_number: '+91 9876543210',
      delivery_block: 'B1',
      total_amount: '250',
      created_at: new Date().toISOString(),
      delivery_notes: 'Test order',
      order_items: [{
        quantity: 1,
        menu_item: { name: 'Test Item', price: 250 },
        total_price: 250
      }]
    };

    console.log('📱 Test order data:', JSON.stringify(testOrderData, null, 2));

    // Test with Cook House ID
    const cookHouseId = '48cabbce-6b24-4be6-8be6-f2f01f21752b';
    console.log(`\n🔄 Sending test notification for Cook House (ID: ${cookHouseId})...`);

    const result = await whatsappService.sendOrderNotification(cookHouseId, testOrderData);
    
    if (result) {
      console.log('✅ WhatsApp notification sent successfully!');
      console.log('📱 Check WhatsApp number 8383080140 for the message');
    } else {
      console.log('❌ WhatsApp notification failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWhatsAppService();
