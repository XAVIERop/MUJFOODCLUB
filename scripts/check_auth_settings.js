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

async function checkAuthSettings() {
  console.log('🔍 Checking Authentication Settings...');
  
  try {
    // Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Session check: OK');
    }
    
    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User error:', userError.message);
    } else if (user) {
      console.log('✅ User found:', user.email);
    } else {
      console.log('ℹ️  No user logged in');
    }
    
    console.log('\n📋 Manual Steps to Check in Supabase Dashboard:');
    console.log('1. Go to Authentication → Settings → General');
    console.log('   - Enable magic links: ON');
    console.log('   - Enable email confirmations: ON');
    console.log('   - Enable signups: ON');
    console.log('');
    console.log('2. Go to Authentication → Email Templates');
    console.log('   - Check if "Magic Link" template exists');
    console.log('   - Check if "Confirm signup" template exists');
    console.log('');
    console.log('3. Go to Authentication → URL Configuration');
    console.log('   - Site URL: http://localhost:8080');
    console.log('   - Redirect URLs: http://localhost:8080/auth');
    console.log('');
    console.log('4. Check your email (including spam folder)');
    console.log('   - Look for email from Supabase');
    console.log('   - Click the magic link to test');
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

checkAuthSettings();
