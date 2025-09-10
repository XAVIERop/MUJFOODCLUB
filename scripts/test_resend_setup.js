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

async function testResendSetup() {
  console.log('🧪 Testing Resend Email Setup...');
  
  try {
    // Test magic link with Resend
    console.log('📧 Sending magic link via Resend...');
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'pv.socialstudio@gmail.com',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 This might mean Resend is not configured yet');
    } else {
      console.log('✅ Magic link sent successfully via Resend!');
      console.log('📧 Check your email for the magic link');
      console.log('📋 Data:', data);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

console.log('📋 Before running this script:');
console.log('1. Sign up at resend.com');
console.log('2. Get your API key');
console.log('3. Configure Supabase SMTP with:');
console.log('   - Host: smtp.resend.com');
console.log('   - Port: 587');
console.log('   - Username: resend');
console.log('   - Password: [Your Resend API Key]');
console.log('   - Enable Custom SMTP: ON');
console.log('');
console.log('🚀 Ready to test? Run: node scripts/test_resend_setup.js');

// Uncomment the line below when you're ready to test
testResendSetup();
