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

async function addMenuPdfColumn() {
  console.log('🔧 Adding menu_pdf_url column to cafes table...\n');

  try {
    // Use the SQL editor approach - we'll need to run this manually in Supabase
    console.log('📝 Please run the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('-- Add menu_pdf_url column to cafes table');
    console.log('ALTER TABLE public.cafes ADD COLUMN menu_pdf_url TEXT;');
    console.log('');
    console.log('-- Add comment to the column');
    console.log("COMMENT ON COLUMN public.cafes.menu_pdf_url IS 'URL to the cafe menu PDF file';");
    console.log('');
    console.log('-- Create index for better performance');
    console.log('CREATE INDEX IF NOT EXISTS idx_cafes_menu_pdf_url ON public.cafes(menu_pdf_url) WHERE menu_pdf_url IS NOT NULL;');
    console.log('');
    console.log('-- Update Chatkara cafe with menu PDF URL');
    console.log("UPDATE public.cafes SET menu_pdf_url = '/chatkaramenu.pdf' WHERE name ILIKE '%chatkara%';");
    console.log('');
    console.log('-- Verify the update');
    console.log("SELECT id, name, menu_pdf_url, accepting_orders FROM public.cafes WHERE name ILIKE '%chatkara%';");
    console.log('');

    // Let's also try to check the current schema
    console.log('🔍 Checking current cafes table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('cafes')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError);
    } else if (schemaData && schemaData.length > 0) {
      console.log('✅ Current cafes table columns:');
      Object.keys(schemaData[0]).forEach(column => {
        console.log(`   - ${column}`);
      });
      
      if ('menu_pdf_url' in schemaData[0]) {
        console.log('✅ menu_pdf_url column already exists!');
      } else {
        console.log('❌ menu_pdf_url column does not exist yet.');
      }
    }

  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

addMenuPdfColumn();
