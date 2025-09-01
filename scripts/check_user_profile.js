import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserProfile(email) {
  try {
    console.log(`Checking profile for: ${email}\n`);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.log('❌ Profile not found:', profileError.message);
      console.log('\n🔧 Solution: The user needs to be created through the proper signup flow');
      console.log('Steps to fix:');
      console.log('1. Go to the signup page on your website');
      console.log('2. Use the email: naman.2430030314@muj.manipal.edu');
      console.log('3. Set a password and complete the signup process');
      console.log('4. Verify the email if required');
      console.log('5. Then try signing in');
    } else {
      console.log('✅ Profile found:');
      console.log(`ID: ${profile.id}`);
      console.log(`Full Name: ${profile.full_name}`);
      console.log(`User Type: ${profile.user_type}`);
      console.log(`Block: ${profile.block}`);
      console.log(`Created: ${profile.created_at}`);
      
      console.log('\n🔧 Issue: Profile exists but user is not authenticated');
      console.log('Solution: The user needs to sign in through the website, not just exist in the database');
      console.log('\nSteps to fix:');
      console.log('1. Go to the signin page on your website');
      console.log('2. Use the email: naman.2430030314@muj.manipal.edu');
      console.log('3. Enter the password you set when creating the user');
      console.log('4. This will establish a proper authentication session');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkUserProfile('naman.2430030314@muj.manipal.edu');
