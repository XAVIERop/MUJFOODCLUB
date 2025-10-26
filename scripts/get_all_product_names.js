// scripts/get_all_product_names.js
// Get all product names from the database for ImageKit renaming

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function getAllProductNames() {
  try {
    console.log('🔍 Fetching ALL product names from database...\n');
    
    // Get all products from 24 Seven Mart
    const { data: products, error } = await supabase
      .from('menu_items')
      .select('name, category')
      .eq('cafe_id', (await supabase.from('cafes').select('id').ilike('name', '%24 seven mart%').single()).data?.id)
      .order('name');
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    console.log(`✅ Found ${products.length} products total\n`);
    
    // Group by category
    const groupedProducts = {};
    products.forEach(product => {
      if (!groupedProducts[product.category]) {
        groupedProducts[product.category] = [];
      }
      groupedProducts[product.category].push(product.name);
    });
    
    console.log('📋 COMPLETE PRODUCT LIST FOR IMAGEKIT RENAMING:\n');
    console.log('='.repeat(60));
    
    Object.entries(groupedProducts).forEach(([category, names]) => {
      console.log(`\n📁 ${category} (${names.length} items):`);
      console.log('-'.repeat(40));
      names.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📝 RENAMING INSTRUCTIONS:');
    console.log('1. Go to ImageKit dashboard');
    console.log('2. Navigate to Grocery/Products/ folder');
    console.log('3. Rename your images to match these exact names');
    console.log('4. Use .jpg, .jpeg, .png, or .webp extensions');
    console.log('5. Example: "CRAX NATKHAT CLASSIC.jpg"');
    
    console.log('\n🎯 QUICK COPY-PASTE LIST:');
    console.log('='.repeat(60));
    products.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getAllProductNames();
