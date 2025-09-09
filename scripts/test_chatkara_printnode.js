import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatkaraPrintNode() {
  console.log('🧪 Testing Chatkara PrintNode Integration...');
  
  try {
    const chatkaraApiKey = '1JE7Kj-YjoHCtN8-fyP1KeWtd7harHsiwsjP_b2uuaQ';
    const printerId = 74698272;
    
    // Test data for Chatkara
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

    // Format KOT for Chatkara
    const kotContent = formatChatkaraKOT(testOrderData);
    console.log('\n📄 Chatkara KOT Format:');
    console.log(kotContent);

    // Test PrintNode API call
    console.log('\n🖨️ Testing PrintNode API...');
    
    // Convert content to base64
    const base64Content = btoa(kotContent);
    
    const printJob = {
      printer: {
        id: printerId
      },
      content: base64Content,
      contentType: 'raw_base64',
      source: 'MUJ Food Club - Chatkara'
    };

    const response = await fetch('https://api.printnode.com/printjobs', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(chatkaraApiKey + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(printJob)
    });

    if (!response.ok) {
      console.error('❌ Error sending print job:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Print job sent successfully!');
    console.log('Full response:', result);
    console.log('Print job ID:', result.id);
    console.log('Status:', result.state);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function formatChatkaraKOT(data) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
  
  let kot = `----------------------------------------
${dateStr} ${timeStr}
KOT - ${data.order_number.slice(-2)}
PICK UP
----------------------------------------
ITEM            QTY
----------------------------------------`;

  data.items.forEach(item => {
    const itemName = item.name.toUpperCase().substring(0, 18).padEnd(18);
    const qty = item.quantity.toString().padStart(2);
    kot += `\n${itemName} ${qty}`;
  });

  kot += `\n----------------------------------------
THANKS FOR VISIT!!
MUJFOODCLUB
----------------------------------------`;

  return kot;
}

testChatkaraPrintNode();
