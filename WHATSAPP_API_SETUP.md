# WhatsApp API Setup Guide

## 🚀 Quick Setup Options

### Option 1: Twilio WhatsApp API (Recommended - Easiest)

1. **Sign up at Twilio**: https://www.twilio.com
2. **Get your credentials**:
   - Account SID
   - Auth Token
   - WhatsApp Sandbox Number (for testing)

3. **Create `.env.local` file** in your project root:
```env
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
VITE_WHATSAPP_SANDBOX_MODE=true
```

4. **For production**, replace with your actual WhatsApp Business number:
```env
VITE_TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
```

### Option 2: Meta WhatsApp Business API (Free Tier)

1. **Go to Meta for Developers**: https://developers.facebook.com
2. **Create a WhatsApp Business App**
3. **Get your credentials**:
   - Access Token
   - Phone Number ID
   - Business Account ID

4. **Add to `.env.local`**:
```env
VITE_META_WHATSAPP_ACCESS_TOKEN=your_access_token_here
VITE_META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
VITE_META_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

## 🧪 Testing

1. **Set up your chosen API** (Twilio or Meta)
2. **Add credentials to `.env.local`**
3. **Restart your development server**
4. **Test on WhatsApp test page**: `http://localhost:8080/whatsapp-test`

## 📱 How It Works

- **Twilio**: Sends messages directly via their API
- **Meta**: Sends messages via Facebook Graph API
- **Fallback**: Opens WhatsApp Web if no API is configured

## 💰 Costs

- **Twilio**: ~$0.005 per message
- **Meta**: Free for first 1,000 messages/month
- **WhatsApp Web**: Free (but requires manual sending)

## 🔧 Backend Setup (For Twilio)

If using Twilio, you'll need a backend endpoint. Create this in your backend:

```javascript
// Backend API endpoint
app.post('/api/whatsapp/send', async (req, res) => {
  const { to, message, from } = req.body;
  
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  try {
    const result = await client.messages.create({
      body: message,
      from: from,
      to: to
    });
    
    res.json({ success: true, messageId: result.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```
