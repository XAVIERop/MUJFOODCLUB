// Test script to verify cafe priority system
// Run this after applying the SQL script in Supabase

import { createClient } from '@supabase/supabase-js';

// You'll need to add your Supabase credentials here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCafePriority() {
  try {
    console.log('Testing cafe priority system...\n');

    // Test 1: Check if priority column exists
    console.log('1. Checking if priority column exists...');
    const { data: columns, error: columnsError } = await supabase
      .from('cafes')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      const hasPriority = 'priority' in columns[0];
      console.log(`✅ Priority column exists: ${hasPriority}`);
      
      if (hasPriority) {
        console.log(`   Sample priority value: ${columns[0].priority}`);
      }
    }

    // Test 2: Test the get_cafes_ordered function
    console.log('\n2. Testing get_cafes_ordered function...');
    const { data: orderedCafes, error: orderError } = await supabase
      .rpc('get_cafes_ordered');

    if (orderError) {
      console.error('❌ Error calling get_cafes_ordered:', orderError);
      return;
    }

    if (orderedCafes && orderedCafes.length > 0) {
      console.log(`✅ Function works! Found ${orderedCafes.length} cafes`);
      
      // Show first 5 cafes with their priority
      console.log('\nFirst 5 cafes in order:');
      orderedCafes.slice(0, 5).forEach((cafe, index) => {
        console.log(`   ${index + 1}. ${cafe.name} (Priority: ${cafe.priority}, Rating: ${cafe.average_rating || 'N/A'})`);
      });

      // Check if Chatkara is first and Food Court is second
      const firstCafe = orderedCafes[0];
      const secondCafe = orderedCafes[1];

      console.log('\n3. Verifying priority order...');
      
      if (firstCafe && firstCafe.name.toLowerCase().includes('chatkara')) {
        console.log('✅ Chatkara is first (Priority 1)');
      } else {
        console.log('❌ Chatkara is not first');
        console.log(`   First cafe: ${firstCafe?.name} (Priority: ${firstCafe?.priority})`);
      }

      if (secondCafe && secondCafe.name.toLowerCase().includes('food court')) {
        console.log('✅ Food Court is second (Priority 2)');
      } else {
        console.log('❌ Food Court is not second');
        console.log(`   Second cafe: ${secondCafe?.name} (Priority: ${secondCafe?.priority})`);
      }

    } else {
      console.log('❌ No cafes returned from function');
    }

    // Test 3: Check priority values
    console.log('\n4. Checking priority values...');
    const { data: priorityCheck, error: priorityError } = await supabase
      .from('cafes')
      .select('name, priority')
      .order('priority');

    if (priorityError) {
      console.error('Error checking priorities:', priorityError);
      return;
    }

    if (priorityCheck) {
      console.log('Priority breakdown:');
      const priorityGroups = {};
      priorityCheck.forEach(cafe => {
        const priority = cafe.priority || 999;
        if (!priorityGroups[priority]) {
          priorityGroups[priority] = [];
        }
        priorityGroups[priority].push(cafe.name);
      });

      Object.keys(priorityGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(priority => {
        console.log(`   Priority ${priority}: ${priorityGroups[priority].join(', ')}`);
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCafePriority();
