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

async function testDifferentEmail() {
  console.log('🧪 Testing Brevo with Different Email...');
  
  try {
    // Test with a different email
    const testEmail = 'test-brevo-' + Date.now() + '@muj.manipal.edu';
    console.log(`📧 Sending magic link to: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8081/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 This means there might be a deeper issue');
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📧 Check the email for the magic link');
      console.log('📋 Data:', data);
      console.log('');
      console.log('💡 If you still don\'t receive emails:');
      console.log('1. Check Brevo logs for specific error details');
      console.log('2. Verify your Brevo account is fully activated');
      console.log('3. Check if there are any sending limits');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

testDifferentEmail();
