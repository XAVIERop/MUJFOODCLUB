import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for now
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
