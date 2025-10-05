// Create Munch Box Auth User
// This script creates the actual auth user for Munch Box cafe owner

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - UPDATE THESE VALUES
const supabaseUrl = 'https://pv.supabase.co'; // Replace with your actual URL
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ0NzQ5MCwiZXhwIjoyMDUyMDIzNDkwfQ.8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8Q'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMunchBoxAuthUser() {
  console.log('🚀 Creating Munch Box auth user...');
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'munchbox.owner@mujfoodclub.in',
      password: 'Munchbox@2024',
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Munch Box Owner',
        cafe_name: 'Munch Box'
      }
    });
    
    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message);
      return;
    }
    
    console.log('✅ Created auth user:', authData.user.id);
    
    // Update the profile with the correct user ID
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ id: authData.user.id })
      .eq('email', 'munchbox.owner@mujfoodclub.in');
    
    if (profileError) {
      console.error('❌ Failed to update profile:', profileError.message);
      return;
    }
    
    console.log('✅ Updated profile with auth user ID');
    
    // Verify the fix
    const { data: profileData, error: verifyError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        user_type,
        cafe_id,
        cafes!inner(name, accepting_orders, priority)
      `)
      .eq('email', 'munchbox.owner@mujfoodclub.in')
      .single();
    
    if (verifyError) {
      console.error('❌ Failed to verify profile:', verifyError.message);
      return;
    }
    
    console.log('✅ Verification successful:');
    console.log('   Email:', profileData.email);
    console.log('   Full Name:', profileData.full_name);
    console.log('   User Type:', profileData.user_type);
    console.log('   Cafe:', profileData.cafes.name);
    console.log('   Accepting Orders:', profileData.cafes.accepting_orders);
    console.log('   Priority:', profileData.cafes.priority);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: munchbox.owner@mujfoodclub.in');
    console.log('   Password: Munchbox@2024');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
createMunchBoxAuthUser().catch(console.error);
