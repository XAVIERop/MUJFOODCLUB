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

async function checkCafes() {
  console.log('Checking all cafes...');
  
  const { data: cafes, error } = await supabase
    .from('cafes')
    .select('id, name, type')
    .order('name');
  
  if (error) {
    console.error('Error fetching cafes:', error);
    return;
  }
  
  console.log('Found cafes:');
  cafes.forEach(cafe => {
    console.log(`- ${cafe.name} (${cafe.type}) - ID: ${cafe.id}`);
  });
  
  // Look for food court specifically
  const foodCourt = cafes.find(cafe => 
    cafe.name.toLowerCase().includes('food') || 
    cafe.name.toLowerCase().includes('court')
  );
  
  if (foodCourt) {
    console.log(`\nFound Food Court: ${foodCourt.name} - ID: ${foodCourt.id}`);
  } else {
    console.log('\nNo Food Court found');
  }
}

checkCafes();
