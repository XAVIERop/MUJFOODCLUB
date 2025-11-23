# Testing OneSignal Fix

## Quick Test Steps

### 1. Clear Browser Cache & LocalStorage
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
// Then hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### 2. Check Console Logs

After refreshing, look for these **SUCCESS** messages in the console:

✅ **Expected Success Messages:**
- `✅ OneSignal initialized via react-onesignal`
- `✅ OneSignal player ID obtained: [some-id]`
- `✅ Notification opened listener added`
- `✅ Subscription change listener added`

❌ **If you see these, it's still broken:**
- `OneSignal.getUserId is not a function`
- `OneSignal.addListenerForNotificationOpened is not a function`
- `OneSignal.addListenerForSubscriptionChange is not a function`

### 3. Check OneSignal SDK Availability

Run this in the browser console:
```javascript
// Check if native OneSignal SDK is loaded
console.log('Native OneSignal:', window.OneSignal);
console.log('Has getUserId:', typeof window.OneSignal?.getUserId === 'function');
console.log('Has addListenerForNotificationOpened:', typeof window.OneSignal?.addListenerForNotificationOpened === 'function');
```

**Expected output:**
- `Native OneSignal:` should show an object (not `undefined`)
- `Has getUserId:` should be `true`
- `Has addListenerForNotificationOpened:` should be `true`

### 4. Test Notification Permission

1. **Sign in** to your account
2. Look for the **push notification prompt** (if not already granted)
3. Click **"Allow"** when prompted
4. Check console for: `✅ OneSignal player ID obtained: [id]`

### 5. Verify Database Subscription

After granting permission, check if subscription was saved:

```sql
-- Run in Supabase SQL Editor
SELECT 
  id,
  user_id,
  player_id,
  is_active,
  created_at
FROM public.push_subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

You should see a new row with your `user_id` and a `player_id`.

### 6. Test Notification Delivery (Optional)

To test if notifications actually work, you can manually trigger one from Supabase:

```sql
-- Get your player_id first from the query above
-- Then use it in OneSignal dashboard or API to send a test notification
```

## Troubleshooting

### If you still see errors:

1. **Check OneSignal Dashboard:**
   - Go to https://app.onesignal.com
   - Settings → Platforms → Web Push
   - Ensure "Allow localhost as a secure origin" is **enabled**

2. **Check Environment Variable:**
   ```bash
   # In your .env.local file, ensure you have:
   VITE_ONESIGNAL_APP_ID=bf7a34d0-4e1b-467e-9feb-d72f8ea46d95
   ```

3. **Check Service Worker:**
   - Open DevTools → Application → Service Workers
   - Look for `OneSignalSDKWorker.js`
   - Should be "activated and running"

4. **Check Network Tab:**
   - Open DevTools → Network
   - Filter by "onesignal"
   - Look for any failed requests (red status)

## Success Criteria

✅ No console errors about "is not a function"  
✅ Success messages in console  
✅ Native OneSignal SDK is available on `window.OneSignal`  
✅ Player ID is obtained and saved to database  
✅ Notification permission can be requested  
✅ Subscription is created in database

