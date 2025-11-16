# Next Steps for Push Notifications

## ✅ Completed
- [x] Database table created (`push_subscriptions`)
- [x] OneSignal credentials provided

## 🔄 Remaining Steps

### 1. Verify Database Setup (Optional)
Run this query to verify everything is set up correctly:
```sql
-- Run: scripts/verify_push_subscriptions_setup.sql
```

### 2. Add Environment Variables to `.env.local`

Add these lines to your `.env.local` file:

```env
VITE_ONESIGNAL_APP_ID=bf7a34d0-4e1b-467e-9feb-d72f8ea46d95
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

Then restart your dev server:
```bash
npm run dev
```

### 3. Add to Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_ONESIGNAL_APP_ID` = `bf7a34d0-4e1b-467e-9feb-d72f8ea46d95`
   - `VITE_ENABLE_PUSH_NOTIFICATIONS` = `true`
3. Redeploy your application

### 4. Add to Supabase Edge Functions

1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add environment variables:
   - `ONESIGNAL_APP_ID` = `bf7a34d0-4e1b-467e-9feb-d72f8ea46d95`
   - `ONESIGNAL_REST_API_KEY` = `os_v2_app_x55djucodndh5h7l24xy5jdnsut7eutkcw7ue2f6wgmfjze2zziaey53czerjirufzjx7oc5wy5f6un3b6jprslnc3a4ilbk4ee5cma`

### 5. Deploy Edge Function

```bash
# Make sure you're in the project directory
cd /Users/pv/MUJFOODCLUB

# Deploy the function
supabase functions deploy send-push-notification
```

If you haven't set up Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Then deploy
supabase functions deploy send-push-notification
```

### 6. Enable Localhost in OneSignal

1. Go to [OneSignal Dashboard](https://app.onesignal.com)
2. Select your app (App ID: `bf7a34d0-4e1b-467e-9feb-d72f8ea46d95`)
3. Go to **Settings** → **Platforms** → **Web Push**
4. Under **Configure Web Push**, enable **"Allow localhost as a secure origin"**
5. Save changes

### 7. Test Locally

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:8080` in your browser

3. Sign in to your account

4. You should see a push notification prompt appear (bottom-right corner)

5. Click "Enable Notifications" and allow in browser

6. Place a test order to verify notifications work

### 8. Test on Production

1. Deploy to Vercel (after adding environment variables)

2. Visit your production URL

3. Sign in and enable notifications

4. Test the full order flow

## Testing Checklist

- [ ] Database table created and verified
- [ ] Environment variables added to `.env.local`
- [ ] Dev server restarted
- [ ] Environment variables added to Vercel
- [ ] Environment variables added to Supabase Edge Functions
- [ ] Edge Function deployed
- [ ] Localhost enabled in OneSignal
- [ ] Tested on localhost - prompt appears
- [ ] Tested on localhost - subscription works
- [ ] Tested on localhost - notifications received
- [ ] Deployed to production
- [ ] Tested on production

## What to Expect

### For Users:
- A notification prompt will appear when they sign in (if not already subscribed)
- They can manage preferences in Profile page
- They'll receive notifications for:
  - Order received
  - Order confirmed
  - Order preparing
  - Order out for delivery
  - Order completed
  - Order cancelled

### For Cafes:
- Staff will receive notifications for new orders
- Notifications can be managed in Profile page

## Troubleshooting

If something doesn't work:

1. **Check browser console** for errors
2. **Check OneSignal dashboard** for subscription status
3. **Check Supabase Edge Function logs** for errors
4. **Verify environment variables** are set correctly
5. **Check database** - run verification query

## Need Help?

Refer to:
- `PUSH_NOTIFICATIONS_SETUP.md` - Full setup guide
- `ONESIGNAL_SETUP_INSTRUCTIONS.md` - Detailed instructions

