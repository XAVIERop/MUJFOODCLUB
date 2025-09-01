import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
