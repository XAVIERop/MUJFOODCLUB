#!/usr/bin/env node

/**
 * Check Cafe Status and Automation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  console.log('   Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCafeStatus() {
  console.log('🔍 CHECKING CAFE STATUS');
  console.log('========================\n');

  try {
    // Get current cafe status
    const { data: cafes, error } = await supabase
      .from('cafes')
      .select('name, accepting_orders, updated_at')
      .order('name');

    if (error) {
      console.error('❌ Error fetching cafes:', error);
      return;
    }

    console.log('📊 CAFE STATUS SUMMARY:');
    console.log(`   Total cafes: ${cafes.length}`);
    console.log(`   Open cafes: ${cafes.filter(c => c.accepting_orders).length}`);
    console.log(`   Closed cafes: ${cafes.filter(c => !c.accepting_orders).length}\n`);

    console.log('🏪 INDIVIDUAL CAFE STATUS:');
    cafes.forEach(cafe => {
      const status = cafe.accepting_orders ? '✅ OPEN' : '❌ CLOSED';
      const updated = new Date(cafe.updated_at).toLocaleString();
      console.log(`   ${cafe.name}: ${status} (updated: ${updated})`);
    });

    // Check if it's past 11 AM
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    console.log(`\n⏰ CURRENT TIME: ${currentTime}`);
    
    if (currentHour >= 11) {
      console.log('⚠️  It\'s past 11 AM - cafes should be open!');
      
      const closedCafes = cafes.filter(c => !c.accepting_orders);
      if (closedCafes.length > 0) {
        console.log(`\n🚨 AUTOMATION ISSUE DETECTED:`);
        console.log(`   ${closedCafes.length} cafes are still closed after 11 AM`);
        console.log(`   This indicates the auto-reopen system is not working`);
        
        console.log(`\n💡 MANUAL FIX:`);
        console.log(`   Run: node scripts/test_automation.sql`);
        console.log(`   Or manually reopen cafes in Supabase dashboard`);
      }
    } else {
      console.log('✅ It\'s before 11 AM - cafes should be closed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCafeStatus();
