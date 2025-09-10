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

async function testRealStudentFlow() {
  console.log('🧪 Testing Student Authentication Flow...');
  
  try {
    // Test with your real email (for testing purposes)
    const testEmail = 'pv.socialstudio@gmail.com';
    console.log(`📧 Testing magic link to: ${testEmail}`);
    console.log('💡 Note: In production, students will use @muj.manipal.edu emails');
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8081/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📧 Check your email for the magic link');
      console.log('📋 Data:', data);
      console.log('');
      console.log('🎯 Next Steps:');
      console.log('1. Check your email for the magic link');
      console.log('2. Click the magic link to test login');
      console.log('3. Verify the student profile creation');
      console.log('');
      console.log('💡 For Production:');
      console.log('- Students will use @muj.manipal.edu emails');
      console.log('- You may need to verify these emails work with Brevo');
      console.log('- Consider testing with a few real student emails');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

testRealStudentFlow();
