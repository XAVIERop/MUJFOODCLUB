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

async function checkKeemaPaoItems() {
  console.log('🔍 Checking Keema Pao items in database...\n');
  
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

    // Get all Keema Pao related items
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, category, is_available')
      .eq('cafe_id', cafe.id)
      .ilike('name', '%keema%pao%')
      .order('name');

    if (menuError) {
      console.error('❌ Error fetching menu items:', menuError);
      return;
    }

    console.log(`\n📋 Found ${menuItems.length} Keema Pao items:`);
    
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ₹${item.price} (${item.category})`);
    });

    if (menuItems.length === 0) {
      console.log('\n❌ No Keema Pao items found in database');
      console.log('💡 The frontend grouping will only work if there are separate items for each variant');
    } else if (menuItems.length === 1) {
      console.log('\n⚠️ Only one Keema Pao item found');
      console.log('💡 Need separate items: "Keema Pao (Chicken)" and "Keema Pao (Mutton)"');
    } else {
      console.log('\n✅ Multiple Keema Pao items found - frontend grouping should work');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkKeemaPaoItems();
