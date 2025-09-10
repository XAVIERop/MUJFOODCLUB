import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_URL environment variable');
  process.exit(1);
}
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatkaraPrinting() {
  console.log('🧪 Testing Chatkara Printing Functionality...');
  
  try {
    // Get Chatkara cafe ID
    const { data: cafe, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name')
      .ilike('name', '%chatkara%')
      .single();

    if (cafeError) {
      console.error('❌ Error fetching Chatkara cafe:', cafeError);
      return;
    }

    console.log('✅ Found Chatkara Cafe:', cafe);

    // Create a test order for Chatkara
    const testOrderData = {
      order_id: 'test-' + Date.now(),
      order_number: 'CHA-TEST-' + Date.now().toString().slice(-6),
      cafe_name: 'CHATKARA',
      customer_name: 'Test Customer',
      customer_phone: '+91 98765 43210',
      delivery_block: 'B1',
      items: [
        {
          id: '1',
          name: 'Masala Chaap (Half)',
          quantity: 1,
          unit_price: 170,
          total_price: 170
        },
        {
          id: '2',
          name: 'Soft Drink',
          quantity: 1,
          unit_price: 30,
          total_price: 30
        }
      ],
      subtotal: 200,
      tax_amount: 10,
      discount_amount: 0,
      final_amount: 210,
      payment_method: 'COD',
      order_date: new Date().toISOString(),
      estimated_delivery: '30 min',
      points_earned: 10,
      points_redeemed: 0
    };

    console.log('📋 Test Order Data:', testOrderData);

    // Test the printing service
    console.log('\n🖨️ Testing Print Service...');
    
    // Import the print service (this would normally be done in the frontend)
    console.log('📋 To test printing:');
    console.log('1. Go to your frontend application');
    console.log('2. Navigate to Chatkara cafe');
    console.log('3. Place a test order');
    console.log('4. Check if KOT and receipt are printed');
    
    console.log('\n📋 Expected Behavior:');
    console.log('- KOT should print with Chatkara format');
    console.log('- Receipt should print with Chatkara format');
    console.log('- Both should go to Chatkara printer only');
    
    console.log('\n📋 Current Status:');
    console.log('- Chatkara cafe exists: ✅');
    console.log('- Printer configuration: ❌ (needs setup)');
    console.log('- PrintNode integration: ⚠️ (needs API key)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testChatkaraPrinting();
