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

async function getChatkaraPrinterId() {
  console.log('🔍 Getting Chatkara PrintNode Printer ID...');
  
  try {
    const chatkaraApiKey = '1JE7Kj-YjoHCtN8-fyP1KeWtd7harHsiwsjP_b2uuaQ';
    
    // Get printers from PrintNode API
    const response = await fetch('https://api.printnode.com/printers', {
      headers: {
        'Authorization': `Basic ${btoa(chatkaraApiKey + ':')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Error fetching printers from PrintNode:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const printers = await response.json();
    console.log('✅ PrintNode Printers for Chatkara:');
    
    printers.forEach((printer, index) => {
      console.log(`\n${index + 1}. Printer ID: ${printer.id}`);
      console.log(`   - Name: ${printer.name}`);
      console.log(`   - Description: ${printer.description}`);
      console.log(`   - State: ${printer.state}`);
      console.log(`   - Capabilities: ${JSON.stringify(printer.capabilities)}`);
    });

    // Look for POS-80-Series printer
    const pos80Printer = printers.find(printer => 
      printer.name.toLowerCase().includes('pos-80') || 
      printer.description.toLowerCase().includes('pos-80') ||
      printer.name.toLowerCase().includes('80')
    );

    if (pos80Printer) {
      console.log('\n🎯 Found POS-80-Series Printer:');
      console.log(`   - ID: ${pos80Printer.id}`);
      console.log(`   - Name: ${pos80Printer.name}`);
      console.log(`   - Description: ${pos80Printer.description}`);
      console.log(`   - State: ${pos80Printer.state}`);
      
      console.log('\n📋 Next Steps:');
      console.log(`1. Use printer ID: ${pos80Printer.id}`);
      console.log('2. Update the database with this printer ID');
      console.log('3. Test printing with a sample order');
    } else {
      console.log('\n⚠️ POS-80-Series printer not found');
      console.log('Available printers:', printers.map(p => p.name));
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

getChatkaraPrinterId();
