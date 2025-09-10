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

async function testGmailAlternative() {
  console.log('🧪 Testing Gmail SMTP with Alternative Email...');
  
  try {
    // Test with a different email
    const testEmail = 'test-gmail-' + Date.now() + '@muj.manipal.edu';
    console.log(`📧 Sending magic link to: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 This confirms Gmail SMTP is not working');
      console.log('');
      console.log('📋 Troubleshooting Steps:');
      console.log('1. Check if "Enable Custom SMTP" is ON in Supabase');
      console.log('2. Verify Gmail App Password is correct');
      console.log('3. Make sure 2FA is enabled on Gmail');
      console.log('4. Check if sender email matches Gmail account');
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📧 Check the email for the magic link');
      console.log('📋 This means Gmail SMTP is working!');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

testGmailAlternative();
