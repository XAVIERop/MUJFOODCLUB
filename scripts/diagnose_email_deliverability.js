#!/usr/bin/env node

/**
 * Email Deliverability Diagnostic Script
 * Checks DNS records and email configuration
 */

import { execSync } from 'child_process';

const DOMAIN = 'mujfoodclub.in';

/**
 * Check DNS record
 */
function checkDNSRecord(type, name, expectedValue) {
  try {
    const command = `dig TXT ${name}.${DOMAIN}`;
    const result = execSync(command, { encoding: 'utf8' });
    
    if (result.includes(expectedValue)) {
      console.log(`✅ ${type} record: OK`);
      return true;
    } else {
      console.log(`❌ ${type} record: MISSING or INCORRECT`);
      console.log(`   Expected: ${expectedValue}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${type} record: ERROR checking`);
    return false;
  }
}

/**
 * Check MX record
 */
function checkMXRecord() {
  try {
    const command = `dig MX ${DOMAIN}`;
    const result = execSync(command, { encoding: 'utf8' });
    
    if (result.includes('mx1.brevo.com')) {
      console.log(`✅ MX record: OK`);
      return true;
    } else {
      console.log(`❌ MX record: MISSING or INCORRECT`);
      console.log(`   Expected: mx1.brevo.com`);
      return false;
    }
  } catch (error) {
    console.log(`❌ MX record: ERROR checking`);
    return false;
  }
}

/**
 * Main diagnostic function
 */
function runDiagnostics() {
  console.log('🔍 EMAIL DELIVERABILITY DIAGNOSTICS');
  console.log('='.repeat(50));
  console.log(`Domain: ${DOMAIN}`);
  console.log('');
  
  let allGood = true;
  
  // Check SPF record
  allGood &= checkDNSRecord('SPF', '@', 'v=spf1 include:spf.brevo.com ~all');
  
  // Check DMARC record
  allGood &= checkDNSRecord('DMARC', '_dmarc', 'v=DMARC1');
  
  // Check MX record
  allGood &= checkMXRecord();
  
  console.log('');
  
  if (allGood) {
    console.log('🎉 All DNS records are configured correctly!');
    console.log('If emails are still going to spam, check:');
    console.log('- Brevo domain verification status');
    console.log('- Sender verification status');
    console.log('- Email content optimization');
    console.log('- Sender reputation');
  } else {
    console.log('⚠️  Some DNS records are missing or incorrect.');
    console.log('Please add the missing records to your domain registrar.');
    console.log('Refer to OUTLOOK_SPAM_FIX_GUIDE.md for detailed instructions.');
  }
  
  console.log('');
  console.log('📚 Additional Resources:');
  console.log('- OUTLOOK_SPAM_FIX_GUIDE.md');
  console.log('- HOSTINGER_DNS_SETUP_GUIDE.md');
  console.log('- BREVO_MUJFOODCLUB_SETUP.md');
}

// Run diagnostics
runDiagnostics();
