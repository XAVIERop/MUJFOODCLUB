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

async function testFixedSender() {
  console.log('🧪 Testing After Fixing Sender Email...');
  
  try {
    console.log('📧 Sending magic link with fixed sender...');
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'pv.socialstudio@gmail.com',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8081/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 Check if you updated the sender email in Supabase');
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📧 Check your email for the magic link');
      console.log('🎉 Your email system is now working!');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

console.log('📋 Before running this script:');
console.log('1. Go to Supabase SMTP Settings');
console.log('2. Change Sender Email to: test@brevo.com (or Brevo test domain)');
console.log('3. Save changes');
console.log('4. Then run: node scripts/test_fixed_sender.js');

// Uncomment when ready to test
// testFixedSender();
