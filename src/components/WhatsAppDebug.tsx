import React from 'react';
import { WHATSAPP_CONFIG } from '@/config/whatsapp';

const WhatsAppDebug = () => {
  const checkConfig = () => {
    console.log('🔍 WhatsApp Configuration Debug:');
    console.log('TWILIO_ACCOUNT_SID:', WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
    console.log('TWILIO_AUTH_TOKEN:', WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('TWILIO_WHATSAPP_FROM:', WHATSAPP_CONFIG.TWILIO_WHATSAPP_FROM || '❌ Missing');
    console.log('SANDBOX_MODE:', WHATSAPP_CONFIG.SANDBOX_MODE);
    
    // Test the service directly
    import('@/services/whatsappService').then(({ whatsappService }) => {
      const testData = {
        id: 'debug-test',
        order_number: 'DEBUG-TEST-' + Date.now(),
        customer_name: 'Debug Test Customer',
        phone_number: '+91 98765 43210',
        delivery_block: 'B1',
        total_amount: 100,
        created_at: new Date().toISOString(),
        delivery_notes: 'Debug test from component',
        order_items: [{
          quantity: 1,
          menu_item: { name: 'Debug Test Item', price: 100 },
          total_price: 100
        }]
      };
      
      console.log('🧪 Testing WhatsApp service...');
      whatsappService.sendOrderNotification('48cabbce-6b24-4be6-8be6-f2f01f21752b', testData)
        .then(success => {
          console.log('WhatsApp test result:', success ? '✅ Success' : '❌ Failed');
        })
        .catch(error => {
          console.error('WhatsApp test error:', error);
        });
    }).catch(error => {
      console.error('Failed to import WhatsApp service:', error);
    });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>WhatsApp Debug Component</h3>
      <button onClick={checkConfig} style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
        Test WhatsApp Configuration
      </button>
      <p>Click the button and check the console for results.</p>
    </div>
  );
};

export default WhatsAppDebug;
