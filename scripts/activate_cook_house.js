import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
