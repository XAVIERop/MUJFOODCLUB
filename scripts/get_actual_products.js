// scripts/get_actual_products.js
// Get actual product names from the database to create proper mapping

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function getActualProducts() {
  try {
    console.log('🔍 Fetching actual products from database...\n');
    
    // Get products from 24 Seven Mart
    const { data: products, error } = await supabase
      .from('menu_items')
      .select('name, category')
      .eq('cafe_id', (await supabase.from('cafes').select('id').ilike('name', '%24 seven mart%').single()).data?.id)
      .limit(50);
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    console.log(`✅ Found ${products.length} products:\n`);
    
    // Group by category
    const groupedProducts = {};
    products.forEach(product => {
      if (!groupedProducts[product.category]) {
        groupedProducts[product.category] = [];
      }
      groupedProducts[product.category].push(product.name);
    });
    
    Object.entries(groupedProducts).forEach(([category, names]) => {
      console.log(`📁 ${category}:`);
      names.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
      });
      console.log('');
    });
    
    // Show first 20 products for testing
    console.log('🧪 First 20 products for testing:');
    products.slice(0, 20).forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getActualProducts();
