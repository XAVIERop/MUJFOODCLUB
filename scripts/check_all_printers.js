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
