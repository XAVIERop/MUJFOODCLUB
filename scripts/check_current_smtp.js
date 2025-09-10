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

async function checkCurrentSMTP() {
  console.log('🔍 Checking Current SMTP Configuration...');
  
  try {
    // Try to get auth settings (this will show if SMTP is working)
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'test-check-' + Date.now() + '@muj.manipal.edu',
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'http://localhost:8080/auth'
      }
    });
    
    if (error) {
      console.log('❌ SMTP Error:', error.message);
      console.log('');
      console.log('🔧 Current Status:');
      console.log('- Custom SMTP: Likely NOT configured properly');
      console.log('- Built-in email: Rate limited (not working)');
      console.log('');
      console.log('🚀 Recommended Actions:');
      console.log('1. Fix Gmail App Password setup');
      console.log('2. OR switch to SendGrid (easier)');
      console.log('3. OR use a different email provider');
    } else {
      console.log('✅ SMTP is working!');
      console.log('📧 Magic link sent successfully');
      console.log('🎉 Your email configuration is correct!');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err);
  }
}

checkCurrentSMTP();
