import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
