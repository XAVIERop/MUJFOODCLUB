# WhatsApp Webhook Setup Guide

## 🚀 Step-by-Step Setup for Automatic WhatsApp Quick Actions

### ✅ Step 1: Webhook Server Created
- ✅ Created `server/whatsapp-webhook.js` - Main webhook endpoint
- ✅ Created `server/package.json` - Dependencies and scripts
- ✅ Created `server/.env` - Environment configuration
- ✅ Created `server/test-webhook.js` - Test script

### 🔧 Step 2: Set Up Local Development

#### 2.1 Install Dependencies
```bash
cd server
npm install
```

#### 2.2 Configure Environment Variables
Edit `server/.env` and add your actual Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
```

#### 2.3 Start the Webhook Server
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 🌐 Step 3: Deploy to Production

#### Option A: Deploy to Vercel (Recommended)
1. **Install Vercel CLI**: `npm i -g vercel`
2. **Deploy**: `vercel --prod`
3. **Get the webhook URL**: `https://your-app.vercel.app/whatsapp-webhook`

#### Option B: Deploy to Railway
1. **Connect GitHub repository**
2. **Set environment variables**
3. **Deploy automatically**

#### Option C: Deploy to Heroku
1. **Create Heroku app**
2. **Set environment variables**
3. **Deploy with Git**

### 📱 Step 4: Configure Twilio Webhook

#### 4.1 Go to Twilio Console
1. Visit: https://console.twilio.com/
2. Navigate to: Messaging → Try it out → Send a WhatsApp message
3. Click on "Configuration" or "Webhooks"

#### 4.2 Set Webhook URL
- **Webhook URL**: `https://your-deployed-app.com/whatsapp-webhook`
- **HTTP Method**: POST
- **Save configuration**

### 🧪 Step 5: Test the Webhook

#### 5.1 Test Locally
```bash
cd server
npm test
```

#### 5.2 Test with Real WhatsApp
1. **Send a WhatsApp message** to the sandbox number
2. **Use format**: `CONFIRM CHA000113`
3. **Check for automatic response**

### 📋 Step 6: Verify Integration

#### 6.1 Test Commands
- `CONFIRM CHA000113` - Confirm order
- `PREPARING CHA000113` - Start preparing
- `READY CHA000113` - Order ready
- `DELIVERED CHA000113` - Order delivered
- `CANCELLED CHA000113` - Cancel order

#### 6.2 Expected Responses
- ✅ Success: Status update confirmation with next actions
- ❌ Error: Helpful error message with instructions

### 🔍 Troubleshooting

#### Common Issues:
1. **Webhook not receiving messages**: Check Twilio webhook URL
2. **Database errors**: Verify Supabase credentials
3. **Invalid commands**: Check message format
4. **Cafe not found**: Verify phone number in database

#### Debug Steps:
1. Check webhook server logs
2. Verify Twilio webhook configuration
3. Test with curl commands
4. Check Supabase database connection

### 🎉 Expected Results

Once fully set up:
- ✅ **Automatic status updates** from WhatsApp messages
- ✅ **Real-time order tracking** for customers
- ✅ **Professional responses** with next actions
- ✅ **Error handling** for invalid commands
- ✅ **Database integration** with order status updates

### 📞 Support

If you encounter issues:
1. Check the webhook server logs
2. Verify all environment variables
3. Test the webhook endpoint manually
4. Check Twilio webhook configuration

---

**Next: Deploy the webhook server and configure Twilio webhook URL!** 🚀
