import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
