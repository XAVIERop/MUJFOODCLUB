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
