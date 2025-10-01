// Script to add grocery shop and products to preview database
import { createClient } from '@supabase/supabase-js';

const PREVIEW_SUPABASE_URL = 'https://dhjcxipqcfbqleabtcwk.supabase.co';
const PREVIEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoamN4aXBxY2ZicWxlYWJ0Y3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjM1MTEsImV4cCI6MjA3NDg5OTUxMX0.yp5R2ldlN-yg8yzI_5eJH1pqx7wbtbAIGfmz7cJcb0o';

const supabase = createClient(PREVIEW_SUPABASE_URL, PREVIEW_SUPABASE_ANON_KEY);

async function addGroceryData() {
  console.log('🛒 Adding grocery shop and products to preview database...');

  try {
    // 1. Add grocery shop
    console.log('📦 Adding grocery shop...');
    const { data: groceryShop, error: shopError } = await supabase
      .from('cafes')
      .insert({
        name: 'Campus Grocery Store',
        type: 'grocery',
        location: 'B1 Ground Floor',
        phone: '+91-9876543210',
        hours: '8:00 AM - 11:00 PM',
        description: 'Your one-stop shop for daily essentials',
        accepting_orders: true,
        is_active: true,
        priority: 999,
        image_url: '/grocery-store.jpg'
      })
      .select()
      .single();

    if (shopError) {
      console.error('❌ Error adding grocery shop:', shopError);
      return;
    }

    console.log('✅ Grocery shop added:', groceryShop.name);

    // 2. Add grocery products
    console.log('🛍️ Adding grocery products...');
    
    const groceryProducts = [
      // Snacks
      {
        cafe_id: groceryShop.id,
        name: 'Maggi 2-Minute Noodles',
        category: 'Snacks',
        subcategory: 'Instant Food',
        price: 12,
        description: '2-minute masala noodles',
        is_available: true,
        image_url: '/maggi.jpg',
        brand: 'Maggi',
        unit: '70g'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Lays Classic Salted',
        category: 'Snacks',
        subcategory: 'Chips',
        price: 10,
        description: 'Classic salted potato chips',
        is_available: true,
        image_url: '/lays.jpg',
        brand: 'Lays',
        unit: '25g'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Parle-G Biscuits',
        category: 'Snacks',
        subcategory: 'Biscuits',
        price: 5,
        description: 'Glucose biscuits',
        is_available: true,
        image_url: '/parle-g.jpg',
        brand: 'Parle',
        unit: '100g'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Kurkure Masala Munch',
        category: 'Snacks',
        subcategory: 'Namkeen',
        price: 15,
        description: 'Spicy corn snacks',
        is_available: true,
        image_url: '/kurkure.jpg',
        brand: 'Kurkure',
        unit: '30g'
      },

      // Fresh/Dairy
      {
        cafe_id: groceryShop.id,
        name: 'Amul Butter',
        category: 'Fresh',
        subcategory: 'Dairy',
        price: 55,
        description: 'Fresh salted butter',
        is_available: true,
        image_url: '/amul-butter.jpg',
        brand: 'Amul',
        unit: '100g'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Amul Milk',
        category: 'Fresh',
        subcategory: 'Dairy',
        price: 25,
        description: 'Fresh cow milk',
        is_available: true,
        image_url: '/amul-milk.jpg',
        brand: 'Amul',
        unit: '500ml'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Britannia Bread',
        category: 'Fresh',
        subcategory: 'Bakery',
        price: 30,
        description: 'Fresh white bread',
        is_available: true,
        image_url: '/britannia-bread.jpg',
        brand: 'Britannia',
        unit: '400g'
      },

      // Beauty & Personal Care
      {
        cafe_id: groceryShop.id,
        name: 'Dove Soap',
        category: 'Beauty',
        subcategory: 'Bath & Body',
        price: 45,
        description: 'Moisturizing soap bar',
        is_available: true,
        image_url: '/dove-soap.jpg',
        brand: 'Dove',
        unit: '75g'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Head & Shoulders Shampoo',
        category: 'Beauty',
        subcategory: 'Hair Care',
        price: 120,
        description: 'Anti-dandruff shampoo',
        is_available: true,
        image_url: '/head-shoulders.jpg',
        brand: 'Head & Shoulders',
        unit: '200ml'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Colgate Toothpaste',
        category: 'Beauty',
        subcategory: 'Oral Care',
        price: 35,
        description: 'Cavity protection toothpaste',
        is_available: true,
        image_url: '/colgate.jpg',
        brand: 'Colgate',
        unit: '100g'
      },

      // Beverages
      {
        cafe_id: groceryShop.id,
        name: 'Coca Cola',
        category: 'Beverages',
        subcategory: 'Soft Drinks',
        price: 20,
        description: 'Classic cola drink',
        is_available: true,
        image_url: '/coca-cola.jpg',
        brand: 'Coca Cola',
        unit: '250ml'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Red Bull Energy Drink',
        category: 'Beverages',
        subcategory: 'Energy Drinks',
        price: 95,
        description: 'Energy drink',
        is_available: true,
        image_url: '/red-bull.jpg',
        brand: 'Red Bull',
        unit: '250ml'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Tata Tea Gold',
        category: 'Beverages',
        subcategory: 'Tea & Coffee',
        price: 45,
        description: 'Premium tea leaves',
        is_available: true,
        image_url: '/tata-tea.jpg',
        brand: 'Tata',
        unit: '100g'
      },

      // Household
      {
        cafe_id: groceryShop.id,
        name: 'Tide Detergent',
        category: 'Household',
        subcategory: 'Cleaning',
        price: 120,
        description: 'Laundry detergent powder',
        is_available: true,
        image_url: '/tide.jpg',
        brand: 'Tide',
        unit: '1kg'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Vim Dishwash Gel',
        category: 'Household',
        subcategory: 'Cleaning',
        price: 35,
        description: 'Dishwashing liquid',
        is_available: true,
        image_url: '/vim.jpg',
        brand: 'Vim',
        unit: '250ml'
      },
      {
        cafe_id: groceryShop.id,
        name: 'Good Knight Mosquito Repellent',
        category: 'Household',
        subcategory: 'Pest Control',
        price: 25,
        description: 'Mosquito repellent liquid',
        is_available: true,
        image_url: '/good-knight.jpg',
        brand: 'Good Knight',
        unit: '45ml'
      }
    ];

    const { data: products, error: productsError } = await supabase
      .from('menu_items')
      .insert(groceryProducts)
      .select();

    if (productsError) {
      console.error('❌ Error adding products:', productsError);
      return;
    }

    console.log(`✅ Added ${products.length} grocery products`);

    // 3. Summary
    console.log('\n🎉 Grocery data added successfully!');
    console.log(`📦 Grocery Shop: ${groceryShop.name}`);
    console.log(`🛍️ Products: ${products.length} items`);
    console.log('\n📱 You can now test the grocery section at /grocery');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addGroceryData();
