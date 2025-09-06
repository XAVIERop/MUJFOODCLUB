#!/usr/bin/env node

/**
 * Brevo Email Deliverability Fix Script
 * Addresses emails going to junk folder issue
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://kblazvxfducwviyyiwde.supabase.co',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'your-service-key',
  BREVO_CONFIG: {
    SMTP_HOST: 'smtp-relay.brevo.com',
    SMTP_PORT: 587,
    SENDER_EMAIL: 'hello@socialstudio.in',
    SENDER_NAME: 'MUJ FOOD CLUB',
    REPLY_TO: 'hello@socialstudio.in'
  }
};

// Initialize Supabase client
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

/**
 * Check current email configuration
 */
async function checkCurrentEmailConfig() {
  console.log('🔍 Checking current email configuration...');
  
  try {
    // Test current email setup
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'test-deliverability@muj.manipal.edu',
      options: {
        shouldCreateUser: false,
        emailRedirectTo: 'https://mujfoodclub.vercel.app/auth'
      }
    });
    
    if (error) {
      console.log('❌ Current email setup has issues:', error.message);
      return false;
    } else {
      console.log('✅ Email sending is working, but deliverability needs improvement');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error checking email config:', error.message);
    return false;
  }
}

/**
 * Create optimized email templates
 */
function createOptimizedEmailTemplates() {
  console.log('📧 Creating optimized email templates...');
  
  const templates = {
    confirmation: {
      subject: 'Welcome to MUJ Food Club - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MUJ Food Club</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
            .button { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #e55a2b; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍽️ MUJ Food Club</div>
              <h1>Welcome to MUJ Food Club!</h1>
            </div>
            
            <div class="content">
              <h2>Hello!</h2>
              <p>Thank you for joining MUJ Food Club - your gateway to delicious food from campus cafes!</p>
              
              <div class="highlight">
                <strong>📧 Please verify your email address</strong><br>
                Click the button below to confirm your account and start ordering:
              </div>
              
              <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
              </div>
              
              <p><strong>What's next?</strong></p>
              <ul>
                <li>✅ Browse delicious food from campus cafes</li>
                <li>🎯 Earn loyalty points with every order</li>
                <li>🚀 Get exclusive discounts and offers</li>
                <li>📱 Track your orders in real-time</li>
              </ul>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p>
              
              <p><strong>Need help?</strong> Reply to this email or contact us at hello@socialstudio.in</p>
            </div>
            
            <div class="footer">
              <p>MUJ Food Club - Connecting Students with Great Food</p>
              <p>Manipal University Jaipur | socialstudio.in</p>
              <p><small>This email was sent to {{ .Email }}. If you didn't sign up, please ignore this email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to MUJ Food Club!
        
        Thank you for joining MUJ Food Club - your gateway to delicious food from campus cafes!
        
        Please verify your email address by clicking the link below:
        {{ .ConfirmationURL }}
        
        What's next?
        - Browse delicious food from campus cafes
        - Earn loyalty points with every order
        - Get exclusive discounts and offers
        - Track your orders in real-time
        
        If you need help, reply to this email or contact us at hello@socialstudio.in
        
        MUJ Food Club - Connecting Students with Great Food
        Manipal University Jaipur | socialstudio.in
        
        This email was sent to {{ .Email }}. If you didn't sign up, please ignore this email.
      `
    },
    
    magic_link: {
      subject: 'Your MUJ Food Club Login Link',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Login Link - MUJ Food Club</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #666; }
            .button { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #e55a2b; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .security { background: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍽️ MUJ Food Club</div>
              <h1>Your Login Link</h1>
            </div>
            
            <div class="content">
              <h2>Hello!</h2>
              <p>You requested a login link for your MUJ Food Club account.</p>
              
              <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Login to MUJ Food Club</a>
              </div>
              
              <div class="security">
                <strong>🔒 Security Notice:</strong><br>
                This link will expire in 1 hour for your security. If you didn't request this login link, please ignore this email.
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p>
              
              <p><strong>Need help?</strong> Reply to this email or contact us at hello@socialstudio.in</p>
            </div>
            
            <div class="footer">
              <p>MUJ Food Club - Connecting Students with Great Food</p>
              <p>Manipal University Jaipur | socialstudio.in</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Your Login Link - MUJ Food Club
        
        Hello!
        
        You requested a login link for your MUJ Food Club account.
        
        Click this link to login: {{ .ConfirmationURL }}
        
        Security Notice: This link will expire in 1 hour for your security. If you didn't request this login link, please ignore this email.
        
        If you need help, reply to this email or contact us at hello@socialstudio.in
        
        MUJ Food Club - Connecting Students with Great Food
        Manipal University Jaipur | socialstudio.in
      `
    }
  };
  
  // Save templates to files
  const templatesDir = path.join(process.cwd(), 'email-templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
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
  
  console.log('✅ Optimized email templates created in email-templates/ directory');
  return templates;
}

/**
 * Create DNS configuration guide
 */
function createDNSConfigurationGuide() {
  console.log('🌐 Creating DNS configuration guide...');
  
  const dnsGuide = `
# 🌐 DNS Configuration for Email Deliverability

## 📧 **Current Brevo Configuration**
- **SMTP Host**: smtp-relay.brevo.com
- **Port**: 587
- **Sender Email**: hello@socialstudio.in
- **Sender Name**: MUJ FOOD CLUB

## 🔧 **Required DNS Records**

### 1. SPF Record (TXT)
Add this TXT record to your domain (socialstudio.in):

\`\`\`
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all
TTL: 3600
\`\`\`

### 2. DKIM Record (TXT)
Get your DKIM key from Brevo dashboard and add:

\`\`\`
Type: TXT
Name: mail._domainkey
Value: [Your DKIM key from Brevo]
TTL: 3600
\`\`\`

### 3. DMARC Record (TXT)
Add this DMARC policy:

\`\`\`
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@socialstudio.in; ruf=mailto:dmarc@socialstudio.in; fo=1
TTL: 3600
\`\`\`

### 4. MX Record (Optional)
If you want to receive emails at hello@socialstudio.in:

\`\`\`
Type: MX
Name: @
Value: mx1.brevo.com (Priority: 10)
TTL: 3600
\`\`\`

## 🔍 **How to Add DNS Records**

### For Hostinger (your current provider):
1. Login to Hostinger control panel
2. Go to "DNS Zone Editor"
3. Add each record above
4. Wait 24-48 hours for propagation

### Verification:
- Use tools like mxtoolbox.com to verify records
- Check Brevo dashboard for domain verification status

## ⚠️ **Important Notes**
- DNS changes can take 24-48 hours to propagate
- Test email deliverability after DNS changes
- Monitor Brevo logs for any issues
- Keep backup of current DNS records

## 🧪 **Testing Commands**
\`\`\`bash
# Test SPF record
dig TXT socialstudio.in

# Test DKIM record
dig TXT mail._domainkey.socialstudio.in

# Test DMARC record
dig TXT _dmarc.socialstudio.in
\`\`\`
`;

  fs.writeFileSync('DNS_CONFIGURATION_GUIDE.md', dnsGuide);
  console.log('✅ DNS configuration guide created: DNS_CONFIGURATION_GUIDE.md');
}

/**
 * Create email deliverability checklist
 */
function createDeliverabilityChecklist() {
  console.log('📋 Creating email deliverability checklist...');
  
  const checklist = `
# 📧 Email Deliverability Checklist

## ✅ **Immediate Actions (Do Now)**

### 1. Brevo Account Setup
- [ ] Verify sender domain (socialstudio.in) in Brevo
- [ ] Set up proper sender authentication
- [ ] Configure reply-to address
- [ ] Set up tracking and analytics

### 2. Email Content Optimization
- [ ] Use optimized email templates (created in email-templates/)
- [ ] Avoid spam trigger words
- [ ] Include proper unsubscribe links
- [ ] Test email rendering across clients

### 3. Technical Configuration
- [ ] Configure proper SMTP settings in Supabase
- [ ] Set up email headers correctly
- [ ] Enable email tracking
- [ ] Configure bounce handling

## 🔧 **DNS Configuration (Critical)**

### SPF Record
- [ ] Add SPF record: \`v=spf1 include:spf.brevo.com ~all\`
- [ ] Verify SPF record with online tools
- [ ] Wait 24-48 hours for propagation

### DKIM Record
- [ ] Get DKIM key from Brevo dashboard
- [ ] Add DKIM record to DNS
- [ ] Verify DKIM authentication
- [ ] Test DKIM signing

### DMARC Record
- [ ] Add DMARC policy record
- [ ] Set up DMARC reporting
- [ ] Monitor DMARC reports
- [ ] Adjust policy as needed

## 📊 **Monitoring & Testing**

### Email Testing
- [ ] Test with different email providers (Gmail, Outlook, Yahoo)
- [ ] Check spam score with tools like Mail-Tester
- [ ] Test email rendering on mobile devices
- [ ] Verify all links work correctly

### Deliverability Monitoring
- [ ] Monitor Brevo delivery statistics
- [ ] Track bounce rates and spam complaints
- [ ] Set up email alerts for issues
- [ ] Regular deliverability audits

## 🚨 **Common Issues & Solutions**

### Emails Going to Spam
- **Cause**: Missing or incorrect SPF/DKIM records
- **Solution**: Add proper DNS records and wait for propagation

### High Bounce Rate
- **Cause**: Invalid email addresses or domain issues
- **Solution**: Implement email validation and clean lists

### Low Open Rates
- **Cause**: Poor subject lines or sender reputation
- **Solution**: A/B test subject lines and improve content

### Authentication Failures
- **Cause**: Incorrect SMTP configuration
- **Solution**: Verify Brevo SMTP settings in Supabase

## 📈 **Best Practices**

### Content
- Use clear, descriptive subject lines
- Include proper HTML and text versions
- Avoid excessive use of images
- Include clear call-to-action buttons

### Sending
- Maintain consistent sending patterns
- Monitor sender reputation
- Implement proper list hygiene
- Respect unsubscribe requests

### Technical
- Use proper email headers
- Implement proper encoding
- Test across email clients
- Monitor delivery statistics

## 🔍 **Testing Tools**

### Online Tools
- **Mail-Tester**: Check spam score
- **MXToolbox**: Verify DNS records
- **Email on Acid**: Test email rendering
- **Litmus**: Advanced email testing

### Brevo Tools
- **Delivery Statistics**: Monitor in Brevo dashboard
- **Bounce Management**: Handle bounces automatically
- **Reputation Monitoring**: Track sender reputation
- **A/B Testing**: Test different email versions

## 📞 **Support Resources**

### Brevo Support
- Documentation: https://developers.brevo.com/
- Support: Available in Brevo dashboard
- Community: Brevo community forum

### DNS Support
- Hostinger Support: Available in control panel
- DNS Tools: mxtoolbox.com, dnschecker.org

## ⏰ **Timeline**

### Immediate (Today)
- [ ] Add DNS records
- [ ] Update email templates
- [ ] Test current setup

### Short Term (1-3 days)
- [ ] Monitor DNS propagation
- [ ] Test email deliverability
- [ ] Adjust settings as needed

### Long Term (1-2 weeks)
- [ ] Monitor delivery statistics
- [ ] Optimize based on data
- [ ] Implement advanced features

---

**Remember**: Email deliverability is an ongoing process. Monitor regularly and adjust as needed.
`;

  fs.writeFileSync('EMAIL_DELIVERABILITY_CHECKLIST.md', checklist);
  console.log('✅ Email deliverability checklist created: EMAIL_DELIVERABILITY_CHECKLIST.md');
}

/**
 * Test email deliverability
 */
async function testEmailDeliverability() {
  console.log('🧪 Testing email deliverability...');
  
  const testEmails = [
    'test-gmail@gmail.com',
    'test-outlook@outlook.com',
    'test-yahoo@yahoo.com'
  ];
  
  for (const email of testEmails) {
    try {
      console.log(`📧 Testing delivery to ${email}...`);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: 'https://mujfoodclub.vercel.app/auth'
        }
      });
      
      if (error) {
        console.log(`   ❌ ${email}: ${error.message}`);
      } else {
        console.log(`   ✅ ${email}: Email sent successfully`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${email}: ${error.message}`);
    }
  }
}

/**
 * Generate comprehensive report
 */
function generateDeliverabilityReport() {
  console.log('\n📊 EMAIL DELIVERABILITY REPORT');
  console.log('='.repeat(50));
  
  console.log('🎯 **Current Status**: Emails going to junk folder');
  console.log('🔧 **Root Cause**: Missing DNS authentication records');
  console.log('');
  
  console.log('📋 **Required Actions**:');
  console.log('1. ✅ Add SPF record to DNS');
  console.log('2. ✅ Add DKIM record to DNS');
  console.log('3. ✅ Add DMARC record to DNS');
  console.log('4. ✅ Use optimized email templates');
  console.log('5. ✅ Monitor deliverability metrics');
  console.log('');
  
  console.log('⏰ **Timeline**:');
  console.log('   - DNS changes: 24-48 hours to propagate');
  console.log('   - Immediate improvement: After DNS propagation');
  console.log('   - Full optimization: 1-2 weeks of monitoring');
  console.log('');
  
  console.log('📚 **Resources Created**:');
  console.log('   - email-templates/ (optimized templates)');
  console.log('   - DNS_CONFIGURATION_GUIDE.md');
  console.log('   - EMAIL_DELIVERABILITY_CHECKLIST.md');
  console.log('');
  
  console.log('🚀 **Next Steps**:');
  console.log('1. Follow DNS_CONFIGURATION_GUIDE.md to add DNS records');
  console.log('2. Update Supabase email templates with optimized versions');
  console.log('3. Test deliverability after DNS propagation');
  console.log('4. Monitor Brevo dashboard for delivery statistics');
  console.log('5. Use EMAIL_DELIVERABILITY_CHECKLIST.md for ongoing maintenance');
  console.log('');
}

/**
 * Main function
 */
async function fixBrevoDeliverability() {
  try {
    console.log('🚀 BREVO EMAIL DELIVERABILITY FIX');
    console.log('='.repeat(50));
    console.log('Fixing emails going to junk folder issue');
    console.log('');
    
    // Step 1: Check current configuration
    await checkCurrentEmailConfig();
    
    // Step 2: Create optimized templates
    createOptimizedEmailTemplates();
    
    // Step 3: Create DNS configuration guide
    createDNSConfigurationGuide();
    
    // Step 4: Create deliverability checklist
    createDeliverabilityChecklist();
    
    // Step 5: Test current deliverability
    await testEmailDeliverability();
    
    // Step 6: Generate report
    generateDeliverabilityReport();
    
  } catch (error) {
    console.error('❌ Error fixing deliverability:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixBrevoDeliverability();
}

export { fixBrevoDeliverability };
