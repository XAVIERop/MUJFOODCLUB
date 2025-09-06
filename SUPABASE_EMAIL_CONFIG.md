# 📧 Supabase Email Configuration Guide

## 🔧 **Current Brevo SMTP Settings**

Update these settings in your Supabase Dashboard → Authentication → SMTP Settings:

```
Host: smtp-relay.brevo.com
Port: 587
Username: [Your Brevo Email]
Password: [Your Brevo SMTP Key]
Sender Email: hello@socialstudio.in
Sender Name: MUJ FOOD CLUB
```

## 📝 **Email Templates to Update**

### 1. Confirmation Email Template
- **Subject**: Welcome to MUJ Food Club - Verify Your Email
- **HTML**: Use the optimized template from email-templates/confirmation.html
- **Text**: Use the optimized template from email-templates/confirmation.txt

### 2. Magic Link Template
- **Subject**: Your MUJ Food Club Login Link
- **HTML**: Use the optimized template from email-templates/magic_link.html
- **Text**: Use the optimized template from email-templates/magic_link.txt

## 🎯 **Key Optimizations Applied**

### Content Optimizations
- ✅ Clear, descriptive subject lines
- ✅ Proper HTML structure with inline CSS
- ✅ Text version included for all emails
- ✅ Clear call-to-action buttons
- ✅ Proper sender information
- ✅ Unsubscribe information

### Spam Prevention
- ✅ Avoided spam trigger words
- ✅ Proper email-to-text ratio
- ✅ Clear sender identification
- ✅ Professional formatting
- ✅ Proper link structure

## 🔍 **Testing Checklist**

- [ ] Test email rendering in Gmail
- [ ] Test email rendering in Outlook
- [ ] Test email rendering in Yahoo
- [ ] Verify all links work correctly
- [ ] Check spam score with Mail-Tester
- [ ] Test on mobile devices

## 📊 **Monitoring**

After implementing these templates:
1. Monitor Brevo delivery statistics
2. Track open rates and click rates
3. Monitor bounce rates
4. Check spam complaint rates
5. Adjust templates based on performance

## 🚨 **Important Notes**

- Always test templates before deploying
- Keep backup of current templates
- Monitor deliverability after changes
- Update templates based on user feedback
- Regular A/B testing for optimization

---

**Next Steps**: 
1. Add DNS records (SPF, DKIM, DMARC)
2. Update Supabase email templates
3. Test deliverability
4. Monitor performance
