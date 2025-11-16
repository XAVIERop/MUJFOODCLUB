# Push Notifications Testing Guide

## Step-by-Step Testing Process

### Step 1: Reset Browser Permissions (If Needed)

If you previously blocked notifications, reset them:

1. **Click the lock icon (🔒)** in the address bar (left of `localhost:8080`)
2. Click **"Site settings"**
3. Find **"Notifications"**
4. Change to **"Ask"** or **"Reset permissions"**
5. **Refresh the page**

### Step 2: Start Your Dev Server

```bash
npm run dev
```

Make sure it's running on `http://localhost:8080`

### Step 3: Open Browser and DevTools

1. Open Chrome/Edge/Firefox
2. Go to `http://localhost:8080`
3. Open **DevTools** (Press `F12` or `Cmd+Option+I` on Mac)
4. Go to **Console** tab
5. Keep it open to see logs

### Step 4: Sign In

1. Sign in with your account
2. Wait a few seconds
3. You should see a **notification prompt** in the bottom-right corner

### Step 5: Enable Notifications

1. Click **"Enable Notifications"** on the prompt
2. **Browser's native popup** should appear (top-left or center of screen)
3. Click **"Allow"**
4. You should see a toast: **"Notifications Enabled"** ✅

### Step 6: Verify Subscription

1. Go to **Profile page** (`/profile`)
2. Scroll down to **"Notification Preferences"** section
3. You should see:
   - ✅ Switches for different notification types
   - ✅ All enabled by default
   - ✅ NOT the "not enabled" message

### Step 7: Check Browser Console

In the Console tab, you should see:
```
✅ OneSignal initialized
✅ Player ID: [some-id]
✅ Push notification subscription created
```

### Step 8: Test Order Notification (Customer)

1. Go to any cafe menu (e.g., `/cafes` → click a cafe)
2. Add items to cart
3. Go to checkout
4. Place an order
5. **You should receive a push notification**: 
   - **Title**: "Order Received! 🎉"
   - **Body**: "Your order #[order-number] has been received..."
   - **Location**: Top-right corner of browser (or system notification area)

### Step 9: Test Status Update Notifications

1. Go to **POS Dashboard** (`/pos-dashboard`)
2. Find your test order
3. Update status to **"Confirmed"**
   - You should get: "Order Confirmed! ✅"
4. Update to **"Preparing"**
   - You should get: "Order Being Prepared! 👨‍🍳"
5. Update to **"On the Way"**
   - You should get: "Order Out for Delivery! 🚚"
6. Update to **"Completed"**
   - You should get: "Order Delivered! 🎊"

### Step 10: Test Cafe Staff Notifications

1. Sign in as **cafe staff** (or owner)
2. Have someone place an order (or place one yourself from another account)
3. **Cafe staff should receive**: 
   - **Title**: "New Order Received! 📦"
   - **Body**: "Order #[order-number] for ₹[amount] from [customer-name]"

### Step 11: Test Notification Click

1. Click on a notification
2. It should navigate to:
   - **Customer**: Order tracking page (`/order-tracking/[order-id]`)
   - **Cafe**: POS Dashboard with order selected

### Step 12: Verify in OneSignal Dashboard

1. Go to [OneSignal Dashboard](https://app.onesignal.com)
2. Select your app
3. Go to **Audience** → **All Users**
4. You should see your subscription listed with:
   - Player ID
   - Device type
   - Subscription date

### Step 13: Verify in Database

Run this query in Supabase SQL Editor:

```sql
SELECT 
  id,
  user_id,
  player_id,
  device_type,
  browser,
  is_active,
  created_at
FROM push_subscriptions
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
```

You should see your subscription record.

## Quick Test Checklist

- [ ] Dev server running
- [ ] Browser DevTools open (Console tab)
- [ ] Signed in
- [ ] Notification prompt appears
- [ ] Browser popup appears when clicking "Enable"
- [ ] Permission granted
- [ ] Profile page shows notification preferences
- [ ] Console shows "OneSignal initialized"
- [ ] Placed test order
- [ ] Received "Order Received" notification
- [ ] Updated order status
- [ ] Received status update notifications
- [ ] Clicked notification → navigated correctly
- [ ] OneSignal dashboard shows subscription
- [ ] Database has subscription record

## Troubleshooting

### No Prompt Appearing?
- Check if you dismissed it before (clear localStorage)
- Check browser console for errors
- Verify `VITE_ONESIGNAL_APP_ID` is in `.env.local`
- Make sure you're signed in

### Browser Popup Not Showing?
- Check if permission is already "denied" (reset it)
- Make sure you're clicking "Enable Notifications" button
- Check console for errors
- Try in incognito/private window

### Notifications Not Sending?
- Check Supabase Edge Function logs
- Verify Edge Function environment variables are set
- Check browser console for errors
- Verify OneSignal REST API Key is correct
- Check if Edge Function is deployed

### Subscription Not Saving?
- Check database RLS policies
- Verify user is authenticated
- Check browser console for Supabase errors
- Check network tab for failed requests

## Expected Console Logs

When everything works, you should see:

```
✅ OneSignal initialized
✅ Player ID: abc123...
✅ Push notification subscription created
✅ Push notification sent to customer
✅ Push notification sent to cafe staff
```

## What Success Looks Like

✅ **Prompt appears** → Click "Enable" → **Browser popup** → Click "Allow" → **"Notifications Enabled"** toast

✅ **Place order** → **Notification appears** in top-right corner

✅ **Update status** → **Notification appears** for each status change

✅ **Click notification** → **Navigates** to correct page

✅ **Profile page** → Shows notification preferences (not "not enabled")

✅ **OneSignal dashboard** → Shows your subscription

✅ **Database** → Has your subscription record

## Next Steps After Testing

Once everything works:
1. ✅ Test on production (after deploying to Vercel)
2. ✅ Monitor OneSignal dashboard for delivery rates
3. ✅ Check Supabase Edge Function logs for any errors
4. ✅ Gather user feedback on notification preferences

