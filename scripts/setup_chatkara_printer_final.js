import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupChatkaraPrinterFinal() {
  console.log('🔧 Setting up Chatkara Printer Configuration (Final)...');
  
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

    // Use a SQL function to insert the printer config (bypasses RLS)
    const { data, error } = await supabase.rpc('setup_chatkara_printer', {
      cafe_id: cafe.id,
      printer_id: 74698272
    });

    if (error) {
      console.error('❌ Error setting up printer via RPC:', error);
      
      // Fallback: Try direct insert with a different approach
      console.log('📋 Trying alternative approach...');
      
      // Create a simple test to see if we can insert
      const testData = {
        cafe_id: cafe.id,
        printer_name: 'Chatkara POS-80-Series',
        printer_type: 'epson_tm_t82',
        connection_type: 'network',
        printnode_printer_id: 74698272,
        paper_width: 80,
        print_density: 8,
        auto_cut: true,
        is_active: true,
        is_default: true
      };

      console.log('📋 Test data:', testData);
      console.log('📋 You may need to manually insert this data in Supabase dashboard');
      return;
    }

    console.log('✅ Chatkara Printer Configuration Created via RPC:');
    console.log(data);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupChatkaraPrinterFinal();
