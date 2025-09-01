import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
