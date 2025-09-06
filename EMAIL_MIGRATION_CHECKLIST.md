# 📧 Email Domain Migration Checklist
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
