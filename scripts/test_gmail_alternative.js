import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
