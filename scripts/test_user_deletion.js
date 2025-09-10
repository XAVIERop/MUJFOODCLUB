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

async function testUserDeletion() {
  console.log('🧪 TESTING USER DELETION PROCESS');
  console.log('');
  
  try {
    // Step 1: List all users
    console.log('📋 Step 1: Listing all users...');
    const { data: users, error: listError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, created_at')
      .order('created_at', { ascending: false });
    
    if (listError) {
      console.log('❌ Error listing users:', listError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('ℹ️  No users found');
      return;
    }
    
    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.full_name}) - ${user.user_type}`);
    });
    
    // Step 2: Check if there are users with related data
    console.log('');
    console.log('📊 Step 2: Checking for users with related data...');
    
    for (const user of users.slice(0, 3)) { // Check first 3 users
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id);
      
      const { data: notifications } = await supabase
        .from('order_notifications')
        .select('id')
        .eq('user_id', user.id);
      
      const { data: cafeStaff } = await supabase
        .from('cafe_staff')
        .select('id')
        .eq('user_id', user.id);
      
      console.log(`   ${user.email}: ${orders?.length || 0} orders, ${notifications?.length || 0} notifications, ${cafeStaff?.length || 0} cafe staff`);
    }
    
    // Step 3: Show deletion options
    console.log('');
    console.log('🗑️  Step 3: User Deletion Options');
    console.log('');
    console.log('To delete a user, you have several options:');
    console.log('');
    console.log('OPTION 1: Manual deletion from Supabase Dashboard');
    console.log('1. Go to Supabase Dashboard → Authentication → Users');
    console.log('2. Find the user you want to delete');
    console.log('3. Click the three dots → Delete');
    console.log('');
    console.log('OPTION 2: Use the SQL script');
    console.log('1. Run scripts/fix_user_deletion.sql in Supabase SQL Editor');
    console.log('2. Use the safe_delete_user() function');
    console.log('');
    console.log('OPTION 3: Use the JavaScript tool');
    console.log('1. Modify this script to specify the user ID');
    console.log('2. Run: node scripts/delete_user_safely.js');
    console.log('');
    
    // Step 4: Test deletion with a specific user (uncomment and modify)
    console.log('🧪 Step 4: Test Deletion (Uncomment to use)');
    console.log('');
    console.log('// To delete a specific user, uncomment and modify this:');
    console.log('// const userToDelete = users.find(u => u.email === "test@example.com");');
    console.log('// if (userToDelete) {');
    console.log('//   console.log(`Deleting user: ${userToDelete.email}`);');
    console.log('//   // Add deletion logic here');
    console.log('// }');
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
  }
}

// Run the test
testUserDeletion();
