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

async function createCookHouseProfile() {
  console.log('👤 Creating Cook House Profile Manually...');
  
  try {
    // User ID from previous creation
    const userId = '61ea30dc-10c4-4800-9cb4-d815d59a17c2';
    
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

    console.log('✅ Cook House found:', cookHouse);

    // Create profile manually
    console.log('\n👤 Creating profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'cookhouse.owner@muj.manipal.edu',
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

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created:', profileData);

    // Create cafe staff record
    console.log('\n🏪 Creating cafe staff record...');
    const { data: staffData, error: staffError } = await supabase
      .from('cafe_staff')
      .insert({
        id: crypto.randomUUID(),
        cafe_id: cookHouse.id,
        user_id: userId,
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

    // Verify the setup
    console.log('\n🔍 Verifying setup...');
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

createCookHouseProfile();










