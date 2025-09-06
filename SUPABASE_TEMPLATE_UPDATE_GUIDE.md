# 📧 Supabase Email Template Update Guide

## 🎯 **Goal**: Update Supabase email templates for `support@mujfoodclub.in`

---

## 📋 **Step 1: Access Supabase Email Templates**

1. **Login to Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Login with your account
   - Select your project

2. **Navigate to Email Templates**
   - Go to **Authentication** → **Email Templates**
   - You'll see different template types

---

## 📋 **Step 2: Update Confirmation Email Template**

### **Template Type**: "Confirm signup"

1. **Click on "Confirm signup" template**
2. **Update the Subject Line**:
   ```
   Welcome to MUJ Food Club - Verify Your Email
   ```

3. **Replace the HTML Template** with this code:

```html
<!DOCTYPE html>
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
</html>
```

4. **Replace the Text Template** with this code:

```
Welcome to MUJ Food Club!

Thank you for joining MUJ Food Club - your gateway to delicious food from campus cafes!

Please verify your email address by clicking the link below:
{{ .ConfirmationURL }}

Need help? Reply to this email or contact us at support@mujfoodclub.in

MUJ Food Club - Manipal University Jaipur
This email was sent to {{ .Email }}. If you didn't sign up, please ignore this email.
```

5. **Click "Save"**

---

## 📋 **Step 3: Update Magic Link Template**

### **Template Type**: "Magic Link"

1. **Click on "Magic Link" template**
2. **Update the Subject Line**:
   ```
   Your MUJ Food Club Login Link
   ```

3. **Replace the HTML Template** with this code:

```html
<!DOCTYPE html>
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
</html>
```

4. **Replace the Text Template** with this code:

```
Your Login Link - MUJ Food Club

Hello!

You requested a login link for your MUJ Food Club account.

Click this link to login: {{ .ConfirmationURL }}

This link will expire in 1 hour for your security.

Need help? Reply to this email or contact us at support@mujfoodclub.in

MUJ Food Club - Manipal University Jaipur
```

5. **Click "Save"**

---

## 📋 **Step 4: Update SMTP Settings**

1. **Go to Authentication → Settings**
2. **Scroll down to "SMTP Settings"**
3. **Update these fields**:
   - **Sender Email**: `support@mujfoodclub.in`
   - **Sender Name**: `MUJ FOOD CLUB`
   - **SMTP Host**: `smtp-relay.brevo.com`
   - **SMTP Port**: `587`
   - **SMTP Username**: [Your Brevo email]
   - **SMTP Password**: [Your Brevo SMTP key]

4. **Click "Save"**

---

## 📋 **Step 5: Test the Templates**

1. **Go to Authentication → Users**
2. **Create a test user** or use existing user
3. **Send a test email** to verify:
   - Email arrives in inbox (not spam)
   - Sender shows as `support@mujfoodclub.in`
   - Templates render correctly
   - All links work properly

---

## ✅ **What You Should See**

### **After Template Updates**:
- **Subject**: "Welcome to MUJ Food Club - Verify Your Email"
- **Sender**: support@mujfoodclub.in
- **Content**: Professional MUJ Food Club branding
- **Contact**: support@mujfoodclub.in

### **Template Features**:
- ✅ Mobile-responsive design
- ✅ Clear call-to-action buttons
- ✅ Professional branding
- ✅ Updated contact information
- ✅ Spam-filter friendly

---

## 🚨 **Important Notes**

1. **Keep Variables**: Don't change `{{ .ConfirmationURL }}` or `{{ .Email }}`
2. **Test First**: Always test templates before going live
3. **Backup**: Take screenshots of current templates
4. **DNS Required**: Templates won't work until DNS records are added

---

## 🔍 **Troubleshooting**

### **If emails don't send**:
- Check SMTP settings are correct
- Verify Brevo sender is verified
- Check DNS records are propagated

### **If emails go to spam**:
- Wait for DNS propagation (24-48 hours)
- Check SPF and DMARC records
- Monitor Brevo delivery statistics

### **If templates don't render**:
- Check HTML syntax
- Test in different email clients
- Verify all variables are correct

---

## 📞 **Support**

- **Supabase Support**: Available in dashboard
- **Brevo Support**: Available in Brevo dashboard
- **Documentation**: Check Supabase docs for template variables

---

**Next Steps**: After updating templates, test email sending and monitor deliverability!
