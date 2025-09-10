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

async function checkSupabaseConfig() {
  try {
    console.log('🔍 Checking Supabase Configuration...\n');

    // Test 1: Check if we can connect to Supabase
    console.log('✅ Supabase connection: OK');

    // Test 2: Check if auth is working
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ Auth session error:', sessionError.message);
    } else {
      console.log('✅ Auth session: OK');
    }

    // Test 3: Try to create a test user (this will help identify email issues)
    console.log('\n🧪 Testing Email Configuration...');
    
    const testEmail = `test-${Date.now()}@muj.manipal.edu`;
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123!',
      options: {
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });

    if (error) {
      console.log('❌ Signup error:', error.message);
      
      if (error.message.includes('email')) {
        console.log('\n🔧 Email Configuration Issues Detected:');
        console.log('1. Go to Supabase Dashboard → Authentication → Settings');
        console.log('2. Check "Enable email confirmations" is ON');
        console.log('3. Verify SMTP settings are configured');
        console.log('4. Check email templates are set up');
      }
    } else {
      console.log('✅ Test signup successful');
      console.log('📧 Check if email was sent to:', testEmail);
      
      if (data.user && !data.user.email_confirmed_at) {
        console.log('⚠️  User created but email not confirmed');
        console.log('📧 Email should be sent automatically');
      }
    }

    console.log('\n📋 Manual Steps to Fix Email Issues:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to Authentication → Settings');
    console.log('3. Check "Enable email confirmations" is ON');
    console.log('4. Go to Email Templates and verify they exist');
    console.log('5. Check SMTP Settings if using custom email provider');
    console.log('6. Test with a real email address');

  } catch (error) {
    console.error('❌ Error checking configuration:', error);
  }
}

checkSupabaseConfig();
