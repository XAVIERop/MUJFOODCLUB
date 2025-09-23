import { createClient } from '@supabase/supabase-js';

// Use production environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductionEmail() {
  console.log('🧪 Testing Production Email Configuration...');
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔑 Using production Supabase project\n');
  
  try {
    // Test 1: Try to send a magic link
    console.log('📧 Testing magic link send...');
    const testEmail = `test-${Date.now()}@muj.manipal.edu`;
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'https://mujfoodclub.vercel.app/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error sending magic link:', error.message);
      console.log('🔍 Error code:', error.status);
      
      if (error.message.includes('rate limit')) {
        console.log('\n🚨 Issue: Email rate limit exceeded');
        console.log('💡 Solution: Wait a few minutes and try again');
      } else if (error.message.includes('SMTP')) {
        console.log('\n🚨 Issue: SMTP configuration problem');
        console.log('💡 Solution: Check Supabase email settings');
      } else if (error.message.includes('domain')) {
        console.log('\n🚨 Issue: Domain not verified');
        console.log('💡 Solution: Verify domain in Supabase');
      }
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📧 Check email for:', testEmail);
    }
    
    // Test 2: Try to send confirmation email (like our reset flow)
    console.log('\n📧 Testing confirmation email send...');
    const { data: confirmData, error: confirmError } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
      options: {
        emailRedirectTo: 'https://mujfoodclub.vercel.app/auth'
      }
    });
    
    if (confirmError) {
      console.log('❌ Error sending confirmation:', confirmError.message);
    } else {
      console.log('✅ Confirmation email sent successfully!');
    }
    
    console.log('\n📋 Production Email Status:');
    console.log('- Magic Link: ' + (error ? '❌ Failed' : '✅ Working'));
    console.log('- Confirmation: ' + (confirmError ? '❌ Failed' : '✅ Working'));
    
    if (error || confirmError) {
      console.log('\n🔧 Next Steps:');
      console.log('1. Check Supabase Dashboard → Authentication → Settings');
      console.log('2. Verify email templates are configured');
      console.log('3. Check if custom SMTP is set up');
      console.log('4. Verify domain in Supabase');
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testProductionEmail();
