# 📧 Email Templates - Copy & Paste Ready

## 🎯 **For Supabase Email Template Updates**

---

## 📋 **Template 1: Confirmation Email**

### **Subject Line**:
```
Welcome to MUJ Food Club - Verify Your Email
```

### **HTML Template** (Copy this entire block):
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

### **Text Template** (Copy this entire block):
```
Welcome to MUJ Food Club!

Thank you for joining MUJ Food Club - your gateway to delicious food from campus cafes!

Please verify your email address by clicking the link below:
{{ .ConfirmationURL }}

Need help? Reply to this email or contact us at support@mujfoodclub.in

MUJ Food Club - Manipal University Jaipur
This email was sent to {{ .Email }}. If you didn't sign up, please ignore this email.
```

---

## 📋 **Template 2: Magic Link Email**

### **Subject Line**:
```
Your MUJ Food Club Login Link
```

### **HTML Template** (Copy this entire block):
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

### **Text Template** (Copy this entire block):
```
Your Login Link - MUJ Food Club

Hello!

You requested a login link for your MUJ Food Club account.

Click this link to login: {{ .ConfirmationURL }}

This link will expire in 1 hour for your security.

Need help? Reply to this email or contact us at support@mujfoodclub.in

MUJ Food Club - Manipal University Jaipur
```

---

## 📋 **SMTP Settings for Supabase**

### **In Supabase Dashboard → Authentication → Settings → SMTP Settings**:

- **Sender Email**: `support@mujfoodclub.in`
- **Sender Name**: `MUJ FOOD CLUB`
- **SMTP Host**: `smtp-relay.brevo.com`
- **SMTP Port**: `587`
- **SMTP Username**: [Your Brevo email]
- **SMTP Password**: [Your Brevo SMTP key]

---

## 🎯 **Quick Steps**:

1. **Go to Supabase Dashboard**
2. **Authentication → Email Templates**
3. **Update "Confirm signup" template** with Template 1 above
4. **Update "Magic Link" template** with Template 2 above
5. **Update SMTP Settings** with the settings above
6. **Save all changes**
7. **Test with a sample email**

---

## ⚠️ **Important**:
- **Don't change** `{{ .ConfirmationURL }}` or `{{ .Email }}` - these are variables
- **Test first** before going live
- **Wait for DNS propagation** (24-48 hours) for best results
