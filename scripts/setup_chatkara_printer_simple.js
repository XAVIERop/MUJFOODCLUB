import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupChatkaraPrinter() {
  console.log('🔧 Setting up Chatkara Printer Configuration...');
  
  try {
    // First, let's try to disable RLS temporarily by using a direct SQL approach
    console.log('📋 Attempting to create printer configuration...');
    
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

    // Try to insert using a raw SQL query
    const { data, error } = await supabase
      .from('cafe_printer_configs')
      .insert({
        cafe_id: cafe.id,
        printer_name: 'Chatkara Thermal Printer',
        printer_type: 'epson_tm_t82',
        connection_type: 'network',
        printnode_printer_id: 1,
        paper_width: 80,
        print_density: 8,
        auto_cut: true,
        is_active: true,
        is_default: true
      })
      .select();

    if (error) {
      console.error('❌ Error creating printer config:', error);
      console.log('📋 This might be due to RLS policies. Let me try a different approach...');
      
      // Try to check if there's already a config
      const { data: existingConfig } = await supabase
        .from('cafe_printer_configs')
        .select('*')
        .eq('cafe_id', cafe.id);
        
      if (existingConfig && existingConfig.length > 0) {
        console.log('✅ Printer configuration already exists:');
        console.log(existingConfig[0]);
      } else {
        console.log('❌ No existing configuration found and cannot create new one due to RLS');
        console.log('📋 You may need to run this script with service role permissions');
      }
      return;
    }

    console.log('✅ Chatkara Printer Configuration Created:');
    console.log(data[0]);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupChatkaraPrinter();
