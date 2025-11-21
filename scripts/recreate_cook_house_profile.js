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

async function recreateCookHouseProfile() {
  console.log('🔄 Recreating Cook House Profile with Correct Auth User ID...');
  
  try {
    // 1. Get the auth user ID by signing in
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

    // 2. Get Cook House cafe ID
    console.log('\n🔍 Getting Cook House cafe ID...');
    const { data: cookHouse, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name')
      .ilike('name', '%cook house%')
      .single();

    if (cafeError || !cookHouse) {
      console.error('❌ Error finding Cook House:', cafeError);
      return;
    }

    console.log('✅ Cook House found:', cookHouse);

    // 3. Find and delete existing profile and staff record
    console.log('\n🔍 Finding existing profile...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'cookhouse.owner@mujfoodclub.in')
      .single();

    if (existingProfile) {
      console.log('✅ Found existing profile:', existingProfile.full_name);
      
      // Delete existing cafe staff record first
      console.log('\n🗑️ Deleting existing cafe staff record...');
      const { error: deleteStaffError } = await supabase
        .from('cafe_staff')
        .delete()
        .eq('user_id', existingProfile.id);

      if (deleteStaffError) {
        console.error('❌ Error deleting staff record:', deleteStaffError);
        return;
      }

      console.log('✅ Staff record deleted');

      // Delete existing profile
      console.log('\n🗑️ Deleting existing profile...');
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', existingProfile.id);

      if (deleteProfileError) {
        console.error('❌ Error deleting profile:', deleteProfileError);
        return;
      }

      console.log('✅ Profile deleted');
    } else {
      console.log('ℹ️ No existing profile found');
    }

    // 4. Create new profile with correct auth user ID
    console.log('\n🆕 Creating new profile with correct auth user ID...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'cookhouse.owner@mujfoodclub.in',
        full_name: 'Cook House Owner',
        block: 'B1',
        phone: '+91-9876543210',
        user_type: 'cafe_owner',
        cafe_id: cookHouse.id,
        loyalty_points: 0,
        loyalty_tier: 'foodie',
        qr_code: `QR-COOKHOUSE-OWNER-${Date.now()}`,
        student_id: 'COOK001',
        total_orders: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating new profile:', createError);
      return;
    }

    console.log('✅ New profile created:', newProfile);

    // 5. Create new cafe staff record
    console.log('\n🆕 Creating new cafe staff record...');
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

    console.log('✅ New staff record created:', newStaff);

    // 6. Final verification
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

    // 7. Verify cafe staff record
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
    }

    console.log('\n🎉 Cook House profile recreation completed!');
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

recreateCookHouseProfile();

















