import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGmailSetup() {
  console.log('🧪 Testing Gmail SMTP Setup...');
  
  try {
    // Test magic link with Gmail
    console.log('📧 Sending magic link via Gmail...');
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'pv.socialstudio@gmail.com',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 This might mean Gmail SMTP is not configured yet');
      console.log('📋 Check your Supabase SMTP settings:');
      console.log('   - Host: smtp.gmail.com');
      console.log('   - Port: 587');
      console.log('   - Username: pv.socialstudio@gmail.com');
      console.log('   - Password: [Your Gmail App Password]');
      console.log('   - Enable Custom SMTP: ON');
    } else {
      console.log('✅ Magic link sent successfully via Gmail!');
      console.log('📧 Check your email for the magic link');
      console.log('📋 Data:', data);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

console.log('📋 Before running this script:');
console.log('1. Enable 2FA on your Gmail account');
console.log('2. Generate App Password for "Mail"');
console.log('3. Configure Supabase SMTP with Gmail details');
console.log('');
console.log('🚀 Ready to test? Run: node scripts/test_gmail_setup.js');

// Uncomment when ready to test
testGmailSetup();
