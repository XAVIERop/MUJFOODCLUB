import { createClient } from '@supabase/supabase-js';

// Supabase configuration
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

async function checkMiniMealsAccount() {
  try {
    console.log('Checking Mini Meals cafe owner account...\n');

    // Check profiles table for Mini Meals accounts
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, cafe_id, created_at')
      .or('email.ilike.%mini%meals%,email.ilike.%minimeals%,full_name.ilike.%Mini Meals%')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    console.log('=== Mini Meals Cafe Owner Accounts ===');
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(`ID: ${profile.id}`);
        console.log(`Email: ${profile.email}`);
        console.log(`Full Name: ${profile.full_name}`);
        console.log(`User Type: ${profile.user_type}`);
        console.log(`Cafe ID: ${profile.cafe_id}`);
        console.log(`Created: ${profile.created_at}`);
        console.log('---');
      });
    } else {
      console.log('No Mini Meals cafe owner accounts found.');
    }

    // Check cafes table for Mini Meals cafe
    const { data: cafes, error: cafesError } = await supabase
      .from('cafes')
      .select('id, name, type, description, accepting_orders')
      .or('name.ilike.%Mini Meals%,name.ilike.%mini%meals%')
      .order('name');

    if (cafesError) {
      console.error('Error fetching cafes:', cafesError);
      return;
    }

    console.log('\n=== Mini Meals Cafe Information ===');
    if (cafes && cafes.length > 0) {
      cafes.forEach(cafe => {
        console.log(`ID: ${cafe.id}`);
        console.log(`Name: ${cafe.name}`);
        console.log(`Type: ${cafe.type}`);
        console.log(`Description: ${cafe.description}`);
        console.log(`Accepting Orders: ${cafe.accepting_orders}`);
        console.log('---');
      });
    } else {
      console.log('No Mini Meals cafe found in cafes table.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkMiniMealsAccount();
