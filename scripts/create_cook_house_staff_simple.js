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

async function createCookHouseStaff() {
  console.log('👥 Creating Cook House Staff Account...');
  
  try {
    // 1. Get Cook House cafe ID
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

    // 2. Check if profile already exists
    console.log('\n🔍 Checking if profile already exists...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'cookhouse.owner@muj.manipal.edu')
      .single();

    let profileId;
    
    if (existingProfile) {
      console.log('✅ Profile already exists, updating...');
      profileId = existingProfile.id;
      
      // Update existing profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Cook House Owner',
          block: 'B1',
          phone: '+91-9876543210',
          user_type: 'cafe_owner',
          cafe_id: cookHouse.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        return;
      }

      console.log('✅ Profile updated:', profileData);
    } else {
      console.log('❌ Profile not found. Please create the auth user first.');
      console.log('📝 Manual steps required:');
      console.log('1. Go to Supabase Auth dashboard');
      console.log('2. Create user with email: cookhouse.owner@muj.manipal.edu');
      console.log('3. Run this script again');
      return;
    }

    // 3. Check if cafe staff record already exists
    console.log('\n🔍 Checking if cafe staff record exists...');
    const { data: existingStaff, error: staffCheckError } = await supabase
      .from('cafe_staff')
      .select('*')
      .eq('cafe_id', cookHouse.id)
      .eq('user_id', profileId)
      .single();

    if (existingStaff) {
      console.log('✅ Staff record already exists, updating...');
      
      // Update existing staff record
      const { data: staffData, error: staffError } = await supabase
        .from('cafe_staff')
        .update({
          role: 'owner',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStaff.id)
        .select()
        .single();

      if (staffError) {
        console.error('❌ Error updating staff record:', staffError);
        return;
      }

      console.log('✅ Staff record updated:', staffData);
    } else {
      console.log('🆕 Creating new staff record...');
      
      // Create new staff record
      const { data: staffData, error: staffError } = await supabase
        .from('cafe_staff')
        .insert({
          id: crypto.randomUUID(),
          cafe_id: cookHouse.id,
          user_id: profileId,
          role: 'owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (staffError) {
        console.error('❌ Error creating staff record:', staffError);
        return;
      }

      console.log('✅ Staff record created:', staffData);
    }

    // 4. Verify the setup
    console.log('\n🔍 Verifying Cook House staff setup...');
    const { data: verification, error: verifyError } = await supabase
      .from('cafe_staff')
      .select(`
        id,
        role,
        is_active,
        cafe_id,
        profiles!inner(
          id,
          email,
          full_name,
          user_type,
          cafe_id
        ),
        cafes!inner(
          id,
          name,
          priority,
          is_active
        )
      `)
      .eq('cafe_id', cookHouse.id)
      .eq('is_active', true);

    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError);
      return;
    }

    console.log('✅ Cook House staff setup verified:');
    verification.forEach(staff => {
      console.log(`  - ${staff.profiles.full_name} (${staff.profiles.email})`);
      console.log(`    Role: ${staff.role}`);
      console.log(`    Cafe: ${staff.cafes.name} (Priority: ${staff.cafes.priority})`);
      console.log(`    Status: ${staff.is_active ? 'Active' : 'Inactive'}`);
    });

    console.log('\n🎉 Cook House staff account setup completed!');
    console.log('📝 Login Details:');
    console.log(`  Email: cookhouse.owner@muj.manipal.edu`);
    console.log(`  Role: Cafe Owner`);
    console.log(`  Cafe: COOK HOUSE`);
    console.log(`  Priority: 7`);
    console.log('\n📝 Next steps:');
    console.log('1. Set up Ezeep integration for Xprinter');
    console.log('2. Test the complete system');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createCookHouseStaff();









