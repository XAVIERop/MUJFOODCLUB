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

async function checkCookHouseMenu() {
  console.log('🔍 Checking Cook House Menu Items...\n');
  
  try {
    // Get Cook House cafe
    const { data: cafe, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name')
      .ilike('name', '%cook%house%')
      .single();

    if (cafeError) {
      console.error('❌ Error fetching Cook House cafe:', cafeError);
      return;
    }

    console.log('✅ Found Cook House Cafe:', cafe.name);

    // Get all menu items for Cook House
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, category, price, is_available')
      .eq('cafe_id', cafe.id)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (menuError) {
      console.error('❌ Error fetching menu items:', menuError);
      return;
    }

    console.log(`\n📋 Cook House has ${menuItems.length} menu items:\n`);

    // Group by category
    const categories = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    // Display by category
    Object.keys(categories).sort().forEach(category => {
      console.log(`\n=== ${category.toUpperCase()} ===`);
      categories[category].forEach(item => {
        console.log(`  - ${item.name}: ₹${item.price} (Available: ${item.is_available})`);
      });
    });

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`  - Total items: ${menuItems.length}`);
    console.log(`  - Categories: ${Object.keys(categories).length}`);
    console.log(`  - Available items: ${menuItems.filter(item => item.is_available).length}`);
    console.log(`  - Unavailable items: ${menuItems.filter(item => !item.is_available).length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkCookHouseMenu();
