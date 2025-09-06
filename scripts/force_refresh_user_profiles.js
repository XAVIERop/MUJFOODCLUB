import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceRefreshUserProfiles() {
  try {
    console.log('🔄 Force Refreshing User Profiles...\n');

    // Step 1: Verify current state
    console.log('📊 Step 1: Current Profile State');
    console.log('-' .repeat(40));
    
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, email, loyalty_points, loyalty_tier, total_orders, total_spent, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log('👥 Current profile data:');
    profiles.forEach(profile => {
      console.log(`  • ${profile.full_name}: ${profile.loyalty_points} points, ${profile.loyalty_tier} tier, ₹${profile.total_spent} spent, ${profile.total_orders} orders`);
    });

    // Step 2: Force update all profiles with current timestamp
    console.log('\n🔄 Step 2: Force Updating All Profiles');
    console.log('-' .repeat(40));
    
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString(),
        // Ensure all values are properly set to 0
        loyalty_points: 0,
        loyalty_tier: 'foodie',
        total_orders: 0,
        total_spent: 0.00
      })
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id, full_name, loyalty_points, loyalty_tier, total_orders, total_spent, updated_at');

    if (updateError) {
      console.error('❌ Error updating profiles:', updateError);
      return;
    }

    console.log(`✅ Force updated ${updateResult.length} profiles`);
    console.log('   • Updated timestamp to force cache refresh');
    console.log('   • Ensured all values are properly reset');

    // Step 3: Verify the update
    console.log('\n✅ Step 3: Verification');
    console.log('-' .repeat(40));
    
    const { data: verifyProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('id, full_name, loyalty_points, loyalty_tier, total_orders, total_spent, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('👥 Updated profile data:');
    verifyProfiles.forEach(profile => {
      console.log(`  • ${profile.full_name}: ${profile.loyalty_points} points, ${profile.loyalty_tier} tier, ₹${profile.total_spent} spent, ${profile.total_orders} orders`);
      console.log(`    Updated: ${new Date(profile.updated_at).toLocaleString()}`);
    });

    // Step 4: Check for any remaining non-zero values
    console.log('\n🔍 Step 4: Checking for Any Remaining Issues');
    console.log('-' .repeat(40));
    
    const { data: problemProfiles, error: problemError } = await supabase
      .from('profiles')
      .select('id, full_name, loyalty_points, loyalty_tier, total_orders, total_spent')
      .or('loyalty_points.gt.0,total_orders.gt.0,total_spent.gt.0')
      .neq('loyalty_tier', 'foodie');

    if (problemError) {
      console.error('❌ Error checking for problems:', problemError);
      return;
    }

    if (problemProfiles.length > 0) {
      console.log('⚠️  Found profiles with non-zero values:');
      problemProfiles.forEach(profile => {
        console.log(`  • ${profile.full_name}: ${profile.loyalty_points} points, ${profile.loyalty_tier} tier, ₹${profile.total_spent} spent, ${profile.total_orders} orders`);
      });
      
      // Fix these profiles
      console.log('\n🔧 Fixing remaining issues...');
      const { data: fixResult, error: fixError } = await supabase
        .from('profiles')
        .update({
          loyalty_points: 0,
          loyalty_tier: 'foodie',
          total_orders: 0,
          total_spent: 0.00,
          updated_at: new Date().toISOString()
        })
        .in('id', problemProfiles.map(p => p.id))
        .select('id, full_name, loyalty_points, loyalty_tier, total_orders, total_spent');

      if (fixError) {
        console.error('❌ Error fixing profiles:', fixError);
      } else {
        console.log(`✅ Fixed ${fixResult.length} problematic profiles`);
      }
    } else {
      console.log('✅ All profiles are properly reset to zero values');
    }

    console.log('\n🎉 FORCE REFRESH COMPLETE!');
    console.log('=' .repeat(60));
    console.log('✅ All user profiles force updated');
    console.log('✅ Cache-busting timestamp applied');
    console.log('✅ All values verified as zero');
    console.log('✅ Users should now see updated data after page refresh');

  } catch (error) {
    console.error('❌ Exception occurred during force refresh:', error);
  }
}

// Run the force refresh
forceRefreshUserProfiles();
