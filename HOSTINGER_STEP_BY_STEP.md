# 🌐 Hostinger DNS Setup - Step by Step

## 🎯 **Goal**: Add DNS records for `support@mujfoodclub.in`

---

## 📋 **Step 1: Login to Hostinger**

1. Go to **[hostinger.com](https://hostinger.com)**
2. Click **"Login"** (top right corner)
3. Enter your email and password
4. Click **"Login"**

---

## 📋 **Step 2: Find Your Domain**

1. After login, you'll see the **Control Panel**
2. Look for **"Domains"** section
3. Find **"mujfoodclub.in"** in the list
4. Click on **"mujfoodclub.in"** or **"Manage"**

---

## 📋 **Step 3: Open DNS Zone Editor**

1. In the domain management page
2. Look for **"DNS Zone Editor"**
3. Click on **"DNS Zone Editor"**
4. You'll see existing DNS records

---

## 📋 **Step 4: Add SPF Record**

1. Click **"Add Record"** or **"+"** button
2. Fill in these details:
   - **Type**: Select **"TXT"**
   - **Name**: Enter **"@"**
   - **Value**: Enter **"v=spf1 include:spf.brevo.com ~all"**
   - **TTL**: Enter **"3600"**
3. Click **"Save"**

---

## 📋 **Step 5: Add DMARC Record**

1. Click **"Add Record"** or **"+"** button again
2. Fill in these details:
   - **Type**: Select **"TXT"**
   - **Name**: Enter **"_dmarc"**
   - **Value**: Enter **"v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1"**
   - **TTL**: Enter **"3600"**
3. Click **"Save"**

---

## 📋 **Step 6: Add MX Record (Optional)**

1. Click **"Add Record"** or **"+"** button again
2. Fill in these details:
   - **Type**: Select **"MX"**
   - **Name**: Enter **"@"**
   - **Value**: Enter **"mx1.brevo.com"**
   - **Priority**: Enter **"10"**
   - **TTL**: Enter **"3600"**
3. Click **"Save"**

---

## ✅ **Final Result**

After adding all records, you should see:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | @ | v=spf1 include:spf.brevo.com ~all | 3600 |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1 | 3600 |
| MX | @ | mx1.brevo.com | 3600 |

---

## ⏰ **What Happens Next**

- **DNS Propagation**: Takes 24-48 hours
- **Brevo Verification**: Will verify your domain
- **Email Testing**: You can test email sending

---

## 🔍 **How to Verify**

1. **Wait 24-48 hours** for DNS propagation
2. **Use online tools**:
   - [mxtoolbox.com/spf.aspx](https://mxtoolbox.com/spf.aspx)
   - [dnschecker.org](https://dnschecker.org)
3. **Check Brevo dashboard** for domain verification

---

## 🚨 **If You Need Help**

- **Hostinger Support**: Live chat in control panel
- **Email**: support@hostinger.com
- **Response Time**: Usually within minutes

---

## 📞 **Quick Reference**

**Records to Add:**
- **SPF**: `v=spf1 include:spf.brevo.com ~all`
- **DMARC**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1`
- **MX**: `mx1.brevo.com` (Priority: 10)

**Timeline**: 24-48 hours for complete setup
