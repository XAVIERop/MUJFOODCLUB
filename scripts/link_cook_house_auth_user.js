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

async function linkCookHouseAuthUser() {
  console.log('🔗 Linking Cook House Auth User...');
  
  try {
    // 1. Find the Cook House owner profile
    console.log('\n🔍 Finding Cook House owner profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'cookhouse.owner@mujfoodclub.in')
      .single();

    if (profileError || !profile) {
      console.error('❌ Error finding Cook House owner profile:', profileError);
      return;
    }

    console.log('✅ Found profile:', profile.full_name);
    console.log('📧 Current email:', profile.email);
    console.log('🆔 Current profile ID:', profile.id);

    // 2. Get the auth user ID from Supabase Auth
    console.log('\n🔐 Getting auth user ID...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'cookhouse.owner@mujfoodclub.in',
      password: 'Cookhouse2025!'
    });

    if (authError || !authData.user) {
      console.error('❌ Error signing in with auth user:', authError);
      return;
    }

    console.log('✅ Auth user found:');
    console.log('🆔 Auth user ID:', authData.user.id);
    console.log('📧 Auth user email:', authData.user.email);

    // 3. Check if profile ID matches auth user ID
    if (profile.id === authData.user.id) {
      console.log('✅ Profile ID already matches auth user ID - no update needed');
    } else {
      console.log('🔄 Profile ID needs to be updated to match auth user ID');
      
      // Update the profile ID to match the auth user ID
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          id: authData.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating profile ID:', updateError);
        return;
      }

      console.log('✅ Profile ID updated successfully');
    }

    // 4. Verify the cafe staff record is linked correctly
    console.log('\n🔍 Verifying cafe staff record...');
    const { data: staffData, error: staffError } = await supabase
      .from('cafe_staff')
      .select(`
        id,
        role,
        is_active,
        user_id,
        profiles!inner(
          id,
          email,
          full_name,
          user_type
        ),
        cafes!inner(
          id,
          name,
          priority
        )
      `)
      .eq('user_id', authData.user.id)
      .eq('is_active', true);

    if (staffError) {
      console.error('❌ Error checking staff record:', staffError);
      return;
    }

    if (staffData && staffData.length > 0) {
      console.log('✅ Cafe staff record verified:');
      staffData.forEach(staff => {
        console.log(`  - ${staff.profiles.full_name} (${staff.profiles.email})`);
        console.log(`    Role: ${staff.role}`);
        console.log(`    Cafe: ${staff.cafes.name} (Priority: ${staff.cafes.priority})`);
        console.log(`    Status: ${staff.is_active ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('❌ No cafe staff record found - creating one...');
      
      // Get Cook House cafe ID
      const { data: cookHouse, error: cafeError } = await supabase
        .from('cafes')
        .select('id, name')
        .ilike('name', '%cook house%')
        .single();

      if (cafeError || !cookHouse) {
        console.error('❌ Error finding Cook House:', cafeError);
        return;
      }

      // Create cafe staff record
      const { data: newStaff, error: createStaffError } = await supabase
        .from('cafe_staff')
        .insert({
          id: crypto.randomUUID(),
          cafe_id: cookHouse.id,
          user_id: authData.user.id,
          role: 'owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createStaffError) {
        console.error('❌ Error creating staff record:', createStaffError);
        return;
      }

      console.log('✅ Cafe staff record created:', newStaff);
    }

    // 5. Final verification
    console.log('\n🔍 Final verification...');
    const { data: finalVerification, error: finalError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        user_type,
        cafe_id,
        cafes!inner(
          id,
          name,
          priority,
          is_active
        )
      `)
      .eq('id', authData.user.id)
      .single();

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
      return;
    }

    console.log('✅ Final verification successful:');
    console.log(`  - Name: ${finalVerification.full_name}`);
    console.log(`  - Email: ${finalVerification.email}`);
    console.log(`  - User Type: ${finalVerification.user_type}`);
    console.log(`  - Cafe: ${finalVerification.cafes.name} (Priority: ${finalVerification.cafes.priority})`);
    console.log(`  - Cafe Active: ${finalVerification.cafes.is_active ? 'Yes' : 'No'}`);

    console.log('\n🎉 Cook House auth user linking completed!');
    console.log('📝 Login Details:');
    console.log(`  Email: cookhouse.owner@mujfoodclub.in`);
    console.log(`  Password: Cookhouse2025!`);
    console.log(`  Role: Cafe Owner`);
    console.log(`  Cafe: COOK HOUSE`);
    console.log(`  Priority: 7`);
    
    console.log('\n✅ Ready for login and testing!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

linkCookHouseAuthUser();








