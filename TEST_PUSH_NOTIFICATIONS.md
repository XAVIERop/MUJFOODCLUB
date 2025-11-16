# Testing Push Notifications

## Quick Test Steps

### 1. Start Your Dev Server
```bash
npm run dev
```

### 2. Open Browser
- Go to `http://localhost:8080`
- Open browser DevTools (F12) → Console tab

### 3. Sign In
- Sign in with your account
- You should see a notification prompt in the bottom-right corner

### 4. Enable Notifications
- Click "Enable Notifications" on the prompt
- Browser will ask for permission → Click "Allow"
- You should see a success toast: "Notifications Enabled"

### 5. Verify Subscription
- Go to Profile page (`/profile`)
- Scroll down to "Notification Preferences" section
- You should see your preferences with switches enabled
- This confirms you're subscribed

### 6. Test Order Notification (Customer)
- Place a test order
- You should receive a push notification: "Order Received! 🎉"
- Check browser notifications (top-right corner)

### 7. Test Status Update (Customer)
- Go to POS Dashboard
- Update the order status (e.g., "Confirmed", "Preparing")
- You should receive push notifications for each status change

### 8. Test New Order Notification (Cafe)
- Sign in as cafe staff
- Have someone place an order (or place one yourself)
- Cafe staff should receive: "New Order Received! 📦"

## What to Check

### Browser Console
Look for these messages:
- ✅ "OneSignal initialized"
- ✅ "Player ID: ..."
- ✅ "Push notification sent to customer"
- ✅ "Push notification sent to cafe staff"

### OneSignal Dashboard
1. Go to [OneSignal Dashboard](https://app.onesignal.com)
2. Select your app
3. Go to **Audience** → **All Users**
4. You should see your subscription listed

### Database Check
Run this query in Supabase SQL Editor:
```sql
SELECT 
  id,
  user_id,
  player_id,
  is_active,
  created_at
FROM push_subscriptions
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
```

You should see your subscription record.

## Troubleshooting

### No Prompt Appearing?
- Check browser console for errors
- Verify `VITE_ONESIGNAL_APP_ID` is in `.env.local`
- Make sure you're signed in
- Check if you already dismissed the prompt (check localStorage)

### Permission Denied?
- Go to browser settings → Site Settings → Notifications
- Make sure notifications are allowed for localhost:8080
- Try clearing site data and retry

### Notifications Not Sending?
- Check Supabase Edge Function logs
- Verify Edge Function environment variables are set
- Check browser console for errors
- Verify OneSignal REST API Key is correct

### Subscription Not Saving?
- Check database RLS policies
- Verify user is authenticated
- Check browser console for Supabase errors

## Expected Behavior

### When Order is Placed:
1. Customer receives: "Order Received! 🎉"
2. Cafe staff receives: "New Order Received! 📦"

### When Status Updates:
1. Customer receives notification for each status:
   - "Order Confirmed! ✅"
   - "Order Being Prepared! 👨‍🍳"
   - "Order Out for Delivery! 🚚"
   - "Order Delivered! 🎊"

### Notification Click:
- Clicking a notification should navigate to:
  - Order tracking page (for customers)
  - POS Dashboard (for cafe staff)

## Next Steps After Testing

Once everything works:
1. ✅ Test on production (after deploying to Vercel)
2. ✅ Monitor OneSignal dashboard for delivery rates
3. ✅ Check Supabase Edge Function logs for any errors
4. ✅ Gather user feedback on notification preferences

