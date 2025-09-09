// Check WhatsApp Configuration
// Run this in the browser console to debug WhatsApp issues

console.log('🔍 WhatsApp Configuration Check:');

// Check if the WhatsApp service is available
if (typeof window !== 'undefined') {
  console.log('📱 Checking WhatsApp service...');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('VITE_TWILIO_ACCOUNT_SID:', import.meta.env.VITE_TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
  console.log('VITE_TWILIO_AUTH_TOKEN:', import.meta.env.VITE_TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('VITE_TWILIO_WHATSAPP_FROM:', import.meta.env.VITE_TWILIO_WHATSAPP_FROM || '❌ Missing');
  
  // Test the WhatsApp service
  console.log('🧪 Testing WhatsApp service...');
  
  const testData = {
    id: 'console-test',
    order_number: 'CONSOLE-TEST-' + Date.now(),
    customer_name: 'Console Test',
    phone_number: '+91 98765 43210',
    delivery_block: 'B1',
    total_amount: 100,
    created_at: new Date().toISOString(),
    delivery_notes: 'Console test',
    order_items: [{
      quantity: 1,
      menu_item: { name: 'Test Item', price: 100 },
      total_price: 100
    }]
  };
  
  // Use the Cook House ID from the debug results
  const cookHouseId = '48cabbce-6b24-4be6-8be6-f2f01f21752b';
  
  // Import and test the service
  import('./src/services/whatsappService.js').then(({ whatsappService }) => {
    whatsappService.sendOrderNotification(cookHouseId, testData)
      .then(success => {
        console.log('WhatsApp test result:', success ? '✅ Success' : '❌ Failed');
      })
      .catch(error => {
        console.error('WhatsApp test error:', error);
      });
  }).catch(error => {
    console.error('Failed to import WhatsApp service:', error);
  });
} else {
  console.log('❌ This script must be run in the browser console');
}
