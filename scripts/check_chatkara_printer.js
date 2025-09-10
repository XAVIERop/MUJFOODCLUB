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
