#!/usr/bin/env node

/**
 * Setup script for support@mujfoodclub.in email domain
 * Migrates from hello@socialstudio.in to support@mujfoodclub.in
 */

import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  OLD_DOMAIN: 'socialstudio.in',
  NEW_DOMAIN: 'mujfoodclub.in',
  OLD_EMAIL: 'hello@socialstudio.in',
  NEW_EMAIL: 'support@mujfoodclub.in',
  SENDER_NAME: 'MUJ FOOD CLUB',
  BREVO_SMTP: {
    HOST: 'smtp-relay.brevo.com',
    PORT: 587
  }
};

/**
 * Generate DNS records for new domain
 */
function generateNewDNSRecords() {
  console.log('🌐 Generating DNS records for mujfoodclub.in...');
  
  const dnsRecords = {
    domain: 'mujfoodclub.in',
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
        value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1',
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
      domain_registrar: [
        '1. Login to your domain registrar (where mujfoodclub.in is registered)',
        '2. Go to DNS management or DNS zone editor',
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
  fs.writeFileSync('mujfoodclub-dns-records.json', JSON.stringify(dnsRecords, null, 2));
  
  console.log('✅ DNS records generated and saved to mujfoodclub-dns-records.json');
  return dnsRecords;
}

/**
 * Create Brevo configuration guide
 */
function createBrevoConfigGuide() {
  console.log('📧 Creating Brevo configuration guide...');
  
  const brevoGuide = `# 📧 Brevo Configuration for support@mujfoodclub.in

## 🔧 **Step 1: Domain Verification in Brevo**

### Add Domain to Brevo
1. Login to your Brevo dashboard
2. Go to **Settings** → **Senders & IP** → **Domains**
3. Click **Add a domain**
4. Enter: \`mujfoodclub.in\`
5. Follow the verification process

### Domain Verification Process
1. Brevo will provide DNS records to add
2. Add the provided records to your domain registrar
3. Wait for verification (usually 24-48 hours)
4. Verify domain status in Brevo dashboard

## 🔧 **Step 2: Sender Configuration**

### Create Sender
1. Go to **Settings** → **Senders & IP** → **Senders**
2. Click **Add a sender**
3. Fill in the details:
   - **Email**: support@mujfoodclub.in
   - **Name**: MUJ FOOD CLUB
   - **Reply-to**: support@mujfoodclub.in
4. Verify the sender (Brevo will send verification email)

### Sender Verification
1. Check your email for verification link
2. Click the verification link
3. Confirm sender in Brevo dashboard

## 🔧 **Step 3: SMTP Configuration**

### SMTP Settings for Supabase
Update these settings in your Supabase Dashboard → Authentication → SMTP Settings:

\`\`\`
Host: smtp-relay.brevo.com
Port: 587
Username: [Your Brevo Email]
Password: [Your Brevo SMTP Key]
Sender Email: support@mujfoodclub.in
Sender Name: MUJ FOOD CLUB
\`\`\`

## 🔧 **Step 4: Email Templates Update**

### Update Template Variables
Replace all instances of \`hello@socialstudio.in\` with \`support@mujfoodclub.in\` in:
- Confirmation email templates
- Magic link templates
- Password reset templates
- Any other email templates

### Template Content Updates
- Update sender information
- Update reply-to addresses
- Update contact information
- Update branding if needed

## 🔧 **Step 5: DNS Records**

Add these DNS records to your domain registrar:

### SPF Record
\`\`\`
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all
TTL: 3600
\`\`\`

### DMARC Record
\`\`\`
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1
TTL: 3600
\`\`\`

### MX Record (Optional)
\`\`\`
Type: MX
Name: @
Value: mx1.brevo.com
Priority: 10
TTL: 3600
\`\`\`

## 🔧 **Step 6: Testing**

### Test Email Sending
1. Send test emails to different providers
2. Check deliverability rates
3. Monitor spam folder placement
4. Verify all links work correctly

### Verification Commands
\`\`\`bash
# Test SPF record
dig TXT mujfoodclub.in

# Test DMARC record
dig TXT _dmarc.mujfoodclub.in

# Test MX record
dig MX mujfoodclub.in
\`\`\`

## ⚠️ **Important Notes**

- Domain verification can take 24-48 hours
- DNS propagation takes 24-48 hours
- Test thoroughly before going live
- Keep backup of current configuration
- Monitor deliverability after changes

## 📞 **Support**

- Brevo Support: Available in dashboard
- Domain Registrar Support: Check your registrar's support
- DNS Tools: mxtoolbox.com, dnschecker.org

---

**Timeline**: 2-3 days for complete setup and verification
`;

  fs.writeFileSync('BREVO_MUJFOODCLUB_SETUP.md', brevoGuide);
  console.log('✅ Brevo configuration guide created: BREVO_MUJFOODCLUB_SETUP.md');
}

/**
 * Create updated email templates
 */
function createUpdatedEmailTemplates() {
  console.log('📧 Creating updated email templates...');
  
  const templates = {
    confirmation: {
      subject: 'Welcome to MUJ Food Club - Verify Your Email',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MUJ Food Club</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ff6b35; color: white; padding: 30px; text-align: center; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    .button { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Welcome to MUJ Food Club!</h1>
    </div>
    
    <div class="content">
      <h2>Hello!</h2>
      <p>Thank you for joining MUJ Food Club - your gateway to delicious food from campus cafes!</p>
      
      <p><strong>Please verify your email address:</strong></p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link:</p>
      <p style="word-break: break-all; background: #f8f9fa; padding: 10px;">{{ .ConfirmationURL }}</p>
      
      <p>Need help? Reply to this email or contact us at support@mujfoodclub.in</p>
    </div>
    
    <div class="footer">
      <p>MUJ Food Club - Manipal University Jaipur</p>
      <p>This email was sent to {{ .Email }}. If you didn't sign up, please ignore this email.</p>
    </div>
  </div>
</body>
</html>`,
      text: `Welcome to MUJ Food Club!

Thank you for joining MUJ Food Club - your gateway to delicious food from campus cafes!

Please verify your email address by clicking the link below:
{{ .ConfirmationURL }}

Need help? Reply to this email or contact us at support@mujfoodclub.in

MUJ Food Club - Manipal University Jaipur
This email was sent to {{ .Email }}. If you didn't sign up, please ignore this email.`
    },
    
    magic_link: {
      subject: 'Your MUJ Food Club Login Link',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Link - MUJ Food Club</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ff6b35; color: white; padding: 30px; text-align: center; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    .button { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Your Login Link</h1>
    </div>
    
    <div class="content">
      <h2>Hello!</h2>
      <p>You requested a login link for your MUJ Food Club account.</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Login to MUJ Food Club</a>
      </div>
      
      <p>This link will expire in 1 hour for your security.</p>
      
      <p>If the button doesn't work, copy and paste this link:</p>
      <p style="word-break: break-all; background: #f8f9fa; padding: 10px;">{{ .ConfirmationURL }}</p>
      
      <p>Need help? Reply to this email or contact us at support@mujfoodclub.in</p>
    </div>
    
    <div class="footer">
      <p>MUJ Food Club - Manipal University Jaipur</p>
    </div>
  </div>
</body>
</html>`,
      text: `Your Login Link - MUJ Food Club

Hello!

You requested a login link for your MUJ Food Club account.

Click this link to login: {{ .ConfirmationURL }}

This link will expire in 1 hour for your security.

Need help? Reply to this email or contact us at support@mujfoodclub.in

MUJ Food Club - Manipal University Jaipur`
    }
  };
  
  // Create templates directory
  const templatesDir = path.join(process.cwd(), 'mujfoodclub-email-templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Save templates
  Object.entries(templates).forEach(([name, template]) => {
    fs.writeFileSync(
      path.join(templatesDir, `${name}.html`),
      template.html
    );
    fs.writeFileSync(
      path.join(templatesDir, `${name}.txt`),
      template.text
    );
  });
  
  console.log('✅ Updated email templates created in mujfoodclub-email-templates/ directory');
  return templates;
}

/**
 * Create migration checklist
 */
function createMigrationChecklist() {
  console.log('📋 Creating migration checklist...');
  
  const checklist = `# 📧 Email Domain Migration Checklist
## From hello@socialstudio.in to support@mujfoodclub.in

### ✅ **Pre-Migration (Do First)**

#### Domain Setup
- [ ] Verify mujfoodclub.in domain is registered
- [ ] Access domain registrar DNS management
- [ ] Backup current email configuration
- [ ] Document current Brevo settings

#### Brevo Account
- [ ] Login to Brevo dashboard
- [ ] Check current sender configuration
- [ ] Note current SMTP credentials
- [ ] Check current domain verification status

### ✅ **Step 1: Brevo Domain Verification**

#### Add New Domain
- [ ] Go to Brevo → Settings → Senders & IP → Domains
- [ ] Click "Add a domain"
- [ ] Enter: mujfoodclub.in
- [ ] Follow verification process

#### DNS Records for Brevo
- [ ] Add Brevo-provided DNS records to domain registrar
- [ ] Wait for domain verification (24-48 hours)
- [ ] Verify domain status in Brevo dashboard

### ✅ **Step 2: Sender Configuration**

#### Create New Sender
- [ ] Go to Brevo → Settings → Senders & IP → Senders
- [ ] Click "Add a sender"
- [ ] Email: support@mujfoodclub.in
- [ ] Name: MUJ FOOD CLUB
- [ ] Reply-to: support@mujfoodclub.in

#### Verify Sender
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Confirm sender in Brevo dashboard

### ✅ **Step 3: DNS Configuration**

#### Add DNS Records
- [ ] SPF Record: v=spf1 include:spf.brevo.com ~all
- [ ] DMARC Record: v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1
- [ ] MX Record: mx1.brevo.com (Priority: 10)

#### Verify DNS Records
- [ ] Test SPF: dig TXT mujfoodclub.in
- [ ] Test DMARC: dig TXT _dmarc.mujfoodclub.in
- [ ] Test MX: dig MX mujfoodclub.in
- [ ] Use mxtoolbox.com for verification

### ✅ **Step 4: Supabase Configuration**

#### Update SMTP Settings
- [ ] Go to Supabase Dashboard → Authentication → SMTP Settings
- [ ] Update Sender Email: support@mujfoodclub.in
- [ ] Update Sender Name: MUJ FOOD CLUB
- [ ] Keep SMTP Host: smtp-relay.brevo.com
- [ ] Keep SMTP Port: 587
- [ ] Update Username/Password if needed

#### Update Email Templates
- [ ] Replace confirmation email template
- [ ] Replace magic link template
- [ ] Update all contact references to support@mujfoodclub.in
- [ ] Test template rendering

### ✅ **Step 5: Testing**

#### Email Testing
- [ ] Send test confirmation email
- [ ] Send test magic link email
- [ ] Test with Gmail, Outlook, Yahoo
- [ ] Check spam folder placement
- [ ] Verify all links work correctly

#### Deliverability Testing
- [ ] Check Brevo delivery statistics
- [ ] Monitor bounce rates
- [ ] Check spam complaint rates
- [ ] Test email authentication

### ✅ **Step 6: Go Live**

#### Final Verification
- [ ] All DNS records propagated
- [ ] Brevo domain verified
- [ ] Sender verified
- [ ] Supabase configured
- [ ] Templates updated
- [ ] Testing completed

#### Switch to Production
- [ ] Update production Supabase settings
- [ ] Deploy updated templates
- [ ] Monitor first 24 hours closely
- [ ] Check delivery statistics

### ✅ **Post-Migration**

#### Monitoring
- [ ] Monitor delivery rates for 1 week
- [ ] Check spam folder placement
- [ ] Monitor bounce rates
- [ ] Check user feedback

#### Cleanup
- [ ] Remove old sender from Brevo (optional)
- [ ] Update documentation
- [ ] Update support contacts
- [ ] Archive old configuration

### 🚨 **Rollback Plan**

If issues occur:
1. Revert Supabase SMTP settings to hello@socialstudio.in
2. Revert email templates
3. Monitor for 24 hours
4. Investigate and fix issues
5. Retry migration

### 📞 **Support Contacts**

- Brevo Support: Available in dashboard
- Domain Registrar: Check your registrar's support
- Supabase Support: Available in dashboard

---

**Estimated Timeline**: 2-3 days for complete migration
**Critical Path**: Domain verification → Sender verification → DNS propagation → Testing
`;

  fs.writeFileSync('EMAIL_MIGRATION_CHECKLIST.md', checklist);
  console.log('✅ Migration checklist created: EMAIL_MIGRATION_CHECKLIST.md');
}

/**
 * Display setup summary
 */
function displaySetupSummary() {
  console.log('\n📊 MUJFOODCLUB.IN EMAIL SETUP SUMMARY');
  console.log('='.repeat(50));
  
  console.log('🎯 **Migration Goal**:');
  console.log(`   From: ${CONFIG.OLD_EMAIL}`);
  console.log(`   To: ${CONFIG.NEW_EMAIL}`);
  console.log('');
  
  console.log('📋 **Required Steps**:');
  console.log('1. ✅ Add mujfoodclub.in domain to Brevo');
  console.log('2. ✅ Verify domain in Brevo dashboard');
  console.log('3. ✅ Create support@mujfoodclub.in sender');
  console.log('4. ✅ Add DNS records to domain registrar');
  console.log('5. ✅ Update Supabase SMTP settings');
  console.log('6. ✅ Update email templates');
  console.log('7. ✅ Test email deliverability');
  console.log('');
  
  console.log('📁 **Files Created**:');
  console.log('   - mujfoodclub-dns-records.json');
  console.log('   - BREVO_MUJFOODCLUB_SETUP.md');
  console.log('   - mujfoodclub-email-templates/');
  console.log('   - EMAIL_MIGRATION_CHECKLIST.md');
  console.log('');
  
  console.log('⏰ **Timeline**:');
  console.log('   - Domain verification: 24-48 hours');
  console.log('   - DNS propagation: 24-48 hours');
  console.log('   - Total setup time: 2-3 days');
  console.log('');
  
  console.log('🚀 **Next Steps**:');
  console.log('1. Follow BREVO_MUJFOODCLUB_SETUP.md for Brevo configuration');
  console.log('2. Use EMAIL_MIGRATION_CHECKLIST.md for step-by-step migration');
  console.log('3. Add DNS records from mujfoodclub-dns-records.json');
  console.log('4. Update Supabase with new email templates');
  console.log('5. Test thoroughly before going live');
  console.log('');
}

/**
 * Main function
 */
function setupMujfoodclubEmail() {
  console.log('🚀 MUJFOODCLUB.IN EMAIL SETUP');
  console.log('='.repeat(40));
  console.log('Setting up support@mujfoodclub.in for email sending');
  console.log('');
  
  const dnsRecords = generateNewDNSRecords();
  createBrevoConfigGuide();
  createUpdatedEmailTemplates();
  createMigrationChecklist();
  displaySetupSummary();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMujfoodclubEmail();
}

export { setupMujfoodclubEmail };
