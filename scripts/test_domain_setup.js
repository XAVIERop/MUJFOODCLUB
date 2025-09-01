import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
