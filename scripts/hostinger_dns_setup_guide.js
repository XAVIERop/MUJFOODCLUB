#!/usr/bin/env node

/**
 * Hostinger DNS Setup Guide for mujfoodclub.in
 * Step-by-step instructions for adding DNS records in Hostinger
 */

import fs from 'fs';

/**
 * Create detailed Hostinger DNS setup guide
 */
function createHostingerDNSGuide() {
  console.log('🌐 Creating Hostinger DNS setup guide...');
  
  const hostingerGuide = `# 🌐 Hostinger DNS Setup Guide for mujfoodclub.in

## 📋 **Step-by-Step Instructions**

### **Step 1: Login to Hostinger**
1. Go to [hostinger.com](https://hostinger.com)
2. Click **"Login"** in the top right corner
3. Enter your email and password
4. Click **"Login"**

### **Step 2: Access DNS Management**
1. After logging in, you'll see your **Hostinger Control Panel**
2. Look for **"Domains"** section
3. Find **"mujfoodclub.in"** in your domains list
4. Click on **"mujfoodclub.in"** or **"Manage"** button

### **Step 3: Open DNS Zone Editor**
1. In the domain management page, look for **"DNS Zone Editor"**
2. Click on **"DNS Zone Editor"**
3. You'll see a list of existing DNS records

### **Step 4: Add SPF Record**
1. Click **"Add Record"** or **"+"** button
2. Fill in the following details:
   - **Type**: Select **"TXT"** from dropdown
   - **Name**: Enter **"@"** (this represents the root domain)
   - **Value**: Enter **"v=spf1 include:spf.brevo.com ~all"**
   - **TTL**: Enter **"3600"** (or leave default)
3. Click **"Save"** or **"Add Record"**

### **Step 5: Add DMARC Record**
1. Click **"Add Record"** or **"+"** button again
2. Fill in the following details:
   - **Type**: Select **"TXT"** from dropdown
   - **Name**: Enter **"_dmarc"**
   - **Value**: Enter **"v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1"**
   - **TTL**: Enter **"3600"** (or leave default)
3. Click **"Save"** or **"Add Record"**

### **Step 6: Add MX Record (Optional)**
1. Click **"Add Record"** or **"+"** button again
2. Fill in the following details:
   - **Type**: Select **"MX"** from dropdown
   - **Name**: Enter **"@"** (this represents the root domain)
   - **Value**: Enter **"mx1.brevo.com"**
   - **Priority**: Enter **"10"**
   - **TTL**: Enter **"3600"** (or leave default)
3. Click **"Save"** or **"Add Record"**

### **Step 7: Verify Records**
After adding all records, you should see:
- **TXT** record with Name: **@** and Value: **v=spf1 include:spf.brevo.com ~all**
- **TXT** record with Name: **_dmarc** and Value: **v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1**
- **MX** record with Name: **@** and Value: **mx1.brevo.com** (Priority: 10)

## 🔍 **Visual Guide**

### **Hostinger Interface Layout**
\`\`\`
┌─────────────────────────────────────┐
│ Hostinger Control Panel             │
├─────────────────────────────────────┤
│ Domains                             │
│ ┌─────────────────────────────────┐ │
│ │ mujfoodclub.in                  │ │
│ │ [Manage] [DNS Zone Editor]      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
\`\`\`

### **DNS Zone Editor Interface**
\`\`\`
┌─────────────────────────────────────┐
│ DNS Zone Editor                     │
├─────────────────────────────────────┤
│ Type │ Name │ Value │ TTL │ Actions │
├─────────────────────────────────────┤
│ A    │ @    │ ...   │ ... │ [Edit]  │
│ CNAME│ www  │ ...   │ ... │ [Edit]  │
│ [Add Record]                        │
└─────────────────────────────────────┘
\`\`\`

## ⚠️ **Important Notes**

### **Before Adding Records**
- **Backup**: Take a screenshot of your current DNS records
- **Check**: Make sure you're in the correct domain (mujfoodclub.in)
- **Verify**: Double-check the record values before saving

### **After Adding Records**
- **Wait**: DNS changes take 24-48 hours to propagate
- **Test**: Use online tools to verify records
- **Monitor**: Check Brevo dashboard for domain verification

## 🧪 **Testing Your DNS Records**

### **Online Verification Tools**
1. **MXToolbox**: [mxtoolbox.com/spf.aspx](https://mxtoolbox.com/spf.aspx)
2. **DNS Checker**: [dnschecker.org](https://dnschecker.org)
3. **What's My DNS**: [whatsmydns.net](https://whatsmydns.net)

### **Command Line Testing**
\`\`\`bash
# Test SPF record
dig TXT mujfoodclub.in

# Test DMARC record
dig TXT _dmarc.mujfoodclub.in

# Test MX record
dig MX mujfoodclub.in
\`\`\`

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"Record already exists"**
- Check if you already have a TXT record for @
- You might need to edit the existing record instead of adding new one
- Look for existing SPF or DMARC records

#### **"Invalid format"**
- Double-check the record values
- Make sure there are no extra spaces
- Verify the record type is correct

#### **"Changes not showing"**
- DNS propagation takes 24-48 hours
- Use online tools to check propagation status
- Clear your browser cache and refresh

### **If Something Goes Wrong**
1. **Don't panic** - DNS changes are reversible
2. **Take screenshot** of current state
3. **Contact Hostinger support** if needed
4. **Use backup** to restore previous settings

## 📞 **Hostinger Support**

### **Contact Options**
- **Live Chat**: Available in Hostinger control panel
- **Email**: support@hostinger.com
- **Help Center**: [support.hostinger.com](https://support.hostinger.com)

### **Support Hours**
- **24/7 Live Chat**: Available
- **Response Time**: Usually within minutes

## ✅ **Final Checklist**

After completing all steps:
- [ ] SPF record added successfully
- [ ] DMARC record added successfully
- [ ] MX record added successfully (optional)
- [ ] All records show in DNS Zone Editor
- [ ] Screenshot taken of final configuration
- [ ] Online verification tools show correct records
- [ ] Brevo domain verification in progress

---

**Next Steps**: After DNS records are added and propagated, proceed with Brevo domain verification and Supabase configuration.
`;

  fs.writeFileSync('HOSTINGER_DNS_SETUP_GUIDE.md', hostingerGuide);
  console.log('✅ Hostinger DNS setup guide created: HOSTINGER_DNS_SETUP_GUIDE.md');
}

/**
 * Create visual DNS records reference
 */
function createDNSRecordsReference() {
  console.log('📋 Creating DNS records reference...');
  
  const dnsReference = {
    domain: 'mujfoodclub.in',
    records: [
      {
        step: 1,
        type: 'TXT',
        name: '@',
        value: 'v=spf1 include:spf.brevo.com ~all',
        ttl: 3600,
        description: 'SPF Record - Authorizes Brevo to send emails',
        purpose: 'Prevents emails from being marked as spam'
      },
      {
        step: 2,
        type: 'TXT',
        name: '_dmarc',
        value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1',
        ttl: 3600,
        description: 'DMARC Record - Email authentication policy',
        purpose: 'Tells email providers how to handle authentication failures'
      },
      {
        step: 3,
        type: 'MX',
        name: '@',
        value: 'mx1.brevo.com',
        priority: 10,
        ttl: 3600,
        description: 'MX Record - For receiving emails (optional)',
        purpose: 'Allows receiving emails at support@mujfoodclub.in'
      }
    ],
    notes: {
      propagation: 'DNS changes take 24-48 hours to propagate globally',
      verification: 'Use online tools to verify records after adding',
      backup: 'Always backup current DNS records before making changes',
      testing: 'Test email deliverability after DNS propagation'
    }
  };
  
  fs.writeFileSync('hostinger-dns-records-reference.json', JSON.stringify(dnsReference, null, 2));
  console.log('✅ DNS records reference created: hostinger-dns-records-reference.json');
}

/**
 * Display quick setup summary
 */
function displayQuickSetupSummary() {
  console.log('\n📋 QUICK HOSTINGER DNS SETUP SUMMARY');
  console.log('='.repeat(50));
  
  console.log('🎯 **Goal**: Add DNS records for support@mujfoodclub.in');
  console.log('🌐 **Domain**: mujfoodclub.in');
  console.log('🏢 **Provider**: Hostinger');
  console.log('');
  
  console.log('📝 **Records to Add**:');
  console.log('');
  
  console.log('1️⃣ **SPF Record (TXT)**');
  console.log('   Type: TXT');
  console.log('   Name: @');
  console.log('   Value: v=spf1 include:spf.brevo.com ~all');
  console.log('   TTL: 3600');
  console.log('');
  
  console.log('2️⃣ **DMARC Record (TXT)**');
  console.log('   Type: TXT');
  console.log('   Name: _dmarc');
  console.log('   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1');
  console.log('   TTL: 3600');
  console.log('');
  
  console.log('3️⃣ **MX Record (Optional)**');
  console.log('   Type: MX');
  console.log('   Name: @');
  console.log('   Value: mx1.brevo.com');
  console.log('   Priority: 10');
  console.log('   TTL: 3600');
  console.log('');
  
  console.log('🔧 **Steps in Hostinger**:');
  console.log('1. Login to hostinger.com');
  console.log('2. Go to Domains → mujfoodclub.in');
  console.log('3. Click "DNS Zone Editor"');
  console.log('4. Add each record above');
  console.log('5. Save and wait 24-48 hours');
  console.log('');
  
  console.log('📚 **Detailed Guide**: HOSTINGER_DNS_SETUP_GUIDE.md');
  console.log('📋 **Records Reference**: hostinger-dns-records-reference.json');
  console.log('');
}

/**
 * Main function
 */
function setupHostingerDNSGuide() {
  console.log('🌐 HOSTINGER DNS SETUP GUIDE');
  console.log('='.repeat(40));
  console.log('Creating step-by-step guide for mujfoodclub.in');
  console.log('');
  
  createHostingerDNSGuide();
  createDNSRecordsReference();
  displayQuickSetupSummary();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupHostingerDNSGuide();
}

export { setupHostingerDNSGuide };
