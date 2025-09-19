// Create authentication accounts for each cafe owner
// This script creates actual auth.users entries for each cafe

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://your-project-ref.supabase.co'; // Replace with your actual URL
const supabaseServiceKey = 'your-service-role-key'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cafe owner credentials
const cafeOwners = [
  { name: 'CHATKARA', email: 'chatkara.owner@mujfoodclub.in', password: 'Chatkara@2024' },
  { name: 'China Town', email: 'chinatown.owner@mujfoodclub.in', password: 'Chinatown@2024' },
  { name: 'COOK HOUSE', email: 'cookhouse.owner@mujfoodclub.in', password: 'Cookhouse@2024' },
  { name: 'Dev Sweets & Snacks', email: 'devsweets.owner@mujfoodclub.in', password: 'Devsweets@2024' },
  { name: 'Dialog', email: 'dialog.owner@mujfoodclub.in', password: 'Dialog@2024' },
  { name: 'FOOD COURT', email: 'foodcourt.owner@mujfoodclub.in', password: 'Foodcourt@2024' },
  { name: 'Havmor', email: 'havmor.owner@mujfoodclub.in', password: 'Havmor@2024' },
  { name: 'ITALIAN OVEN', email: 'italianoven.owner@mujfoodclub.in', password: 'Italianoven@2024' },
  { name: 'Let\'s Go Live', email: 'letsgolive.owner@mujfoodclub.in', password: 'Letsgolive@2024' },
  { name: 'Mini Meals', email: 'minimeals.owner@mujfoodclub.in', password: 'Minimeals@2024' },
  { name: 'Munch Box', email: 'munchbox.owner@mujfoodclub.in', password: 'Munchbox@2024' },
  { name: 'Punjabi Tadka', email: 'punjabitadka.owner@mujfoodclub.in', password: 'Punjabitadka@2024' },
  { name: 'Soya Chaap Corner', email: 'soyachaap.owner@mujfoodclub.in', password: 'Soyachaap@2024' },
  { name: 'STARDOM Café & Lounge', email: 'stardom.owner@mujfoodclub.in', password: 'Stardom@2024' },
  { name: 'Taste of India', email: 'tasteofindia.owner@mujfoodclub.in', password: 'Tasteofindia@2024' },
  { name: 'Tea Tradition', email: 'teatradition.owner@mujfoodclub.in', password: 'Teatradition@2024' },
  { name: 'The Crazy Chef', email: 'crazychef.owner@mujfoodclub.in', password: 'Crazychef@2024' },
  { name: 'The Kitchen & Curry', email: 'kitchencurry.owner@mujfoodclub.in', password: 'Kitchencurry@2024' },
  { name: 'Waffle Fit N Fresh', email: 'wafflefit.owner@mujfoodclub.in', password: 'Wafflefit@2024' },
  { name: 'ZAIKA', email: 'zaika.owner@mujfoodclub.in', password: 'Zaika@2024' },
  { name: 'ZERO DEGREE CAFE', email: 'zerodegree.owner@mujfoodclub.in', password: 'Zerodegree@2024' }
];

async function createCafeAuthAccounts() {
  console.log('🚀 Starting cafe owner account creation...');
  
  const results = [];
  
  for (const owner of cafeOwners) {
    try {
      console.log(`Creating account for ${owner.name}...`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: owner.email,
        password: owner.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: `${owner.name} Owner`,
          cafe_name: owner.name
        }
      });
      
      if (authError) {
        console.error(`❌ Failed to create auth user for ${owner.name}:`, authError.message);
        results.push({ name: owner.name, status: 'failed', error: authError.message });
        continue;
      }
      
      console.log(`✅ Created auth user for ${owner.name}: ${authData.user.id}`);
      
      // Update the profile with the correct user ID
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ id: authData.user.id })
        .eq('email', owner.email);
      
      if (profileError) {
        console.error(`❌ Failed to update profile for ${owner.name}:`, profileError.message);
        results.push({ name: owner.name, status: 'partial', error: profileError.message });
      } else {
        console.log(`✅ Updated profile for ${owner.name}`);
        results.push({ name: owner.name, status: 'success' });
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${owner.name}:`, error.message);
      results.push({ name: owner.name, status: 'failed', error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const partial = results.filter(r => r.status === 'partial').length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`⚠️  Partial: ${partial}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed accounts:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n🔑 Login Credentials:');
  results.forEach(r => {
    const owner = cafeOwners.find(o => o.name === r.name);
    if (owner) {
      console.log(`${owner.name}: ${owner.email} / ${owner.password}`);
    }
  });
}

// Run the script
createCafeAuthAccounts().catch(console.error);
