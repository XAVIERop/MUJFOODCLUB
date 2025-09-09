import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
