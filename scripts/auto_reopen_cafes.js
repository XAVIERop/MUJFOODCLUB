#!/usr/bin/env node

/**
 * Automated Cafe Reopening System
 * Reopens the first 10 cafes at exactly 11:00 AM
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get the first 10 cafes ordered by priority
 */
async function getFirst10Cafes() {
  try {
    console.log('🔍 Fetching first 10 cafes...');
    
    const { data, error } = await supabase
      .from('cafes')
      .select('id, name, priority, accepting_orders')
      .order('priority', { ascending: true })
      .limit(10);

    if (error) {
      throw error;
    }

    console.log(`✅ Found ${data.length} cafes`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching cafes:', error);
    throw error;
  }
}

/**
 * Reopen a single cafe
 */
async function reopenCafe(cafe) {
  try {
    const { error } = await supabase
      .from('cafes')
      .update({ 
        accepting_orders: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', cafe.id);

    if (error) {
      throw error;
    }

    console.log(`✅ Reopened: ${cafe.name} (Priority: ${cafe.priority})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to reopen ${cafe.name}:`, error);
    return false;
  }
}

/**
 * Reopen all first 10 cafes
 */
async function reopenAllCafes() {
  try {
    console.log('🚀 Starting automated cafe reopening at 11:00 AM...');
    console.log(`⏰ Current time: ${new Date().toLocaleString()}`);
    
    const cafes = await getFirst10Cafes();
    
    if (cafes.length === 0) {
      console.log('⚠️ No cafes found to reopen');
      return;
    }

    console.log('\n📋 Cafes to reopen:');
    cafes.forEach((cafe, index) => {
      console.log(`${index + 1}. ${cafe.name} (Priority: ${cafe.priority}, Currently: ${cafe.accepting_orders ? 'Open' : 'Closed'})`);
    });

    console.log('\n🔄 Reopening cafes...');
    
    const results = await Promise.allSettled(
      cafes.map(cafe => reopenCafe(cafe))
    );

    const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
    const failed = results.length - successful;

    console.log('\n📊 Reopening Summary:');
    console.log(`✅ Successfully reopened: ${successful} cafes`);
    console.log(`❌ Failed to reopen: ${failed} cafes`);
    
    if (successful > 0) {
      console.log('\n🎉 Automated reopening completed successfully!');
    }

  } catch (error) {
    console.error('❌ Automated reopening failed:', error);
    throw error;
  }
}

/**
 * Schedule the reopening for 11:00 AM
 */
function scheduleReopening() {
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(11, 0, 0, 0); // 11:00 AM

  // If it's already past 11 AM today, schedule for tomorrow
  if (now >= targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilReopening = targetTime.getTime() - now.getTime();
  const hoursUntil = Math.floor(timeUntilReopening / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntilReopening % (1000 * 60 * 60)) / (1000 * 60));

  console.log(`⏰ Next reopening scheduled for: ${targetTime.toLocaleString()}`);
  console.log(`⏳ Time until reopening: ${hoursUntil}h ${minutesUntil}m`);

  setTimeout(async () => {
    try {
      await reopenAllCafes();
      
      // Schedule the next day's reopening
      scheduleReopening();
    } catch (error) {
      console.error('❌ Scheduled reopening failed:', error);
    }
  }, timeUntilReopening);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🏪 Automated Cafe Reopening System');
    console.log('=====================================');
    
    // Test connection
    const { data, error } = await supabase
      .from('cafes')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    console.log('✅ Database connection successful');
    
    // Start the scheduling system
    scheduleReopening();
    
    console.log('\n🔄 System is now running...');
    console.log('Press Ctrl+C to stop');
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down automated reopening system...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ System startup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  reopenAllCafes,
  getFirst10Cafes,
  reopenCafe,
  scheduleReopening
};
