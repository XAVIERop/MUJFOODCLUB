import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicnNlIjoiYW5vbiIsImlhdCI6MTc1NjEzMjQ2OCwiZXhwIjoyMDcxNzA4NDY4fQ.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseOrderItems() {
  console.log('🔍 DIAGNOSING ORDER ITEMS ISSUE');
  console.log('');
  
  try {
    // Step 1: Check recent orders
    console.log('📋 Step 1: Checking recent orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, created_at, cafe_id')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError.message);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('ℹ️  No orders found');
      return;
    }
    
    console.log(`✅ Found ${orders.length} recent orders:`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.order_number} - ₹${order.total_amount} - Created: ${new Date(order.created_at).toLocaleString()}`);
    });
    
    // Step 2: Check order items for each order
    console.log('');
    console.log('📦 Step 2: Checking order items for each order...');
    
    for (const order of orders) {
      console.log(`\n🔍 Checking items for Order #${order.order_number} (ID: ${order.id})`);
      
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          menu_item_id,
          quantity,
          unit_price,
          total_price,
          special_instructions,
          menu_item:menu_items(name, description)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.log(`❌ Error fetching items: ${itemsError.message}`);
      } else if (items && items.length > 0) {
        console.log(`✅ Found ${items.length} items:`);
        items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.quantity}x ${item.menu_item?.name || 'Unknown Item'} - ₹${item.total_price}`);
        });
      } else {
        console.log(`⚠️  No items found for this order`);
        
        // Step 3: Check if this is a data issue
        console.log(`   🔍 Investigating why no items found...`);
        
        // Check if order_items table has any data
        const { data: allItems, error: allItemsError } = await supabase
          .from('order_items')
          .select('id, order_id')
          .limit(1);
        
        if (allItemsError) {
          console.log(`   ❌ Error checking order_items table: ${allItemsError.message}`);
        } else if (allItems && allItems.length > 0) {
          console.log(`   ℹ️  order_items table has data, but none for this order`);
        } else {
          console.log(`   🚨 order_items table is empty! This is the root cause.`);
        }
      }
    }
    
    // Step 4: Check database structure
    console.log('');
    console.log('🏗️  Step 3: Checking database structure...');
    
    // Check if order_items table exists and has data
    const { data: tableInfo, error: tableError } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true });
    
    if (tableError) {
      console.log(`❌ Error accessing order_items table: ${tableError.message}`);
    } else {
      console.log(`✅ order_items table is accessible`);
    }
    
    // Step 5: Check for any recent order items
    console.log('');
    console.log('📊 Step 4: Checking for any order items in the system...');
    
    const { data: recentItems, error: recentItemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        quantity,
        total_price,
        menu_item:menu_items(name)
      `)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (recentItemsError) {
      console.log(`❌ Error fetching recent items: ${recentItemsError.message}`);
    } else if (recentItems && recentItems.length > 0) {
      console.log(`✅ Found ${recentItems.length} recent order items:`);
      recentItems.forEach((item, index) => {
        console.log(`   ${index + 1}. Order ${item.order_id} - ${item.quantity}x ${item.menu_item?.name || 'Unknown'} - ₹${item.total_price}`);
      });
    } else {
      console.log(`🚨 No order items found in the entire system!`);
    }
    
    console.log('');
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('');
    console.log('💡 POSSIBLE CAUSES:');
    console.log('1. Order items are not being saved when orders are created');
    console.log('2. Database relationship issues between orders and order_items');
    console.log('3. RLS policies blocking access to order_items');
    console.log('4. Data corruption or missing records');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Check the checkout process to ensure order items are saved');
    console.log('2. Verify RLS policies on order_items table');
    console.log('3. Check if there are any database triggers or functions');
    console.log('4. Test creating a new order to see if items are saved');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the diagnosis
diagnoseOrderItems();
