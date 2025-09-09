import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCafeOwners() {
  console.log('🔍 Checking all cafe owner accounts...\n');
  
  try {
    // Check all cafe owner profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        user_type,
        cafe_id,
        created_at
      `)
      .eq('user_type', 'cafe_owner');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }

    console.log('👥 Cafe Owner Accounts:');
    console.log('========================');
    
    for (const profile of profiles) {
      // Get cafe details
      const { data: cafe, error: cafeError } = await supabase
        .from('cafes')
        .select('name, priority, is_exclusive, accepting_orders')
        .eq('id', profile.cafe_id)
        .single();

      if (cafeError) {
        console.log(`❌ ${profile.email} - Error fetching cafe: ${cafeError.message}`);
        continue;
      }

      console.log(`📧 Email: ${profile.email}`);
      console.log(`👤 Name: ${profile.full_name}`);
      console.log(`🏪 Cafe: ${cafe.name}`);
      console.log(`🎯 Priority: ${cafe.priority}`);
      console.log(`⭐ Exclusive: ${cafe.is_exclusive ? 'Yes' : 'No'}`);
      console.log(`🟢 Accepting Orders: ${cafe.accepting_orders ? 'Yes' : 'No'}`);
      console.log(`📅 Created: ${new Date(profile.created_at).toLocaleDateString()}`);
      console.log('---');
    }

    // Check for Food Court specifically
    console.log('\n🍽️ Food Court Specific Check:');
    console.log('=============================');
    
    const { data: foodCourt, error: fcError } = await supabase
      .from('cafes')
      .select('id, name, priority, is_exclusive, accepting_orders')
      .ilike('name', '%food%court%')
      .single();

    if (fcError) {
      console.log('❌ Food Court cafe not found');
    } else {
      console.log(`✅ Food Court found: ${foodCourt.name}`);
      console.log(`   Priority: ${foodCourt.priority}`);
      console.log(`   Exclusive: ${foodCourt.is_exclusive ? 'Yes' : 'No'}`);
      console.log(`   Accepting Orders: ${foodCourt.accepting_orders ? 'Yes' : 'No'}`);
      
      // Check if there's an owner for Food Court
      const { data: fcOwner, error: fcOwnerError } = await supabase
        .from('profiles')
        .select('email, full_name, user_type')
        .eq('cafe_id', foodCourt.id)
        .eq('user_type', 'cafe_owner')
        .single();

      if (fcOwnerError) {
        console.log('❌ No owner found for Food Court');
      } else {
        console.log(`✅ Food Court Owner: ${fcOwner.email}`);
        console.log(`   Name: ${fcOwner.full_name}`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkCafeOwners();
