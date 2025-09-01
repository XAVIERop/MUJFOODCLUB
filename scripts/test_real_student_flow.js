import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
