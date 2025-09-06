# 🌐 Hostinger DNS Setup Guide for mujfoodclub.in

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
```
┌─────────────────────────────────────┐
│ Hostinger Control Panel             │
├─────────────────────────────────────┤
│ Domains                             │
│ ┌─────────────────────────────────┐ │
│ │ mujfoodclub.in                  │ │
│ │ [Manage] [DNS Zone Editor]      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **DNS Zone Editor Interface**
```
┌─────────────────────────────────────┐
│ DNS Zone Editor                     │
├─────────────────────────────────────┤
│ Type │ Name │ Value │ TTL │ Actions │
├─────────────────────────────────────┤
│ A    │ @    │ ...   │ ... │ [Edit]  │
│ CNAME│ www  │ ...   │ ... │ [Edit]  │
│ [Add Record]                        │
└─────────────────────────────────────┘
```

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
```bash
# Test SPF record
dig TXT mujfoodclub.in

# Test DMARC record
dig TXT _dmarc.mujfoodclub.in

# Test MX record
dig MX mujfoodclub.in
```

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
