import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function activateCookHouse() {
  console.log('🏪 Activating Cook House Cafe...');
  
  try {
    // 1. Check current Cook House status
    console.log('\n📊 Current Cook House Status:');
    const { data: currentStatus, error: statusError } = await supabase
      .from('cafes')
      .select('id, name, priority, is_active, accepting_orders, created_at')
      .ilike('name', '%cook house%');

    if (statusError) {
      console.error('❌ Error checking Cook House status:', statusError);
      return;
    }

    if (currentStatus && currentStatus.length > 0) {
      console.log('✅ Cook House found:', currentStatus[0]);
    } else {
      console.log('❌ Cook House not found in database');
      return;
    }

    // 2. Update Cook House priority to 7
    console.log('\n🔄 Updating Cook House priority to 7...');
    const { data: updateData, error: updateError } = await supabase
      .from('cafes')
      .update({
        priority: 7,
        is_active: true,
        accepting_orders: true,
        updated_at: new Date().toISOString()
      })
      .ilike('name', '%cook house%')
      .select();

    if (updateError) {
      console.error('❌ Error updating Cook House:', updateError);
      return;
    }

    console.log('✅ Cook House updated successfully:', updateData[0]);

    // 3. Check current cafe priorities
    console.log('\n📋 Current Cafe Priorities:');
    const { data: allCafes, error: cafesError } = await supabase
      .from('cafes')
      .select('name, priority, is_active, accepting_orders')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (cafesError) {
      console.error('❌ Error fetching cafes:', cafesError);
      return;
    }

    allCafes.forEach((cafe, index) => {
      const status = cafe.accepting_orders ? '✅' : '❌';
      console.log(`${index + 1}. ${cafe.name} - Priority: ${cafe.priority} ${status}`);
    });

    console.log('\n🎉 Cook House activation completed successfully!');
    console.log('📝 Next steps:');
    console.log('1. Create cafe staff account for Cook House');
    console.log('2. Set up Ezeep integration for Xprinter');
    console.log('3. Test the complete system');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

activateCookHouse();








