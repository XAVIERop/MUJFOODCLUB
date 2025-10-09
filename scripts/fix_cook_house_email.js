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

async function fixCookHouseEmail() {
  console.log('📧 Fixing Cook House Owner Email Domain...');
  
  try {
    // 1. Find the Cook House owner profile
    console.log('\n🔍 Finding Cook House owner profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'cookhouse.owner@muj.manipal.edu')
      .single();

    if (profileError || !profile) {
      console.error('❌ Error finding Cook House owner profile:', profileError);
      return;
    }

    console.log('✅ Found profile:', profile.full_name);

    // 2. Update the email to the correct domain
    console.log('\n📧 Updating email to correct domain...');
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        email: 'cookhouse.owner@mujfoodclub.in',
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating email:', updateError);
      return;
    }

    console.log('✅ Email updated successfully:', updatedProfile.email);

    // 3. Verify the update
    console.log('\n🔍 Verifying the update...');
    const { data: verification, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, cafe_id')
      .eq('id', profile.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Verification successful:');
    console.log(`  - Name: ${verification.full_name}`);
    console.log(`  - Email: ${verification.email}`);
    console.log(`  - User Type: ${verification.user_type}`);
    console.log(`  - Cafe ID: ${verification.cafe_id}`);

    // 4. Check if we need to update the auth user as well
    console.log('\n🔐 Note: Auth user email update required');
    console.log('📝 The auth user email also needs to be updated in Supabase Auth dashboard');
    console.log('📝 Or the user can log in with the new email and update password');

    console.log('\n🎉 Cook House owner email domain fixed!');
    console.log('📝 Updated Login Details:');
    console.log(`  Email: cookhouse.owner@mujfoodclub.in`);
    console.log(`  Password: CookHouse2025!`);
    console.log(`  Role: Cafe Owner`);
    console.log(`  Cafe: COOK HOUSE`);
    console.log(`  Priority: 7`);
    
    console.log('\n📝 Domain Usage:');
    console.log('  - @mujfoodclub.in: Cafe owners and staff');
    console.log('  - @muj.manipal.edu: Students');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixCookHouseEmail();












