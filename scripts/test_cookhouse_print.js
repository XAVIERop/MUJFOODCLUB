import { createClient } from '@supabase/supabase-js';
import { PrintNodeService } from '../src/services/printNodeService.js';

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const cookhouseApiKey = process.env.VITE_COOKHOUSE_PRINTNODE_API_KEY || 'n_Trl9Kw4OfgXa9cEQCWrg4eqytQOGwDZJr8wELH6Qc';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCookHousePrint() {
  console.log('🖨️ Testing Cook House PrintNode Configuration...');
  console.log('📧 Account: cookhouse.foodclub@gmail.com');
  console.log('🖨️ Printer ID: 74781013 (POS 80 C)');
  console.log('🔑 API Key:', cookhouseApiKey.substring(0, 10) + '...');
  
  try {
    // Initialize PrintNode service with Cook House API key
    const printNodeService = new PrintNodeService({
      apiKey: cookhouseApiKey,
      baseUrl: 'https://api.printnode.com'
    });

    console.log('\n🔍 Testing PrintNode connection...');
    
    // Test connection
    const isAvailable = await printNodeService.isAvailable();
    if (!isAvailable) {
      console.error('❌ PrintNode service not available');
      return;
    }
    
    console.log('✅ PrintNode service is available');
    
    // Get account info
    const accountInfo = await printNodeService.getAccountInfo();
    console.log('📊 Account Info:', accountInfo);
    
    // Get available printers
    const printers = await printNodeService.getAvailablePrinters();
    console.log(`🖨️ Found ${printers.length} available printers:`);
    
    printers.forEach((printer, index) => {
      console.log(`   ${index + 1}. ${printer.name} (ID: ${printer.id}) - ${printer.state}`);
    });
    
    // Find Cook House printer
    const cookhousePrinter = printers.find(p => p.id === 74781013);
    if (!cookhousePrinter) {
      console.error('❌ Cook House printer (ID: 74781013) not found');
      console.log('Available printer IDs:', printers.map(p => p.id));
      return;
    }
    
    console.log(`✅ Found Cook House printer: ${cookhousePrinter.name} (${cookhousePrinter.state})`);
    
    // Create test receipt data
    const testReceiptData = {
      order_id: 'TEST-COOKHOUSE-001',
      order_number: 'C000001',
      cafe_name: 'COOK HOUSE',
      customer_name: 'Test Customer',
      customer_phone: '9876543210',
      delivery_block: 'B1',
      items: [
        {
          id: 'test-item-1',
          name: 'Test Burger',
          quantity: 2,
          unit_price: 150,
          total_price: 300,
          special_instructions: 'Extra cheese'
        },
        {
          id: 'test-item-2', 
          name: 'Test Fries',
          quantity: 1,
          unit_price: 80,
          total_price: 80
        }
      ],
      subtotal: 380,
      tax_amount: 0,
      discount_amount: 38, // 10% MUJ FOOD CLUB discount
      final_amount: 342,
      payment_method: 'COD',
      order_date: new Date().toISOString(),
      estimated_delivery: '30 mins',
      points_earned: 34,
      points_redeemed: 0
    };
    
    console.log('\n🧪 Testing KOT print...');
    
    // Test KOT printing
    const kotResult = await printNodeService.printKOT(testReceiptData, 74781013);
    if (kotResult.success) {
      console.log('✅ KOT printed successfully!');
      console.log('📄 Job ID:', kotResult.jobId);
    } else {
      console.error('❌ KOT print failed:', kotResult.error);
    }
    
    console.log('\n🧪 Testing Receipt print...');
    
    // Test Receipt printing
    const receiptResult = await printNodeService.printOrderReceipt(testReceiptData, 74781013);
    if (receiptResult.success) {
      console.log('✅ Receipt printed successfully!');
      console.log('📄 Job ID:', receiptResult.jobId);
    } else {
      console.error('❌ Receipt print failed:', receiptResult.error);
    }
    
    console.log('\n🎉 Cook House PrintNode test completed!');
    console.log('📧 Check your Cook House printer (cookhouse.foodclub@gmail.com) for the test prints');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testCookHousePrint();
