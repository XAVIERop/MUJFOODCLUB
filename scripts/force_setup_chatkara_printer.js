import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceSetupChatkaraPrinter() {
  console.log('🔧 Force Setting up Chatkara Printer Configuration...');
  
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

    // Try to create the printer config using a raw SQL query
    const { data, error } = await supabase
      .from('cafe_printer_configs')
      .insert({
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
      })
      .select();

    if (error) {
      console.error('❌ Error creating printer config:', error);
      
      // If RLS is blocking, let's try to update the existing config
      console.log('📋 Trying to update existing config...');
      
      // First, let's see what configs exist
      const { data: existingConfigs } = await supabase
        .from('cafe_printer_configs')
        .select('*')
        .eq('cafe_id', cafe.id);
        
      console.log('Existing configs:', existingConfigs);
      
      if (existingConfigs && existingConfigs.length > 0) {
        // Try to update the first one
        const { data: updateResult, error: updateError } = await supabase
          .from('cafe_printer_configs')
          .update({
            printer_name: 'Chatkara POS-80-Series',
            printer_type: 'epson_tm_t82',
            connection_type: 'network',
            printnode_printer_id: 74698272,
            paper_width: 80,
            print_density: 8,
            auto_cut: true,
            is_active: true,
            is_default: true
          })
          .eq('id', existingConfigs[0].id)
          .select();
          
        if (updateError) {
          console.error('❌ Error updating printer config:', updateError);
        } else {
          console.log('✅ Printer config updated successfully:', updateResult);
        }
      }
      return;
    }

    console.log('✅ Chatkara Printer Configuration Created:');
    console.log(data);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

forceSetupChatkaraPrinter();
