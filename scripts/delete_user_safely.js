import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_URL environment variable');
  process.exit(1);
}
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicnNlIjoiYW5vbiIsImlhdCI6MTc1NjEzMjQ2OCwiZXhwIjoyMDcxNzA4NDY4fQ.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUserSafely(userId) {
  console.log(`🗑️  Attempting to delete user: ${userId}`);
  
  try {
    // Step 1: Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      console.log('❌ User profile not found');
      return { success: false, error: 'User profile not found' };
    }
    
    console.log(`✅ Found user: ${profile.email} (${profile.full_name})`);
    
    // Step 2: Check related data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId);
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('order_notifications')
      .select('id')
      .eq('user_id', userId);
    
    const { data: cafeStaff, error: cafeStaffError } = await supabase
      .from('cafe_staff')
      .select('id')
      .eq('user_id', userId);
    
    console.log(`📊 Related data found:`);
    console.log(`   - Orders: ${orders?.length || 0}`);
    console.log(`   - Notifications: ${notifications?.length || 0}`);
    console.log(`   - Cafe Staff: ${cafeStaff?.length || 0}`);
    
    // Step 3: Delete related data first
    if (notifications && notifications.length > 0) {
      const { error: deleteNotificationsError } = await supabase
        .from('order_notifications')
        .delete()
        .eq('user_id', userId);
      
      if (deleteNotificationsError) {
        console.log('❌ Failed to delete notifications:', deleteNotificationsError.message);
      } else {
        console.log('✅ Deleted notifications');
      }
    }
    
    if (orders && orders.length > 0) {
      const { error: deleteOrdersError } = await supabase
        .from('orders')
        .delete()
        .eq('user_id', userId);
      
      if (deleteOrdersError) {
        console.log('❌ Failed to delete orders:', deleteOrdersError.message);
      } else {
        console.log('✅ Deleted orders');
      }
    }
    
    if (cafeStaff && cafeStaff.length > 0) {
      const { error: deleteCafeStaffError } = await supabase
        .from('cafe_staff')
        .delete()
        .eq('user_id', userId);
      
      if (deleteCafeStaffError) {
        console.log('❌ Failed to delete cafe staff records:', deleteCafeStaffError.message);
      } else {
        console.log('✅ Deleted cafe staff records');
      }
    }
    
    // Step 4: Delete profile
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (deleteProfileError) {
      console.log('❌ Failed to delete profile:', deleteProfileError.message);
      return { success: false, error: deleteProfileError.message };
    }
    
    console.log('✅ Deleted user profile');
    
    // Step 5: Delete auth user (this requires admin privileges)
    try {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteAuthError) {
        console.log('⚠️  Could not delete auth user (requires admin privileges):', deleteAuthError.message);
        console.log('💡 The user profile has been deleted, but the auth user remains');
        console.log('💡 You may need to delete the auth user manually from Supabase Dashboard');
      } else {
        console.log('✅ Deleted auth user');
      }
    } catch (authError) {
      console.log('⚠️  Auth user deletion requires admin privileges');
      console.log('💡 Delete manually from Supabase Dashboard → Authentication → Users');
    }
    
    console.log('🎉 User deletion completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.log('❌ Error during user deletion:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to list all users
async function listUsers() {
  console.log('👥 Listing all users...');
  
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    console.log(`📋 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.full_name}) - ${user.user_type} - Created: ${new Date(user.created_at).toLocaleDateString()}`);
    });
    
    return users;
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Function to find user by email
async function findUserByEmail(email) {
  console.log(`🔍 Searching for user with email: ${email}`);
  
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      console.log('❌ User not found');
      return null;
    }
    
    console.log(`✅ Found user: ${user.full_name} (ID: ${user.id})`);
    return user;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🚨 SUPABASE USER DELETION TOOL');
  console.log('');
  
  // List all users first
  const users = await listUsers();
  
  if (!users || users.length === 0) {
    console.log('No users found');
    return;
  }
  
  console.log('');
  console.log('💡 To delete a user, use one of these methods:');
  console.log('');
  console.log('1. Delete by User ID:');
  console.log('   await deleteUserSafely("user-uuid-here");');
  console.log('');
  console.log('2. Find user by email:');
  console.log('   const user = await findUserByEmail("user@example.com");');
  console.log('   if (user) await deleteUserSafely(user.id);');
  console.log('');
  console.log('3. Delete specific user (replace with actual UUID):');
  console.log('   await deleteUserSafely("' + (users[0]?.id || 'example-uuid') + '");');
}

// Export functions for use in other scripts
export { deleteUserSafely, listUsers, findUserByEmail };

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
