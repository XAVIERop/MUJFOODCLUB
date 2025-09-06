#!/usr/bin/env node

/**
 * DNS Records Setup Script for Email Deliverability
 * Helps configure SPF, DKIM, and DMARC records
 */

import fs from 'fs';

/**
 * Generate DNS records for email deliverability
 */
function generateDNSRecords() {
  console.log('🌐 Generating DNS records for email deliverability...');
  
  const dnsRecords = {
    domain: 'socialstudio.in',
    records: [
      {
        type: 'TXT',
        name: '@',
        value: 'v=spf1 include:spf.brevo.com ~all',
        ttl: 3600,
        description: 'SPF record - authorizes Brevo to send emails'
      },
      {
        type: 'TXT',
        name: '_dmarc',
        value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@socialstudio.in; ruf=mailto:dmarc@socialstudio.in; fo=1',
        ttl: 3600,
        description: 'DMARC record - email authentication policy'
      },
      {
        type: 'MX',
        name: '@',
        value: 'mx1.brevo.com',
        priority: 10,
        ttl: 3600,
        description: 'MX record - for receiving emails (optional)'
      }
    ],
    instructions: {
      hostinger: [
        '1. Login to Hostinger control panel',
        '2. Go to "DNS Zone Editor"',
        '3. Add each record below',
        '4. Wait 24-48 hours for propagation'
      ],
      verification: [
        'Use mxtoolbox.com to verify records',
        'Check Brevo dashboard for domain verification',
        'Test email deliverability after propagation'
      ]
    }
  };
  
  // Save DNS records to file
  fs.writeFileSync('dns-records.json', JSON.stringify(dnsRecords, null, 2));
  
  console.log('✅ DNS records generated and saved to dns-records.json');
  return dnsRecords;
}

/**
 * Display DNS records in a readable format
 */
function displayDNSRecords(records) {
  console.log('\n📋 DNS RECORDS TO ADD');
  console.log('='.repeat(50));
  console.log(`Domain: ${records.domain}`);
  console.log('');
  
  records.records.forEach((record, index) => {
    console.log(`${index + 1}. ${record.type} Record`);
    console.log(`   Name: ${record.name}`);
    console.log(`   Value: ${record.value}`);
    console.log(`   TTL: ${record.ttl}`);
    if (record.priority) console.log(`   Priority: ${record.priority}`);
    console.log(`   Description: ${record.description}`);
    console.log('');
  });
  
  console.log('📝 INSTRUCTIONS FOR HOSTINGER:');
  records.instructions.hostinger.forEach(step => {
    console.log(`   ${step}`);
  });
  console.log('');
  
  console.log('🔍 VERIFICATION:');
  records.instructions.verification.forEach(step => {
    console.log(`   ${step}`);
  });
  console.log('');
}

/**
 * Create verification commands
 */
function createVerificationCommands() {
  console.log('🧪 VERIFICATION COMMANDS');
  console.log('='.repeat(30));
  console.log('');
  console.log('Test SPF record:');
  console.log('dig TXT socialstudio.in');
  console.log('');
  console.log('Test DMARC record:');
  console.log('dig TXT _dmarc.socialstudio.in');
  console.log('');
  console.log('Test MX record:');
  console.log('dig MX socialstudio.in');
  console.log('');
  console.log('Online verification tools:');
  console.log('- https://mxtoolbox.com/spf.aspx');
  console.log('- https://mxtoolbox.com/dmarc.aspx');
  console.log('- https://mxtoolbox.com/blacklists.aspx');
  console.log('');
}

/**
 * Main function
 */
function setupDNSRecords() {
  console.log('🚀 DNS RECORDS SETUP FOR EMAIL DELIVERABILITY');
  console.log('='.repeat(60));
  console.log('');
  
  const records = generateDNSRecords();
  displayDNSRecords(records);
  createVerificationCommands();
  
  console.log('⚠️  IMPORTANT NOTES:');
  console.log('- DNS changes can take 24-48 hours to propagate');
  console.log('- Test email deliverability after DNS propagation');
  console.log('- Monitor Brevo dashboard for delivery statistics');
  console.log('- Keep backup of current DNS records');
  console.log('');
  
  console.log('📚 Additional Resources:');
  console.log('- DNS_CONFIGURATION_GUIDE.md (detailed guide)');
  console.log('- EMAIL_DELIVERABILITY_CHECKLIST.md (checklist)');
  console.log('- email-templates/ (optimized templates)');
  console.log('');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDNSRecords();
}

export { setupDNSRecords };
