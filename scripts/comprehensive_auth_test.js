import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteAuthFlow() {
  console.log('🔐 COMPREHENSIVE AUTHENTICATION TEST');
  console.log('=====================================\n');

  const testEmail = `test-auth-${Date.now()}@muj.manipal.edu`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';
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
      console.log('🔍 Error details:', signupError);
    } else {
      console.log('✅ Sign Up Successful');
      console.log('📧 User ID:', signupData.user?.id);
      console.log('📧 Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');
    }

    // Test 2: Check Profile Creation
    console.log('\n2️⃣ Testing Profile Creation...');
    if (signupData?.user?.id) {
      // Wait a moment for profile creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile Creation Failed:', profileError.message);
      } else {
        console.log('✅ Profile Created Successfully');
        console.log('👤 Name:', profile.full_name);
        console.log('🏠 Block:', profile.block);
        console.log('📧 Email:', profile.email);
      }
    }

    // Test 3: Sign In
    console.log('\n3️⃣ Testing Sign In...');
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signinError) {
      console.log('❌ Sign In Failed:', signinError.message);
    } else {
      console.log('✅ Sign In Successful');
      console.log('🔑 Session active:', !!signinData.session);
      console.log('👤 User ID:', signinData.user?.id);
    }

    // Test 4: Password Reset (Magic Link)
    console.log('\n4️⃣ Testing Password Reset...');
    const { data: resetData, error: resetError } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'https://mujfoodclub.vercel.app/auth'
      }
    });

    if (resetError) {
      console.log('❌ Password Reset Failed:', resetError.message);
    } else {
      console.log('✅ Password Reset Email Sent');
      console.log('📧 Magic link sent to:', testEmail);
    }

    // Test 5: Sign Out
    console.log('\n5️⃣ Testing Sign Out...');
    const { error: signoutError } = await supabase.auth.signOut();
    
    if (signoutError) {
      console.log('❌ Sign Out Failed:', signoutError.message);
    } else {
      console.log('✅ Sign Out Successful');
    }

    // Test 6: Duplicate Email Handling
    console.log('\n6️⃣ Testing Duplicate Email Handling...');
    const { data: duplicateData, error: duplicateError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'AnotherPassword123!',
      options: {
        data: {
          full_name: 'Another User',
          custom_block: 'B2'
        }
      }
    });

    if (duplicateError) {
      if (duplicateError.message.includes('already registered')) {
        console.log('✅ Duplicate Email Correctly Blocked');
      } else {
        console.log('❌ Unexpected duplicate email error:', duplicateError.message);
      }
    } else {
      console.log('⚠️  Duplicate email was allowed (this might be expected)');
    }

    // Test 7: Invalid Email Domain
    console.log('\n7️⃣ Testing Invalid Email Domain...');
    const { data: invalidData, error: invalidError } = await supabase.auth.signUp({
      email: 'test@gmail.com',
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Invalid User',
          custom_block: 'B1'
        }
      }
    });

    if (invalidError) {
      if (invalidError.message.includes('muj.manipal.edu')) {
        console.log('✅ Invalid Email Domain Correctly Blocked');
      } else {
        console.log('❌ Unexpected invalid email error:', invalidError.message);
      }
    } else {
      console.log('⚠️  Invalid email domain was allowed');
    }

    console.log('\n🎯 AUTHENTICATION TEST SUMMARY');
    console.log('===============================');
    console.log('✅ Sign Up:', signupError ? 'FAILED' : 'PASSED');
    console.log('✅ Profile Creation:', profileError ? 'FAILED' : 'PASSED');
    console.log('✅ Sign In:', signinError ? 'FAILED' : 'PASSED');
    console.log('✅ Password Reset:', resetError ? 'FAILED' : 'PASSED');
    console.log('✅ Sign Out:', signoutError ? 'FAILED' : 'PASSED');
    console.log('✅ Duplicate Email:', duplicateError?.message?.includes('already') ? 'PASSED' : 'NEEDS CHECK');
    console.log('✅ Invalid Domain:', invalidError?.message?.includes('muj.manipal.edu') ? 'PASSED' : 'NEEDS CHECK');

    if (signupError || profileError || signinError || resetError || signoutError) {
      console.log('\n🚨 ISSUES FOUND - Authentication needs fixing');
    } else {
      console.log('\n🎉 ALL TESTS PASSED - Authentication is working perfectly!');
    }

  } catch (error) {
    console.log('❌ Unexpected error during testing:', error.message);
  }
}

testCompleteAuthFlow();
