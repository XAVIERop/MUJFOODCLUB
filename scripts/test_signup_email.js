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

async function testSignupEmail() {
  console.log('🧪 Testing Regular Signup with Email...');
  
  const testEmail = 'test-signup-' + Date.now() + '@muj.manipal.edu';
  const password = 'TestPassword123!';
  
  try {
    console.log(`📧 Creating account: ${testEmail}`);
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ Signup error:', error.message);
      console.log('🔍 Error details:', error);
    } else {
      console.log('✅ Signup successful!');
      console.log('📧 Email confirmation should be sent');
      console.log('📋 User data:', data.user ? data.user.email : 'No user data');
      console.log('📋 Session:', data.session ? 'Session created' : 'No session');
      
      if (data.user && !data.user.email_confirmed_at) {
        console.log('⚠️  Email not confirmed yet - check your email');
      }
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

testSignupEmail();
