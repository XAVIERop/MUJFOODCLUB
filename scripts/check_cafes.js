import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd3ciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNDU0NzQ0MCwiZXhwIjoyMDQwMTIzNDQwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

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
