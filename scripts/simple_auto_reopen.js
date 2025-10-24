#!/usr/bin/env node

/**
 * Simple Automated Cafe Reopening
 * Just switches the accepting_orders toggle to ON for first 10 cafes at 11:00 AM
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function reopenFirst10Cafes() {
  try {
    console.log('🚀 Auto-reopening first 10 cafes at 11:00 AM...');
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);

    // Get first 10 cafes by priority
    const { data: cafes, error: fetchError } = await supabase
      .from('cafes')
      .select('id, name, priority, accepting_orders')
      .order('priority', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    if (!cafes || cafes.length === 0) {
      console.log('⚠️ No cafes found');
      return;
    }

    console.log(`📋 Found ${cafes.length} cafes to reopen:`);
    cafes.forEach((cafe, index) => {
      console.log(`  ${index + 1}. ${cafe.name} (Priority: ${cafe.priority})`);
    });

    // Simply update accepting_orders to true for all cafes
    const { data, error } = await supabase
      .from('cafes')
      .update({ 
        accepting_orders: true,
        updated_at: new Date().toISOString()
      })
      .in('id', cafes.map(cafe => cafe.id));

    if (error) {
      throw error;
    }

    console.log('✅ Successfully reopened all first 10 cafes!');
    console.log('🎉 Cafes are now accepting orders');

  } catch (error) {
    console.error('❌ Failed to reopen cafes:', error);
    throw error;
  }
}

// Run the function
reopenFirst10Cafes()
  .then(() => {
    console.log('✅ Auto-reopen completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Auto-reopen failed:', error);
    process.exit(1);
  });

export { reopenFirst10Cafes };
