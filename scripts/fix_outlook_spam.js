#!/usr/bin/env node

/**
 * Fix Outlook Spam Issue Script
 * Addresses emails going to spam in Outlook specifically
 */

import fs from 'fs';
import path from 'path';

/**
 * Create Outlook-specific spam fix guide
 */
function createOutlookSpamFixGuide() {
  console.log('📧 Creating Outlook spam fix guide...');
  
  const outlookGuide = `# 🚨 Fix Outlook Spam Issue - support@mujfoodclub.in

## 🎯 **Problem**: Emails going to spam in Outlook

## 🔍 **Root Causes & Solutions**

### **1. DNS Records Issues**

#### **Check Current DNS Records**
Run these commands to verify your DNS records:

\`\`\`bash
# Check SPF record
dig TXT mujfoodclub.in

# Check DMARC record
dig TXT _dmarc.mujfoodclub.in

# Check MX record
dig MX mujfoodclub.in
\`\`\`

#### **Expected Results**:
- **SPF**: \`v=spf1 include:spf.brevo.com ~all\`
- **DMARC**: \`v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1\`
- **MX**: \`mx1.brevo.com\`

#### **If Records Are Missing**:
1. Go to your domain registrar (Hostinger)
2. Add the missing DNS records
3. Wait 24-48 hours for propagation

### **2. Brevo Domain Verification**

#### **Check Brevo Dashboard**:
1. Login to Brevo dashboard
2. Go to **Settings** → **Senders & IP** → **Domains**
3. Verify \`mujfoodclub.in\` shows as **"Verified"**
4. If not verified, follow the verification process

#### **Check Sender Status**:
1. Go to **Settings** → **Senders & IP** → **Senders**
2. Verify \`support@mujfoodclub.in\` shows as **"Verified"**
3. If not verified, check your email for verification link

### **3. Outlook-Specific Issues**

#### **Outlook Spam Filters**:
Outlook has strict spam filters that check:
- **Sender reputation**
- **Domain reputation**
- **Email content**
- **Authentication records**

#### **Common Outlook Spam Triggers**:
- Missing or incorrect SPF records
- No DMARC policy
- Poor sender reputation
- Suspicious email content
- High bounce rates

### **4. Email Content Optimization**

#### **Avoid Spam Trigger Words**:
- ❌ "Free", "Win", "Congratulations", "Urgent"
- ❌ Excessive exclamation marks (!!!)
- ❌ ALL CAPS text
- ❌ Too many links
- ❌ Suspicious attachments

#### **Use Professional Language**:
- ✅ Clear, professional subject lines
- ✅ Proper grammar and spelling
- ✅ Minimal use of special characters
- ✅ Balanced text-to-image ratio

### **5. Sender Reputation**

#### **Build Good Reputation**:
1. **Start with small volumes** (don't send to thousands at once)
2. **Monitor bounce rates** (keep under 5%)
3. **Avoid spam complaints** (keep under 0.1%)
4. **Use consistent sending patterns**
5. **Clean your email lists** regularly

## 🔧 **Immediate Actions**

### **Step 1: Verify DNS Records**
\`\`\`bash
# Test SPF record
dig TXT mujfoodclub.in | grep "v=spf1"

# Test DMARC record
dig TXT _dmarc.mujfoodclub.in | grep "v=DMARC1"

# Test MX record
dig MX mujfoodclub.in | grep "mx1.brevo.com"
\`\`\`

### **Step 2: Check Brevo Status**
1. Login to Brevo dashboard
2. Verify domain and sender status
3. Check delivery statistics
4. Look for any warnings or issues

### **Step 3: Test Email Deliverability**
Use these online tools:
- **MXToolbox**: [mxtoolbox.com/spf.aspx](https://mxtoolbox.com/spf.aspx)
- **Mail-Tester**: [mail-tester.com](https://mail-tester.com)
- **GlockApps**: [glockapps.com](https://glockapps.com)

### **Step 4: Optimize Email Content**
Update your email templates to be more Outlook-friendly:
- Remove excessive formatting
- Use simple, clear language
- Minimize images and links
- Include proper unsubscribe information

## 📊 **Testing Strategy**

### **Test with Different Email Providers**:
1. **Gmail** - Should work well
2. **Outlook/Hotmail** - Currently going to spam
3. **Yahoo** - Test for comparison
4. **Corporate emails** - Test with university emails

### **Test Different Scenarios**:
1. **New user signup** - Confirmation email
2. **Magic link** - Login email
3. **Password reset** - If implemented
4. **Newsletter** - If implemented

## 🚨 **Emergency Fixes**

### **If DNS Records Are Missing**:
1. **Add SPF record immediately**:
   \`\`\`
   Type: TXT
   Name: @
   Value: v=spf1 include:spf.brevo.com ~all
   \`\`\`

2. **Add DMARC record**:
   \`\`\`
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1
   \`\`\`

### **If Brevo Domain Is Not Verified**:
1. Go to Brevo dashboard
2. Add \`mujfoodclub.in\` domain
3. Follow verification process
4. Add required DNS records
5. Wait for verification

### **If Sender Is Not Verified**:
1. Check email for verification link
2. Click verification link
3. Confirm in Brevo dashboard
4. Test email sending

## 📈 **Long-term Solutions**

### **1. Warm Up Your Domain**:
- Start with small email volumes
- Gradually increase sending volume
- Monitor delivery rates closely
- Maintain good engagement rates

### **2. Monitor Reputation**:
- Check Brevo delivery statistics daily
- Monitor bounce rates and spam complaints
- Use reputation monitoring tools
- Address issues immediately

### **3. Content Optimization**:
- A/B test different subject lines
- Optimize email content for engagement
- Use proper email formatting
- Include clear call-to-action buttons

### **4. List Management**:
- Clean email lists regularly
- Remove bounced emails immediately
- Honor unsubscribe requests quickly
- Segment your audience properly

## 🔍 **Diagnostic Commands**

### **Check DNS Propagation**:
\`\`\`bash
# Check SPF record globally
dig @8.8.8.8 TXT mujfoodclub.in

# Check DMARC record globally
dig @8.8.8.8 TXT _dmarc.mujfoodclub.in

# Check MX record globally
dig @8.8.8.8 MX mujfoodclub.in
\`\`\`

### **Test Email Authentication**:
\`\`\`bash
# Test SPF authentication
dig TXT mujfoodclub.in | grep -i spf

# Test DMARC policy
dig TXT _dmarc.mujfoodclub.in | grep -i dmarc
\`\`\`

## 📞 **Support Resources**

### **Brevo Support**:
- **Dashboard**: Check delivery statistics
- **Support**: Available in Brevo dashboard
- **Documentation**: [developers.brevo.com](https://developers.brevo.com)

### **Domain Registrar Support**:
- **Hostinger**: Live chat in control panel
- **DNS Tools**: [dnschecker.org](https://dnschecker.org)

### **Email Testing Tools**:
- **MXToolbox**: [mxtoolbox.com](https://mxtoolbox.com)
- **Mail-Tester**: [mail-tester.com](https://mail-tester.com)
- **GlockApps**: [glockapps.com](https://glockapps.com)

## ⏰ **Timeline**

### **Immediate (Today)**:
- [ ] Check DNS records
- [ ] Verify Brevo domain status
- [ ] Test email deliverability

### **Short-term (1-3 days)**:
- [ ] Fix any missing DNS records
- [ ] Optimize email content
- [ ] Test with different providers

### **Long-term (1-2 weeks)**:
- [ ] Monitor delivery statistics
- [ ] Build sender reputation
- [ ] Optimize based on data

---

**Remember**: Outlook spam filters are strict, but with proper DNS records and good practices, your emails will reach the inbox!
`;

  fs.writeFileSync('OUTLOOK_SPAM_FIX_GUIDE.md', outlookGuide);
  console.log('✅ Outlook spam fix guide created: OUTLOOK_SPAM_FIX_GUIDE.md');
}

/**
 * Create diagnostic script
 */
function createDiagnosticScript() {
  console.log('🔍 Creating diagnostic script...');
  
  const diagnosticScript = `#!/usr/bin/env node

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
    const command = \`dig TXT \${name}.\${DOMAIN}\`;
    const result = execSync(command, { encoding: 'utf8' });
    
    if (result.includes(expectedValue)) {
      console.log(\`✅ \${type} record: OK\`);
      return true;
    } else {
      console.log(\`❌ \${type} record: MISSING or INCORRECT\`);
      console.log(\`   Expected: \${expectedValue}\`);
      return false;
    }
  } catch (error) {
    console.log(\`❌ \${type} record: ERROR checking\`);
    return false;
  }
}

/**
 * Check MX record
 */
function checkMXRecord() {
  try {
    const command = \`dig MX \${DOMAIN}\`;
    const result = execSync(command, { encoding: 'utf8' });
    
    if (result.includes('mx1.brevo.com')) {
      console.log(\`✅ MX record: OK\`);
      return true;
    } else {
      console.log(\`❌ MX record: MISSING or INCORRECT\`);
      console.log(\`   Expected: mx1.brevo.com\`);
      return false;
    }
  } catch (error) {
    console.log(\`❌ MX record: ERROR checking\`);
    return false;
  }
}

/**
 * Main diagnostic function
 */
function runDiagnostics() {
  console.log('🔍 EMAIL DELIVERABILITY DIAGNOSTICS');
  console.log('='.repeat(50));
  console.log(\`Domain: \${DOMAIN}\`);
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
`;

  fs.writeFileSync('scripts/diagnose_email_deliverability.js', diagnosticScript);
  console.log('✅ Diagnostic script created: scripts/diagnose_email_deliverability.js');
}

/**
 * Create Outlook-specific email template
 */
function createOutlookOptimizedTemplate() {
  console.log('📧 Creating Outlook-optimized email template...');
  
  const outlookTemplate = {
    subject: 'MUJ Food Club - Verify Your Email',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MUJ Food Club - Verify Your Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ff6b35; color: white; padding: 20px; text-align: center; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #e55a2b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MUJ Food Club</h1>
      <p>Welcome to your campus food ordering platform</p>
    </div>
    
    <div class="content">
      <h2>Hello!</h2>
      <p>Thank you for joining MUJ Food Club. We're excited to have you on board!</p>
      
      <p>To get started, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">{{ .ConfirmationURL }}</p>
      
      <p>Once verified, you'll be able to:</p>
      <ul>
        <li>Browse delicious food from campus cafes</li>
        <li>Place orders and track them in real-time</li>
        <li>Earn loyalty points with every order</li>
        <li>Get exclusive discounts and offers</li>
      </ul>
      
      <p>If you have any questions, please reply to this email or contact us at support@mujfoodclub.in</p>
      
      <p>Best regards,<br>The MUJ Food Club Team</p>
    </div>
    
    <div class="footer">
      <p>MUJ Food Club - Manipal University Jaipur</p>
      <p>This email was sent to {{ .Email }}. If you didn't sign up for MUJ Food Club, please ignore this email.</p>
      <p>You can unsubscribe from these emails at any time.</p>
    </div>
  </div>
</body>
</html>`,
    text: `MUJ Food Club - Verify Your Email

Hello!

Thank you for joining MUJ Food Club. We're excited to have you on board!

To get started, please verify your email address by clicking the link below:
{{ .ConfirmationURL }}

Once verified, you'll be able to:
- Browse delicious food from campus cafes
- Place orders and track them in real-time
- Earn loyalty points with every order
- Get exclusive discounts and offers

If you have any questions, please reply to this email or contact us at support@mujfoodclub.in

Best regards,
The MUJ Food Club Team

MUJ Food Club - Manipal University Jaipur
This email was sent to {{ .Email }}. If you didn't sign up for MUJ Food Club, please ignore this email.
You can unsubscribe from these emails at any time.`
  };
  
  // Save template to file
  fs.writeFileSync('outlook-optimized-template.html', outlookTemplate.html);
  fs.writeFileSync('outlook-optimized-template.txt', outlookTemplate.text);
  
  console.log('✅ Outlook-optimized template created');
  return outlookTemplate;
}

/**
 * Display troubleshooting summary
 */
function displayTroubleshootingSummary() {
  console.log('\n🚨 OUTLOOK SPAM TROUBLESHOOTING SUMMARY');
  console.log('='.repeat(50));
  
  console.log('🎯 **Problem**: Emails going to spam in Outlook');
  console.log('📧 **Domain**: support@mujfoodclub.in');
  console.log('');
  
  console.log('🔍 **Most Common Causes**:');
  console.log('1. ❌ Missing or incorrect SPF record');
  console.log('2. ❌ Missing or incorrect DMARC record');
  console.log('3. ❌ Brevo domain not verified');
  console.log('4. ❌ Sender not verified in Brevo');
  console.log('5. ❌ Poor sender reputation');
  console.log('');
  
  console.log('🔧 **Immediate Actions**:');
  console.log('1. ✅ Check DNS records with diagnostic script');
  console.log('2. ✅ Verify Brevo domain and sender status');
  console.log('3. ✅ Test email deliverability');
  console.log('4. ✅ Optimize email content');
  console.log('');
  
  console.log('📊 **Testing Strategy**:');
  console.log('- Test with Gmail (should work)');
  console.log('- Test with Outlook (currently failing)');
  console.log('- Test with Yahoo (for comparison)');
  console.log('- Test with university emails');
  console.log('');
  
  console.log('⏰ **Timeline**:');
  console.log('- DNS fixes: 24-48 hours');
  console.log('- Reputation building: 1-2 weeks');
  console.log('- Full optimization: 2-4 weeks');
  console.log('');
  
  console.log('📚 **Resources Created**:');
  console.log('- OUTLOOK_SPAM_FIX_GUIDE.md (detailed guide)');
  console.log('- scripts/diagnose_email_deliverability.js (diagnostic tool)');
  console.log('- outlook-optimized-template.html (optimized template)');
  console.log('- outlook-optimized-template.txt (text version)');
  console.log('');
}

/**
 * Main function
 */
function fixOutlookSpam() {
  console.log('🚨 OUTLOOK SPAM FIX');
  console.log('='.repeat(30));
  console.log('Fixing emails going to spam in Outlook');
  console.log('');
  
  createOutlookSpamFixGuide();
  createDiagnosticScript();
  createOutlookOptimizedTemplate();
  displayTroubleshootingSummary();
  
  console.log('🚀 **Next Steps**:');
  console.log('1. Run diagnostic script: node scripts/diagnose_email_deliverability.js');
  console.log('2. Check DNS records and fix any issues');
  console.log('3. Verify Brevo domain and sender status');
  console.log('4. Test with optimized email template');
  console.log('5. Monitor delivery statistics');
  console.log('');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixOutlookSpam();
}

export { fixOutlookSpam };
