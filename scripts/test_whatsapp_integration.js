// Test script for WhatsApp integration
// This script tests the WhatsApp service functionality

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWhatsAppIntegration() {
  console.log('🧪 Testing WhatsApp Integration...\n');

  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: cafes, error: cafesError } = await supabase
      .from('cafes')
      .select('id, name, whatsapp_phone, whatsapp_enabled, whatsapp_notifications')
      .limit(5);

    if (cafesError) {
      console.error('❌ Database connection failed:', cafesError);
      return;
    }

    console.log('✅ Database connected successfully');
    console.log('📋 Found cafes:', cafes.length);
    cafes.forEach(cafe => {
      console.log(`   - ${cafe.name}: WhatsApp ${cafe.whatsapp_enabled ? 'Enabled' : 'Disabled'} (${cafe.whatsapp_phone || 'No phone'})`);
    });

    // 2. Test WhatsApp settings update
    console.log('\n2️⃣ Testing WhatsApp settings update...');
    if (cafes.length > 0) {
      const testCafe = cafes[0];
      console.log(`   Testing with cafe: ${testCafe.name}`);
      
      // Update WhatsApp settings for testing
      const { error: updateError } = await supabase
        .from('cafes')
        .update({
          whatsapp_phone: '+91 98765 43210', // Test phone number
          whatsapp_enabled: true,
          whatsapp_notifications: true
        })
        .eq('id', testCafe.id);

      if (updateError) {
        console.error('❌ Failed to update WhatsApp settings:', updateError);
      } else {
        console.log('✅ WhatsApp settings updated successfully');
      }
    }

    // 3. Test the database function
    console.log('\n3️⃣ Testing WhatsApp notification function...');
    const testOrderData = {
      order_number: 'TEST-1234567890',
      customer_name: 'Test Customer',
      phone_number: '+91 98765 43210',
      delivery_block: 'B1',
      total_amount: 250,
      created_at: new Date().toISOString(),
      items_text: '• Test Item x1 - ₹250',
      delivery_notes: 'Test order for WhatsApp integration',
      frontend_url: 'https://mujfoodclub.in'
    };

    if (cafes.length > 0) {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('send_whatsapp_notification', {
          p_cafe_id: cafes[0].id,
          p_order_data: testOrderData
        });

      if (functionError) {
        console.error('❌ WhatsApp function failed:', functionError);
      } else {
        console.log('✅ WhatsApp function executed successfully:', functionResult);
      }
    }

    console.log('\n🎉 WhatsApp integration test completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update cafe WhatsApp phone numbers in Supabase dashboard');
    console.log('   2. Test with real orders in the app');
    console.log('   3. Check console logs for WhatsApp notifications');
    console.log('   4. Integrate with actual WhatsApp API when ready');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWhatsAppIntegration();
