import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
