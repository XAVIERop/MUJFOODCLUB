import { createClient } from '@supabase/supabase-js';

// Supabase configuration
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

async function checkUserAuth() {
  try {
    console.log('Checking authentication status...\n');

    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }

    if (session) {
      console.log('✅ User is authenticated!');
      console.log(`User ID: ${session.user.id}`);
      console.log(`Email: ${session.user.email}`);
      console.log(`Email confirmed: ${session.user.email_confirmed_at ? 'Yes' : 'No'}`);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile not found or error:', profileError.message);
      } else {
        console.log('✅ Profile found:');
        console.log(`Full Name: ${profile.full_name}`);
        console.log(`User Type: ${profile.user_type}`);
        console.log(`Block: ${profile.block}`);
      }
    } else {
      console.log('❌ No active session found');
      console.log('User needs to sign in through the proper authentication flow');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

async function checkSpecificUser(email) {
  try {
    console.log(`\nChecking user: ${email}\n`);

    // Check if user exists in auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error accessing users:', usersError);
      return;
    }

    const user = users.users.find(u => u.email === email);
    
    if (user) {
      console.log('✅ User found in auth.users:');
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`Created: ${user.created_at}`);
      
      if (!user.email_confirmed_at) {
        console.log('⚠️  Email not confirmed - user needs to verify email');
      }
    } else {
      console.log('❌ User not found in auth.users');
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.log('❌ Profile not found:', profileError.message);
    } else {
      console.log('✅ Profile found:');
      console.log(`ID: ${profile.id}`);
      console.log(`Full Name: ${profile.full_name}`);
      console.log(`User Type: ${profile.user_type}`);
      console.log(`Block: ${profile.block}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the checks
checkUserAuth();
checkSpecificUser('naman.2430030314@muj.manipal.edu');
