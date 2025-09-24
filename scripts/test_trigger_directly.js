import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTriggerDirectly() {
  console.log('🔍 TESTING TRIGGER DIRECTLY');
  console.log('============================\n');

  const testEmail = `trigger-test-${Date.now()}@muj.manipal.edu`;
  const testPassword = 'TestPassword123!';

  try {
    // Step 1: Sign up a user
    console.log('1️⃣ Creating user...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Trigger Test User',
          block: 'B1'
        }
      }
    });

    if (signupError) {
      console.log('❌ Sign up failed:', signupError.message);
      return;
    }

    console.log('✅ User created:', signupData.user?.id);

    // Step 2: Wait a moment for trigger to fire
    console.log('\n⏳ Waiting for trigger to fire...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Check if profile was created
    console.log('2️⃣ Checking profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signupData.user.id);

    if (profileError) {
      console.log('❌ Profile query failed:', profileError.message);
      console.log('🔍 Error details:', profileError);
    } else if (profile && profile.length > 0) {
      console.log('✅ Profile created successfully!');
      console.log('👤 Profile data:', profile[0]);
    } else {
      console.log('❌ No profile found - trigger did not fire');
    }

    // Step 4: Check if trigger exists
    console.log('\n3️⃣ Checking trigger status...');
    const { data: triggerCheck, error: triggerError } = await supabase
      .rpc('check_trigger_exists');

    if (triggerError) {
      console.log('⚠️  Could not check trigger status (this is normal)');
    } else {
      console.log('✅ Trigger status:', triggerCheck);
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testTriggerDirectly();
