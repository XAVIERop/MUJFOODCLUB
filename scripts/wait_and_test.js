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
