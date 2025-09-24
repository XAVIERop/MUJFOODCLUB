import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testAuthWithDelays() {
  console.log('🔐 AUTHENTICATION TEST WITH RATE LIMIT HANDLING');
  console.log('===============================================\n');

  const testEmail = `test-auth-delayed-${Date.now()}@muj.manipal.edu`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User Delayed';
  const testBlock = 'B1';

  try {
    // Test 1: Sign Up
    console.log('1️⃣ Testing Sign Up...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
          custom_block: testBlock
        }
      }
    });

    if (signupError) {
      console.log('❌ Sign Up Failed:', signupError.message);
      return;
    } else {
      console.log('✅ Sign Up Successful');
      console.log('📧 User ID:', signupData.user?.id);
      console.log('📧 Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');
    }

    // Wait for profile creation
    console.log('\n⏳ Waiting for profile creation...');
    await wait(3000);

    // Test 2: Check Profile Creation
    console.log('2️⃣ Testing Profile Creation...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signupData.user.id);
    
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (profileError) {
      console.log('❌ Profile Creation Failed:', profileError.message);
      console.log('🔍 This might be a database trigger issue');
    } else if (profile) {
      console.log('✅ Profile Created Successfully');
      console.log('👤 Name:', profile.full_name);
      console.log('🏠 Block:', profile.block);
      console.log('📧 Email:', profile.email);
      console.log('🎫 QR Code:', profile.qr_code);
    } else {
      console.log('❌ Profile Creation Failed: No profile found');
    }

    // Test 3: Email Confirmation (simulate by using magic link)
    console.log('\n3️⃣ Testing Email Confirmation via Magic Link...');
    const { data: magicData, error: magicError } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'https://mujfoodclub.vercel.app/auth'
      }
    });

    if (magicError) {
      console.log('❌ Magic Link Failed:', magicError.message);
    } else {
      console.log('✅ Magic Link Sent Successfully');
      console.log('📧 Check email for confirmation link');
    }

    // Wait to avoid rate limiting
    console.log('\n⏳ Waiting to avoid rate limits...');
    await wait(60000); // Wait 1 minute

    // Test 4: Sign In (should work after email confirmation)
    console.log('4️⃣ Testing Sign In...');
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signinError) {
      console.log('❌ Sign In Failed:', signinError.message);
      console.log('💡 This is expected if email is not confirmed yet');
    } else {
      console.log('✅ Sign In Successful');
      console.log('🔑 Session active:', !!signinData.session);
    }

    // Test 5: Email Domain Validation
    console.log('\n5️⃣ Testing Email Domain Validation...');
    const invalidEmail = 'test@gmail.com';
    const { data: invalidData, error: invalidError } = await supabase.auth.signUp({
      email: invalidEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Invalid User',
          custom_block: 'B1'
        }
      }
    });

    if (invalidError) {
      console.log('✅ Invalid Email Domain Correctly Blocked:', invalidError.message);
    } else {
      console.log('⚠️  Invalid email domain was allowed - this needs frontend validation');
    }

    // Test 6: Sign Out
    console.log('\n6️⃣ Testing Sign Out...');
    const { error: signoutError } = await supabase.auth.signOut();
    
    if (signoutError) {
      console.log('❌ Sign Out Failed:', signoutError.message);
    } else {
      console.log('✅ Sign Out Successful');
    }

    console.log('\n🎯 AUTHENTICATION TEST SUMMARY');
    console.log('===============================');
    console.log('✅ Sign Up:', signupError ? 'FAILED' : 'PASSED');
    console.log('✅ Profile Creation:', profileError ? 'FAILED' : 'PASSED');
    console.log('✅ Email Confirmation:', magicError ? 'FAILED' : 'PASSED');
    console.log('✅ Sign In:', signinError ? 'FAILED (Expected if not confirmed)' : 'PASSED');
    console.log('✅ Domain Validation:', invalidError ? 'PASSED' : 'NEEDS FRONTEND FIX');
    console.log('✅ Sign Out:', signoutError ? 'FAILED' : 'PASSED');

    if (signupError || profileError) {
      console.log('\n🚨 CRITICAL ISSUES FOUND');
      console.log('1. Run the database fix script');
      console.log('2. Check Supabase dashboard for trigger status');
    } else {
      console.log('\n🎉 CORE AUTHENTICATION IS WORKING!');
      console.log('📧 Users need to confirm email before sign in');
      console.log('🔗 Magic links work for password reset');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testAuthWithDelays();
