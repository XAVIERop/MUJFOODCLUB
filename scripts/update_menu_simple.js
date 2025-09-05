import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for now
const supabaseUrl = 'https://kblazvxfducwviyyiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd3ciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNDU0NzQ0MCwiZXhwIjoyMDQwMTIzNDQwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMenu() {
  console.log('Updating FOOD COURT menu...');
  
  // Get cafe ID
  const { data: cafe } = await supabase
    .from('cafes')
    .select('id')
    .eq('name', 'FOOD COURT')
    .single();
  
  if (!cafe) {
    console.error('FOOD COURT not found');
    return;
  }
  
  console.log('Found cafe:', cafe.id);
  
  // Update some key items as test
  const updates = [
    { name: 'Chicken Hot Wings (6 pcs)', price: 299 },
    { name: 'Pizza Pockets (6 pcs)', price: 199 },
    { name: 'Veggie Momos (6 pcs)', price: 99 },
    { name: 'Khichdi Bowl', price: 169 }
  ];
  
  for (const item of updates) {
    const { error } = await supabase
      .from('menu_items')
      .update({ price: item.price })
      .eq('cafe_id', cafe.id)
      .eq('name', item.name);
    
    if (error) {
      console.error(`Error updating ${item.name}:`, error);
    } else {
      console.log(`✅ Updated ${item.name} to ₹${item.price}`);
    }
  }
  
  console.log('Menu update completed!');
}

updateMenu();
