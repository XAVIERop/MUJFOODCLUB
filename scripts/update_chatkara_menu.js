import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateChatkaraMenu() {
  console.log('🍽️  Updating Chatkara Menu PDF URL...\n');

  try {
    // First, add the menu_pdf_url column if it doesn't exist
    console.log('1️⃣  Adding menu_pdf_url column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS menu_pdf_url TEXT;'
    });

    if (alterError) {
      console.log('⚠️  Column might already exist:', alterError.message);
    } else {
      console.log('✅ Column added successfully');
    }

    // Update Chatkara cafe with menu PDF URL
    console.log('\n2️⃣  Updating Chatkara cafe...');
    const { data, error } = await supabase
      .from('cafes')
      .update({ menu_pdf_url: '/chatkaramenu.pdf' })
      .ilike('name', '%chatkara%')
      .select('id, name, menu_pdf_url, accepting_orders');

    if (error) {
      console.error('❌ Error updating Chatkara:', error);
      return;
    }

    console.log('✅ Chatkara updated successfully:');
    data.forEach(cafe => {
      console.log(`   - ${cafe.name}: ${cafe.menu_pdf_url}`);
    });

    // Verify the update
    console.log('\n3️⃣  Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('cafes')
      .select('id, name, menu_pdf_url, accepting_orders')
      .ilike('name', '%chatkara%');

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Verification successful:');
    verifyData.forEach(cafe => {
      console.log(`   - ${cafe.name}:`);
      console.log(`     Menu PDF: ${cafe.menu_pdf_url || 'Not set'}`);
      console.log(`     Accepting Orders: ${cafe.accepting_orders ? 'Yes' : 'No'}`);
    });

    console.log('\n🎉 Chatkara menu PDF URL updated successfully!');
    console.log('📱 The "View Menu" button should now work for Chatkara cafe.');

  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

updateChatkaraMenu();
