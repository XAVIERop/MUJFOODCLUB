// Script to show table distribution for each cafe
// This helps verify the table counts before running the migration

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function showTableDistribution() {
  try {
    console.log('🏪 Fetching cafe information...\n');
    
    // Fetch all active cafes
    const { data: cafes, error } = await supabase
      .from('cafes')
      .select('id, name, location, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching cafes:', error);
      return;
    }

    if (!cafes || cafes.length === 0) {
      console.log('⚠️  No active cafes found.');
      return;
    }

    console.log('📋 Table Distribution Plan:');
    console.log('=' .repeat(50));
    
    let totalTables = 0;
    
    cafes.forEach(cafe => {
      const tableCount = getTableCount(cafe.name);
      totalTables += tableCount;
      
      console.log(`\n🏪 ${cafe.name}`);
      console.log(`   Location: ${cafe.location}`);
      console.log(`   Tables: ${tableCount}`);
      console.log(`   Table Numbers: Table 1 - Table ${tableCount}`);
    });
    
    console.log('\n' + '=' .repeat(50));
    console.log(`📊 Total Tables: ${totalTables}`);
    console.log(`🏪 Total Cafes: ${cafes.length}`);
    
    console.log('\n✅ Ready to create tables with this distribution!');
    console.log('💡 Run the database migration to create these tables.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function getTableCount(cafeName) {
  const name = cafeName.toLowerCase();
  
  if (name.includes('cook house')) {
    return 12;
  } else if (name.includes('food court')) {
    return 8;
  } else {
    return 5;
  }
}

// Run the script
showTableDistribution();
