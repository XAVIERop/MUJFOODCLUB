import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function waitAndTest() {
  console.log('⏰ Waiting 2 minutes for rate limit to potentially reset...');
  console.log('📧 Then testing magic link again...');
  
  // Wait 2 minutes
  await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
  
  console.log('🔄 Testing magic link after wait...');
  
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'pv.socialstudio@gmail.com',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ Still getting error:', error.message);
      console.log('🔍 This confirms rate limit issue');
    } else {
      console.log('✅ Magic link sent after wait!');
      console.log('📧 Check your email now');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

console.log('🚀 Starting wait and test...');
waitAndTest();
