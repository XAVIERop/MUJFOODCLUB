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

async function testRealEmail() {
  console.log('🧪 Testing with Real Email...');
  
  const testEmail = 'pv.socialstudio@gmail.com'; // Use your actual email
  
  try {
    // Test magic link (passwordless sign-in)
    console.log(`📧 Sending magic link to: ${testEmail}`);
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ Magic link error:', error.message);
      console.log('🔍 Error details:', error);
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📧 Check your email for the magic link');
      console.log('📋 Data:', data);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

testRealEmail();
