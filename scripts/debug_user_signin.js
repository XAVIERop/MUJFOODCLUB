const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6d3hmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMjQ4NzQsImV4cCI6MjA1MDcwMDg3NH0.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserSignin() {
  const email = 'test@muj.manipal.edu';
  
  console.log('🔍 Debugging user sign-in for:', email);
  
  try {
    // 1. Check if user exists in auth.users
    console.log('\n1. Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth.users:', authError);
    } else {
      const user = authUsers.users.find(u => u.email === email);
      if (user) {
        console.log('✅ User found in auth.users:');
        console.log('   - ID:', user.id);
        console.log('   - Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
        console.log('   - Created:', user.created_at);
        console.log('   - Last sign in:', user.last_sign_in_at);
      } else {
        console.log('❌ User not found in auth.users');
      }
    }
    
    // 2. Check if profile exists
    console.log('\n2. Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
    
    if (profileError) {
      console.error('❌ Error accessing profiles:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profile found:');
      console.log('   - ID:', profiles[0].id);
      console.log('   - Full name:', profiles[0].full_name);
      console.log('   - User type:', profiles[0].user_type);
      console.log('   - Block:', profiles[0].block);
      console.log('   - Loyalty tier:', profiles[0].loyalty_tier);
    } else {
      console.log('❌ No profile found');
    }
    
    // 3. Test sign-in attempt
    console.log('\n3. Testing sign-in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'testpassword123' // You'll need to provide the actual password
    });
    
    if (signInError) {
      console.log('❌ Sign-in failed:', signInError.message);
    } else {
      console.log('✅ Sign-in successful');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugUserSignin();
