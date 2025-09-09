import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChatkaraPrinter() {
  console.log('🔍 Checking Chatkara Printer Configuration...');
  
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

    console.log('✅ Chatkara Cafe:', cafe);

    // Get printer configuration for Chatkara
    const { data: printerConfig, error: printerError } = await supabase
      .from('cafe_printer_configs')
      .select(`
        *,
        cafes!inner(name)
      `)
      .eq('cafe_id', cafe.id)
      .eq('is_active', true)
      .eq('is_default', true)
      .single();

    if (printerError) {
      console.error('❌ Error fetching printer config:', printerError);
      console.log('📋 This means Chatkara printer is not configured yet');
      return;
    }

    console.log('✅ Chatkara Printer Configuration:');
    console.log('  - Printer Name:', printerConfig.printer_name);
    console.log('  - Printer Type:', printerConfig.printer_type);
    console.log('  - Connection Type:', printerConfig.connection_type);
    console.log('  - PrintNode Printer ID:', printerConfig.printnode_printer_id);
    console.log('  - Printer IP:', printerConfig.printer_ip);
    console.log('  - Paper Width:', printerConfig.paper_width);
    console.log('  - Print Density:', printerConfig.print_density);
    console.log('  - Auto Cut:', printerConfig.auto_cut);
    console.log('  - Is Active:', printerConfig.is_active);
    console.log('  - Is Default:', printerConfig.is_default);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkChatkaraPrinter();
