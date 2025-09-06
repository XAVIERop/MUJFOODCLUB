# 📧 Brevo Configuration for support@mujfoodclub.in

## 🔧 **Step 1: Domain Verification in Brevo**

### Add Domain to Brevo
1. Login to your Brevo dashboard
2. Go to **Settings** → **Senders & IP** → **Domains**
3. Click **Add a domain**
4. Enter: `mujfoodclub.in`
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

```
Host: smtp-relay.brevo.com
Port: 587
Username: [Your Brevo Email]
Password: [Your Brevo SMTP Key]
Sender Email: support@mujfoodclub.in
Sender Name: MUJ FOOD CLUB
```

## 🔧 **Step 4: Email Templates Update**

### Update Template Variables
Replace all instances of `hello@socialstudio.in` with `support@mujfoodclub.in` in:
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
```
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all
TTL: 3600
```

### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@mujfoodclub.in; ruf=mailto:dmarc@mujfoodclub.in; fo=1
TTL: 3600
```

### MX Record (Optional)
```
Type: MX
Name: @
Value: mx1.brevo.com
Priority: 10
TTL: 3600
```

## 🔧 **Step 6: Testing**

### Test Email Sending
1. Send test emails to different providers
2. Check deliverability rates
3. Monitor spam folder placement
4. Verify all links work correctly

### Verification Commands
```bash
# Test SPF record
dig TXT mujfoodclub.in

# Test DMARC record
dig TXT _dmarc.mujfoodclub.in

# Test MX record
dig MX mujfoodclub.in
```

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
