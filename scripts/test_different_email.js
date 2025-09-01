import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
