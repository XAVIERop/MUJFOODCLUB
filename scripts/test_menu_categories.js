import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMenuCategories() {
  console.log('🔍 Testing Menu Categories Navigation...\n');
  
  try {
    // Get a sample cafe (Chatkara)
    const { data: cafe, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name, accepting_orders')
      .ilike('name', '%chatkara%')
      .single();

    if (cafeError || !cafe) {
      console.error('❌ Error finding Chatkara cafe:', cafeError);
      return;
    }

    console.log(`✅ Testing cafe: ${cafe.name}`);
    console.log(`   ID: ${cafe.id}`);
    console.log(`   Accepting Orders: ${cafe.accepting_orders ? 'Yes' : 'No'}\n`);

    // Get menu items for this cafe
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, description, price, category, is_available, is_vegetarian')
      .eq('cafe_id', cafe.id)
      .eq('is_available', true)
      .order('category', { ascending: true });

    if (menuError) {
      console.error('❌ Error fetching menu items:', menuError);
      return;
    }

    console.log(`📋 Menu Items Found: ${menuItems.length}\n`);

    // Group items by category
    const categories = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    console.log('📂 Categories Found:');
    console.log('===================');
    
    Object.keys(categories).forEach(category => {
      const items = categories[category];
      const vegCount = items.filter(item => item.is_vegetarian).length;
      const nonVegCount = items.length - vegCount;
      
      console.log(`\n🏷️  ${category}`);
      console.log(`   Total Items: ${items.length}`);
      console.log(`   Vegetarian: ${vegCount}`);
      console.log(`   Non-Vegetarian: ${nonVegCount}`);
      
      // Show first few items as examples
      console.log(`   Sample Items:`);
      items.slice(0, 3).forEach(item => {
        console.log(`     - ${item.name} (₹${item.price}) ${item.is_vegetarian ? '🥬' : '🍗'}`);
      });
      if (items.length > 3) {
        console.log(`     ... and ${items.length - 3} more`);
      }
    });

    // Test filtering scenarios
    console.log('\n🔍 Testing Filter Scenarios:');
    console.log('============================');
    
    // Test 1: All items
    console.log(`\n1. All Items: ${menuItems.length} items`);
    
    // Test 2: Vegetarian only
    const vegItems = menuItems.filter(item => item.is_vegetarian);
    console.log(`2. Vegetarian Only: ${vegItems.length} items`);
    
    // Test 3: Non-vegetarian only
    const nonVegItems = menuItems.filter(item => !item.is_vegetarian);
    console.log(`3. Non-Vegetarian Only: ${nonVegItems.length} items`);
    
    // Test 4: Category filtering
    Object.keys(categories).forEach(category => {
      console.log(`4. ${category} Category: ${categories[category].length} items`);
    });

    // Test 5: Search functionality
    const searchTerms = ['chicken', 'rice', 'curry', 'biryani'];
    searchTerms.forEach(term => {
      const searchResults = menuItems.filter(item => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.description.toLowerCase().includes(term.toLowerCase())
      );
      if (searchResults.length > 0) {
        console.log(`5. Search "${term}": ${searchResults.length} items found`);
      }
    });

    console.log('\n✅ Menu Categories Test Complete!');
    console.log('\n📝 Summary:');
    console.log(`- Total Categories: ${Object.keys(categories).length}`);
    console.log(`- Total Menu Items: ${menuItems.length}`);
    console.log(`- Vegetarian Items: ${vegItems.length}`);
    console.log(`- Non-Vegetarian Items: ${nonVegItems.length}`);
    console.log(`- Categories: ${Object.keys(categories).join(', ')}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testMenuCategories();
