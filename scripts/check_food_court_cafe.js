import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://kblazvxfducwviyyiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6d3hmZHVjd3ZpeXlpd3ciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNDU4NzQ5MCwiZXhwIjoyMDQwMTYzNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFoodCourtCafe() {
  console.log('🔍 Checking Food Court cafe in database...\n');
  
  try {
    // 1. Get all cafes
    console.log('1. Getting all cafes:');
    const { data: allCafes, error: allCafesError } = await supabase
      .from('cafes')
      .select('id, name, type')
      .order('name');
    
    if (allCafesError) {
      console.error('Error fetching all cafes:', allCafesError);
      return;
    }
    
    console.log(`Found ${allCafes.length} cafes:`);
    allCafes.forEach((cafe, index) => {
      console.log(`  ${index + 1}. ID: ${cafe.id}, Name: "${cafe.name}", Type: ${cafe.type}`);
    });
    
    // 2. Search for Food Court specifically
    console.log('\n2. Searching for Food Court cafe:');
    const { data: foodCourtCafes, error: foodCourtError } = await supabase
      .from('cafes')
      .select('id, name, type')
      .ilike('name', '%food court%');
    
    if (foodCourtError) {
      console.error('Error searching for Food Court:', foodCourtError);
    } else {
      console.log(`Found ${foodCourtCafes.length} Food Court cafes:`);
      foodCourtCafes.forEach((cafe, index) => {
        console.log(`  ${index + 1}. ID: ${cafe.id}, Name: "${cafe.name}", Type: ${cafe.type}`);
      });
    }
    
    // 3. Check the specific cafe ID from the error
    console.log('\n3. Checking specific cafe ID: 3e5955ba-9b90-48ce-9d07-cc686678a10e');
    const { data: specificCafe, error: specificError } = await supabase
      .from('cafes')
      .select('*')
      .eq('id', '3e5955ba-9b90-48ce-9d07-cc686678a10e')
      .single();
    
    if (specificError) {
      console.error('Error fetching specific cafe:', specificError);
    } else {
      console.log('Specific cafe found:');
      console.log(JSON.stringify(specificCafe, null, 2));
    }
    
    // 4. Check if there are any orders for this cafe ID
    console.log('\n4. Checking orders for cafe ID: 3e5955ba-9b90-48ce-9d07-cc686678a10e');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, cafe_id, total_amount, created_at')
      .eq('cafe_id', '3e5955ba-9b90-48ce-9d07-cc686678a10e')
      .limit(5);
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    } else {
      console.log(`Found ${orders.length} orders for this cafe:`);
      orders.forEach((order, index) => {
        console.log(`  ${index + 1}. Order: ${order.order_number}, Amount: ₹${order.total_amount}, Date: ${order.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkFoodCourtCafe();
