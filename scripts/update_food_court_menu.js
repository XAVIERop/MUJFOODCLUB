// Script to update FOOD COURT menu with new prices and items
// Run this script to update the database with new menu prices

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFoodCourtMenu() {
  try {
    console.log('Starting FOOD COURT menu update...');
    
    // Get the cafe ID
    const { data: cafe, error: cafeError } = await supabase
      .from('cafes')
      .select('id')
      .eq('name', 'FOOD COURT')
      .single();
    
    if (cafeError) {
      console.error('Error fetching cafe:', cafeError);
      return;
    }
    
    const cafeId = cafe.id;
    console.log('Found FOOD COURT cafe ID:', cafeId);
    
    // ========================================
    // UPDATE KRISPP MENU
    // ========================================
    console.log('Updating KRISPP menu...');
    
    // Update KRISPPY NON-VEG prices
    const krisppNonVegUpdates = [
      { name: 'Chicken Hot Wings (6 pcs)', price: 299 },
      { name: 'Chicken Strips (6 pcs)', price: 279 },
      { name: 'Garlic Chicken Fingers (6 pcs)', price: 199 },
      { name: 'Fish Fingers (6 pcs)', price: 299 }
    ];
    
    for (const item of krisppNonVegUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update KRISPPY VEG prices
    const krisppVegUpdates = [
      { name: 'Pizza Pockets (6 pcs)', price: 199 },
      { name: 'Veg Strips (6 pcs)', price: 149 },
      { name: 'Cheesy Strips (6 pcs)', price: 179 },
      { name: 'Onion Rings (6 pcs)', price: 159 },
      { name: 'Jalapeno Poppers (6 pcs)', price: 169 }
    ];
    
    for (const item of krisppVegUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update KRISPP SNACKS prices
    const krisppSnacksUpdates = [
      { name: 'Chilli Garlic Potato', price: 119 },
      { name: 'Chicken Popcorn', price: 129 },
      { name: 'Corn Cheese Nuggets', price: 139 },
      { name: 'Chicken Nuggets', price: 149 },
      { name: 'Masala French Fries', price: 109 }
    ];
    
    for (const item of krisppSnacksUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update KRISPP BURGER prices
    const krisppBurgerUpdates = [
      { name: 'Classic Veg Burger', price: 99 },
      { name: 'Classic Chicken Burger', price: 109 },
      { name: 'Krisppy Paneer Burger', price: 149 },
      { name: 'Krisppy Chicken Burger', price: 159 },
      { name: 'Krisppy Fish Burger', price: 169 }
    ];
    
    for (const item of krisppBurgerUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update KRISPP BEVERAGES prices
    const krisppBeverageUpdates = [
      { name: 'Masala Lemonade', category: 'KRISPP - Beverages', price: 89 },
      { name: 'Cola Lemonade', category: 'KRISPP - Beverages', price: 89 },
      { name: 'Virgin Mojito', category: 'KRISPP - Beverages', price: 89 },
      { name: 'Cucumber Mojito', category: 'KRISPP - Beverages', price: 89 },
      { name: 'Watermelon Mojito', category: 'KRISPP - Beverages', price: 89 },
      { name: 'Green Apple Mojito', category: 'KRISPP - Beverages', price: 89 },
      { name: 'Blue Magic Mojito', category: 'KRISPP - Beverages', price: 89 }
    ];
    
    for (const item of krisppBeverageUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name)
        .eq('category', item.category);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Add KRISPP Make It A Meal options
    const { error: comboError } = await supabase
      .from('menu_items')
      .insert([
        {
          cafe_id: cafeId,
          name: 'Veg Upgrade - Chilli Garlic Potato + Any Beverage',
          description: 'Veg upgrade combo with chilli garlic potato and any beverage',
          price: 159,
          category: 'KRISPP - Combos',
          is_available: true
        },
        {
          cafe_id: cafeId,
          name: 'Non-Veg Upgrade - Chicken Popcorn + Any Beverage',
          description: 'Non-veg upgrade combo with chicken popcorn and any beverage',
          price: 169,
          category: 'KRISPP - Combos',
          is_available: true
        }
      ]);
    
    if (comboError) {
      console.error('Error adding combo items:', comboError);
    } else {
      console.log('Added KRISPP combo items');
    }
    
    // ========================================
    // UPDATE MOMO STREET MENU
    // ========================================
    console.log('Updating MOMO STREET menu...');
    
    // Update STEAMED MOMOS prices
    const steamedMomosUpdates = [
      { name: 'Veggie Momos (6 pcs)', price: 99 },
      { name: 'Paneer Momos (6 pcs)', price: 109 },
      { name: 'Corn & Cheese Momos (6 pcs)', price: 109 },
      { name: 'Chicken Momos (6 pcs)', price: 109 },
      { name: 'Chicken & Cheese Momos (6 pcs)', price: 119 },
      { name: 'Spicy Chicken Momos (6 pcs)', price: 119 }
    ];
    
    for (const item of steamedMomosUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update FRIED MOMOS prices
    const friedMomosUpdates = [
      { name: 'Veggie Fried Momos (6 pcs)', price: 119 },
      { name: 'Paneer Fried Momos (6 pcs)', price: 129 },
      { name: 'Corn & Cheese Fried Momos (6 pcs)', price: 129 },
      { name: 'Chicken Fried Momos (6 pcs)', price: 129 },
      { name: 'Chicken & Cheese Fried Momos (6 pcs)', price: 139 },
      { name: 'Spicy Chicken Fried Momos (6 pcs)', price: 139 }
    ];
    
    for (const item of friedMomosUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update KURKURE MOMOS prices
    const kurkureMomosUpdates = [
      { name: 'Veggie Kurkure Momos (6 pcs)', price: 129 },
      { name: 'Paneer Kurkure Momos (6 pcs)', price: 139 },
      { name: 'Corn & Cheese Kurkure Momos (6 pcs)', price: 139 },
      { name: 'Chicken Kurkure Momos (6 pcs)', price: 139 },
      { name: 'Chicken & Cheese Kurkure Momos (6 pcs)', price: 149 },
      { name: 'Spicy Chicken Kurkure Momos (6 pcs)', price: 149 }
    ];
    
    for (const item of kurkureMomosUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update GRAVY MOMOS prices
    const gravyMomosUpdates = [
      { name: 'Veggie Gravy Momos (6 pcs)', price: 139 },
      { name: 'Paneer Gravy Momos (6 pcs)', price: 149 },
      { name: 'Corn & Cheese Gravy Momos (6 pcs)', price: 149 },
      { name: 'Chicken Gravy Momos (6 pcs)', price: 149 },
      { name: 'Chicken & Cheese Gravy Momos (6 pcs)', price: 159 },
      { name: 'Spicy Chicken Gravy Momos (6 pcs)', price: 159 }
    ];
    
    for (const item of gravyMomosUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update MOMO STREET STARTERS prices
    const momoStartersUpdates = [
      { name: 'Dosa Spring Roll (6 pcs)', price: 149 },
      { name: 'Veggie Spring Roll (6 pcs)', price: 149 },
      { name: 'Chicken Spring Roll (6 pcs)', price: 189 },
      { name: 'Corn & Cheese Nuggets (6 pcs)', price: 139 },
      { name: 'Chicken Nuggets (6 pcs)', price: 149 }
    ];
    
    for (const item of momoStartersUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update MOMO STREET BEVERAGES prices
    const momoBeverageUpdates = [
      { name: 'Masala Lemonade', category: 'Momo Street - Beverages', price: 89 },
      { name: 'Cola Lemonade', category: 'Momo Street - Beverages', price: 89 },
      { name: 'Virgin Mojito', category: 'Momo Street - Beverages', price: 89 },
      { name: 'Cucumber Mojito', category: 'Momo Street - Beverages', price: 89 },
      { name: 'Watermelon Mojito', category: 'Momo Street - Beverages', price: 89 },
      { name: 'Green Apple Mojito', category: 'Momo Street - Beverages', price: 89 },
      { name: 'Blue Magic Mojito', category: 'Momo Street - Beverages', price: 89 }
    ];
    
    for (const item of momoBeverageUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name)
        .eq('category', item.category);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // ========================================
    // UPDATE GOBBLERS MENU
    // ========================================
    console.log('Updating GOBBLERS menu...');
    
    // Update GOBBLERS BOWLS prices
    const gobblersBowlsUpdates = [
      { name: 'Khichdi Bowl', price: 169 },
      { name: 'Rajma - Rice Bowl', price: 199 },
      { name: 'Dilli Chola - Rice Bowl', price: 199 },
      { name: 'Dal Makhni - Rice Bowl', price: 199 },
      { name: 'Makhni Rice Bowl (Paneer)', price: 219 },
      { name: 'Makhni Rice Bowl (Chicken)', price: 229 },
      { name: 'Lahori Rice Bowl (Paneer)', price: 219 },
      { name: 'Lahori Rice Bowl (Chicken)', price: 229 },
      { name: 'Chinese Rice Bowl (Paneer)', price: 219 },
      { name: 'Chinese Rice Bowl (Chicken)', price: 229 },
      { name: 'Biryani Bowl (Paneer)', price: 239 },
      { name: 'Biryani Bowl (Chicken)', price: 249 },
      { name: 'Red Sauce Pasta Bowl', price: 179 },
      { name: 'White Sauce Pasta Bowl', price: 179 },
      { name: 'Mix Sauce Pasta Bowl', price: 189 },
      { name: 'Add On - Chicken', price: 69 }
    ];
    
    for (const item of gobblersBowlsUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update GOBBLERS STARTERS prices
    const gobblersStartersUpdates = [
      { name: 'Hara - Bhara Kebab (6 pcs)', price: 149 },
      { name: 'Dahi Ke Kebab (6 pcs)', price: 159 },
      { name: 'Corn Cheese Kebab (6 pcs)', price: 189 },
      { name: 'Chicken Cheese Kebab (6 pcs)', price: 179 }
    ];
    
    for (const item of gobblersStartersUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update GOBBLERS WRAPS prices
    const gobblersWrapsUpdates = [
      { name: 'Veg Wrap', price: 99 },
      { name: 'Paneer Wrap', price: 119 },
      { name: 'Chicken Wrap', price: 119 },
      { name: 'Makhni Wrap (Paneer)', price: 139 },
      { name: 'Makhni Wrap (Chicken)', price: 139 },
      { name: 'Lahori Wrap (Paneer)', price: 139 },
      { name: 'Lahori Wrap (Chicken)', price: 139 },
      { name: 'Schezwan Wrap (Paneer)', price: 139 },
      { name: 'Schezwan Wrap (Chicken)', price: 139 }
    ];
    
    for (const item of gobblersWrapsUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    // Update GOBBLERS BEVERAGES prices
    const gobblersBeverageUpdates = [
      { name: 'Masala Lemonade', category: 'GOBBLERS - Beverages', price: 89 },
      { name: 'Cola Lemonade', category: 'GOBBLERS - Beverages', price: 89 },
      { name: 'Virgin Mojito', category: 'GOBBLERS - Beverages', price: 89 },
      { name: 'Cucumber Mojito', category: 'GOBBLERS - Beverages', price: 89 },
      { name: 'Watermelon Mojito', category: 'GOBBLERS - Beverages', price: 89 },
      { name: 'Green Apple Mojito', category: 'GOBBLERS - Beverages', price: 89 },
      { name: 'Blue Magic Mojito', category: 'GOBBLERS - Beverages', price: 89 }
    ];
    
    for (const item of gobblersBeverageUpdates) {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: item.price })
        .eq('cafe_id', cafeId)
        .eq('name', item.name)
        .eq('category', item.category);
      
      if (error) {
        console.error(`Error updating ${item.name}:`, error);
      } else {
        console.log(`Updated ${item.name} to ₹${item.price}`);
      }
    }
    
    console.log('✅ FOOD COURT menu update completed successfully!');
    
  } catch (error) {
    console.error('Error updating menu:', error);
  }
}

// Run the update
updateFoodCourtMenu();
