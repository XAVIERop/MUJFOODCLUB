#!/usr/bin/env node

/**
 * Test script for support@mujfoodclub.in email setup
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://kblazvxfducwviyyiwde.supabase.co',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  TEST_EMAIL: 'test-mujfoodclub@muj.manipal.edu'
};

// Initialize Supabase client
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

/**
 * Test email sending with new domain
 */
async function testMujfoodclubEmail() {
  console.log('🧪 Testing support@mujfoodclub.in email setup...');
  console.log('');
  
  try {
    // Test magic link with new email domain
    console.log(`📧 Sending test email to: ${CONFIG.TEST_EMAIL}`);
    console.log('📤 Sender should be: support@mujfoodclub.in');
    console.log('');
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: CONFIG.TEST_EMAIL,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'https://mujfoodclub.vercel.app/auth'
      }
    });
    
    if (error) {
      console.log('❌ Error sending email:', error.message);
      console.log('');
      console.log('🔍 **Possible Issues**:');
      console.log('1. mujfoodclub.in domain not verified in Brevo');
      console.log('2. support@mujfoodclub.in sender not created/verified');
      console.log('3. Supabase SMTP settings not updated');
      console.log('4. DNS records not added to domain registrar');
      console.log('');
      console.log('📋 **Check These**:');
      console.log('- Brevo dashboard: Domain verification status');
      console.log('- Brevo dashboard: Sender verification status');
      console.log('- Supabase dashboard: SMTP settings');
      console.log('- Domain registrar: DNS records');
      console.log('');
    } else {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your email for the magic link');
      console.log('📤 Verify sender is: support@mujfoodclub.in');
      console.log('');
      console.log('🔍 **What to Check**:');
      console.log('1. Email appears in inbox (not spam)');
      console.log('2. Sender shows as: support@mujfoodclub.in');
      console.log('3. All links work correctly');
      console.log('4. Email renders properly on mobile');
      console.log('');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

/**
 * Display verification checklist
 */
function displayVerificationChecklist() {
  console.log('📋 **VERIFICATION CHECKLIST**');
  console.log('='.repeat(40));
  console.log('');
  
  console.log('✅ **Brevo Configuration**:');
  console.log('   [ ] mujfoodclub.in domain added to Brevo');
  console.log('   [ ] Domain verified in Brevo dashboard');
  console.log('   [ ] support@mujfoodclub.in sender created');
  console.log('   [ ] Sender verified in Brevo dashboard');
  console.log('');
  
  console.log('✅ **DNS Configuration**:');
  console.log('   [ ] SPF record added: v=spf1 include:spf.brevo.com ~all');
  console.log('   [ ] DMARC record added: v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1');
  console.log('   [ ] MX record added: mx1.brevo.com (Priority: 10)');
  console.log('   [ ] DNS records propagated (24-48 hours)');
  console.log('');
  
  console.log('✅ **Supabase Configuration**:');
  console.log('   [ ] SMTP settings updated with support@mujfoodclub.in');
  console.log('   [ ] Email templates updated');
  console.log('   [ ] Sender name updated to: MUJ FOOD CLUB');
  console.log('');
  
  console.log('✅ **Testing**:');
  console.log('   [ ] Test email sent successfully');
  console.log('   [ ] Email appears in inbox (not spam)');
  console.log('   [ ] Sender shows as: support@mujfoodclub.in');
  console.log('   [ ] All links work correctly');
  console.log('   [ ] Email renders properly on mobile');
  console.log('');
}

/**
 * Display troubleshooting guide
 */
function displayTroubleshootingGuide() {
  console.log('🔧 **TROUBLESHOOTING GUIDE**');
  console.log('='.repeat(40));
  console.log('');
  
  console.log('❌ **If email sending fails**:');
  console.log('1. Check Brevo domain verification status');
  console.log('2. Verify support@mujfoodclub.in sender is created and verified');
  console.log('3. Check Supabase SMTP settings are updated');
  console.log('4. Verify DNS records are added and propagated');
  console.log('');
  
  console.log('❌ **If emails go to spam**:');
  console.log('1. Check SPF record is correct and propagated');
  console.log('2. Verify DMARC record is added');
  console.log('3. Check email content for spam triggers');
  console.log('4. Monitor Brevo delivery statistics');
  console.log('');
  
  console.log('❌ **If sender shows incorrectly**:');
  console.log('1. Verify sender configuration in Brevo');
  console.log('2. Check Supabase SMTP sender settings');
  console.log('3. Verify sender is verified in Brevo');
  console.log('');
  
  console.log('📞 **Support Resources**:');
  console.log('- Brevo Support: Available in dashboard');
  console.log('- Domain Registrar Support: Check your registrar');
  console.log('- DNS Tools: mxtoolbox.com, dnschecker.org');
  console.log('');
}

/**
 * Main function
 */
async function testMujfoodclubEmailSetup() {
  console.log('🚀 MUJFOODCLUB.IN EMAIL TESTING');
  console.log('='.repeat(40));
  console.log('');
  
  await testMujfoodclubEmail();
  displayVerificationChecklist();
  displayTroubleshootingGuide();
  
  console.log('📚 **Documentation**:');
  console.log('- BREVO_MUJFOODCLUB_SETUP.md (detailed setup guide)');
  console.log('- EMAIL_MIGRATION_CHECKLIST.md (step-by-step checklist)');
  console.log('- mujfoodclub-dns-records.json (DNS records)');
  console.log('- mujfoodclub-email-templates/ (updated templates)');
  console.log('');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMujfoodclubEmailSetup();
}

export { testMujfoodclubEmailSetup };
