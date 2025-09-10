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

async function setupChatkaraPrinter() {
  console.log('🔧 Setting up Chatkara Printer Configuration...');
  
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

    console.log('✅ Found Chatkara Cafe:', cafe);

    // Check if printer config already exists
    const { data: existingConfig } = await supabase
      .from('cafe_printer_configs')
      .select('*')
      .eq('cafe_id', cafe.id)
      .eq('is_active', true);

    if (existingConfig && existingConfig.length > 0) {
      console.log('⚠️ Printer configuration already exists for Chatkara');
      console.log('Existing config:', existingConfig[0]);
      return;
    }

    // Create printer configuration for Chatkara
    const { data: printerConfig, error: printerError } = await supabase
      .from('cafe_printer_configs')
      .insert({
        cafe_id: cafe.id,
        printer_name: 'Chatkara Thermal Printer',
        printer_type: 'epson_tm_t82',
        connection_type: 'network',
        printnode_printer_id: 1, // Default printer ID - you'll need to update this with actual PrintNode printer ID
        paper_width: 80,
        print_density: 8,
        auto_cut: true,
        is_active: true,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (printerError) {
      console.error('❌ Error creating printer config:', printerError);
      return;
    }

    console.log('✅ Chatkara Printer Configuration Created:');
    console.log('  - ID:', printerConfig.id);
    console.log('  - Printer Name:', printerConfig.printer_name);
    console.log('  - Printer Type:', printerConfig.printer_type);
    console.log('  - Connection Type:', printerConfig.connection_type);
    console.log('  - PrintNode Printer ID:', printerConfig.printnode_printer_id);
    console.log('  - Paper Width:', printerConfig.paper_width);
    console.log('  - Print Density:', printerConfig.print_density);
    console.log('  - Auto Cut:', printerConfig.auto_cut);

    console.log('\n📋 Next Steps:');
    console.log('1. Get the actual PrintNode printer ID for Chatkara');
    console.log('2. Update the printnode_printer_id in the database');
    console.log('3. Test printing with a sample order');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupChatkaraPrinter();
