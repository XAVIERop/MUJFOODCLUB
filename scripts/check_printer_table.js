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

async function checkPrinterTable() {
  console.log('🔍 Checking Printer Table Structure...');
  
  try {
    // Check if table exists by trying to select from it
    const { data, error } = await supabase
      .from('cafe_printer_configs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing printer table:', error);
      console.log('📋 This might mean the table does not exist or RLS is blocking access');
      return;
    }

    console.log('✅ Printer table exists and is accessible');
    console.log(`📊 Found ${data.length} records (limited to 1)`);

    // Try to get table structure info
    console.log('\n📋 Table structure check completed');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkPrinterTable();
