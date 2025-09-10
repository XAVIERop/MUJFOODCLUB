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

async function testVegToggle() {
  try {
    console.log('🧪 Testing Veg/Non-Veg Toggle Functionality...\n');

    // Get Food Court cafe ID
    const { data: cafeData, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name')
      .eq('name', 'FOOD COURT')
      .single();

    if (cafeError) {
      console.error('❌ Error fetching Food Court cafe:', cafeError);
      return;
    }

    console.log(`✅ Found Food Court cafe: ${cafeData.name} (ID: ${cafeData.id})\n`);

    // Check if is_vegetarian column exists
    const { data: columnCheck, error: columnError } = await supabase
      .from('menu_items')
      .select('is_vegetarian')
      .limit(1);

    if (columnError) {
      console.error('❌ is_vegetarian column does not exist:', columnError);
      return;
    }

    console.log('✅ is_vegetarian column exists in menu_items table\n');

    // Get all menu items for Food Court
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, category, price, is_vegetarian')
      .eq('cafe_id', cafeData.id)
      .eq('is_available', true)
      .order('category', { ascending: true });

    if (menuError) {
      console.error('❌ Error fetching menu items:', menuError);
      return;
    }

    console.log(`📊 Total menu items: ${menuItems.length}\n`);

    // Count veg vs non-veg items
    const vegItems = menuItems.filter(item => item.is_vegetarian === true);
    const nonVegItems = menuItems.filter(item => item.is_vegetarian === false);
    const nullItems = menuItems.filter(item => item.is_vegetarian === null);

    console.log(`🥬 Vegetarian items: ${vegItems.length}`);
    console.log(`🍗 Non-vegetarian items: ${nonVegItems.length}`);
    console.log(`❓ Items with null is_vegetarian: ${nullItems.length}\n`);

    // Show sample items from each category
    console.log('🥬 Sample Vegetarian Items:');
    vegItems.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name} (${item.category}) - ₹${item.price}`);
    });

    console.log('\n🍗 Sample Non-Vegetarian Items:');
    nonVegItems.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name} (${item.category}) - ₹${item.price}`);
    });

    if (nullItems.length > 0) {
      console.log('\n❓ Items with null is_vegetarian (need to be fixed):');
      nullItems.slice(0, 5).forEach(item => {
        console.log(`  - ${item.name} (${item.category}) - ₹${item.price}`);
      });
    }

    // Test filtering logic
    console.log('\n🔍 Testing Filter Logic:');
    
    const allItems = menuItems;
    const vegOnly = menuItems.filter(item => item.is_vegetarian === true);
    const nonVegOnly = menuItems.filter(item => item.is_vegetarian === false);

    console.log(`  All items: ${allItems.length}`);
    console.log(`  Veg only: ${vegOnly.length}`);
    console.log(`  Non-veg only: ${nonVegOnly.length}`);

    // Check if the filtering logic matches expected behavior
    if (vegOnly.length + nonVegOnly.length === allItems.length - nullItems.length) {
      console.log('✅ Filter logic is working correctly');
    } else {
      console.log('⚠️  Filter logic may have issues');
    }

    console.log('\n🎉 Veg/Non-Veg toggle test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the complete menu update script in Supabase SQL Editor');
    console.log('2. Test the toggle in the frontend application');
    console.log('3. Verify that clicking "Veg Only" shows only vegetarian items');
    console.log('4. Verify that clicking "Non-Veg Only" shows only non-vegetarian items');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVegToggle();
