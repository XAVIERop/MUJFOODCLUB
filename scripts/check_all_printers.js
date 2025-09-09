import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllPrinters() {
  console.log('🔍 Checking All Printer Configurations...');
  
  try {
    // Get all printer configurations
    const { data: printerConfigs, error } = await supabase
      .from('cafe_printer_configs')
      .select(`
        *,
        cafes!inner(name)
      `);

    if (error) {
      console.error('❌ Error fetching printer configs:', error);
      return;
    }

    console.log(`✅ Found ${printerConfigs.length} printer configurations:`);
    
    printerConfigs.forEach((config, index) => {
      console.log(`\n${index + 1}. ${config.cafes.name}:`);
      console.log(`   - ID: ${config.id}`);
      console.log(`   - Printer Name: ${config.printer_name}`);
      console.log(`   - Printer Type: ${config.printer_type}`);
      console.log(`   - Connection Type: ${config.connection_type}`);
      console.log(`   - PrintNode Printer ID: ${config.printnode_printer_id}`);
      console.log(`   - Is Active: ${config.is_active}`);
      console.log(`   - Is Default: ${config.is_default}`);
    });

    // Check if Chatkara has any config
    const chatkaraConfig = printerConfigs.find(config => 
      config.cafes.name.toLowerCase().includes('chatkara')
    );

    if (chatkaraConfig) {
      console.log('\n✅ Chatkara printer configuration found!');
    } else {
      console.log('\n❌ No Chatkara printer configuration found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAllPrinters();
