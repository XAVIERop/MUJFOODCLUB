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

async function testDomainSetup() {
  console.log('🧪 Testing Domain Setup with socialstudio.in...');
  
  try {
    console.log('📧 Sending magic link with hello@socialstudio.in...');
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'pv.socialstudio@gmail.com',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8081/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('🔍 This might mean domain is not verified yet');
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📧 Check your email for the magic link');
      console.log('🎉 Your domain email system is working!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Test with student emails (@muj.manipal.edu)');
      console.log('2. Verify email delivery to campus emails');
      console.log('3. Deploy your authentication system');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

console.log('📋 Before running this script:');
console.log('1. Add socialstudio.in domain to Brevo');
console.log('2. Verify domain with DNS records in Hostinger');
console.log('3. Update Supabase SMTP with hello@socialstudio.in');
console.log('4. Then run: node scripts/test_domain_setup.js');

// Uncomment when ready to test
testDomainSetup();
