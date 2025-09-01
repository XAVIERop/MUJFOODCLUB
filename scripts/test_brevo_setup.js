import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrevoSetup() {
  console.log('🧪 Testing Brevo SMTP Setup...');
  
  try {
    // Test magic link with Brevo
    console.log('📧 Sending magic link via Brevo...');
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'pv.socialstudio@gmail.com',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 This might mean Brevo is not configured yet');
      console.log('');
      console.log('📋 Brevo SMTP Settings to check in Supabase:');
      console.log('   - Host: smtp-relay.brevo.com');
      console.log('   - Port: 587');
      console.log('   - Username: [Your Brevo Email]');
      console.log('   - Password: [Your Brevo SMTP Key]');
      console.log('   - Enable Custom SMTP: ON');
    } else {
      console.log('✅ Magic link sent successfully via Brevo!');
      console.log('📧 Check your email for the magic link');
      console.log('📋 Data:', data);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

console.log('📋 Before running this script:');
console.log('1. Sign up at brevo.com');
console.log('2. Get your SMTP credentials from Settings → SMTP & API');
console.log('3. Configure Supabase SMTP with Brevo details');
console.log('');
console.log('🚀 Ready to test? Run: node scripts/test_brevo_setup.js');

// Uncomment when ready to test
testBrevoSetup();
