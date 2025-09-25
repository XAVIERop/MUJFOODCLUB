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

    // 2. Create auth user first (this will create the user in auth.users)
    console.log('\n🔐 Creating auth user for Cook House owner...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'cookhouse.owner@muj.manipal.edu',
      password: 'CookHouse2025!', // Temporary password
      options: {
        data: {
          full_name: 'Cook House Owner',
          user_type: 'cafe_owner'
        }
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created:', authData.user?.email);

    // 3. Update the profile with cafe-specific information
    console.log('\n👤 Updating profile with cafe information...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
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
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error updating profile:', profileError);
      return;
    }

    console.log('✅ Profile updated:', profileData);

    // 4. Create cafe staff record
    console.log('\n🏪 Creating cafe staff record...');
    const staffRecord = {
      id: crypto.randomUUID(),
      cafe_id: cookHouse.id,
      user_id: authData.user.id,
      role: 'owner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: staffData, error: staffError } = await supabase
      .from('cafe_staff')
      .insert(staffRecord)
      .select()
      .single();

    if (staffError) {
      console.error('❌ Error creating staff record:', staffError);
      return;
    }

    console.log('✅ Staff record created:', staffData);

    // 5. Verify the setup
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

    console.log('\n🎉 Cook House staff account created successfully!');
    console.log('📝 Login Details:');
    console.log(`  Email: cookhouse.owner@muj.manipal.edu`);
    console.log(`  Password: CookHouse2025!`);
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








