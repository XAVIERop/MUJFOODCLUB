# OneSignal Setup Instructions

## Your OneSignal Credentials

- **App ID**: `bf7a34d0-4e1b-467e-9feb-d72f8ea46d95`
- **REST API Key**: `os_v2_app_x55djucodndh5h7l24xy5jdnsut7eutkcw7ue2f6wgmfjze2zziaey53czerjirufzjx7oc5wy5f6un3b6jprslnc3a4ilbk4ee5cma`

## Step 1: Add to Local Environment (.env.local)

Add this to your `.env.local` file:

```env
VITE_ONESIGNAL_APP_ID=bf7a34d0-4e1b-467e-9feb-d72f8ea46d95
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

**Important**: The REST API Key should NOT be in `.env.local` as it's only used server-side.

## Step 2: Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following:

   - **Key**: `VITE_ONESIGNAL_APP_ID`
   - **Value**: `bf7a34d0-4e1b-467e-9feb-d72f8ea46d95`
   - **Environment**: Production, Preview, Development (select all)

   - **Key**: `VITE_ENABLE_PUSH_NOTIFICATIONS`
   - **Value**: `true`
   - **Environment**: Production, Preview, Development (select all)

4. Click **Save** and redeploy your application

## Step 3: Add to Supabase Edge Functions

The REST API Key is used by the Edge Function to send notifications.

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** > **Settings** or **Project Settings** > **Edge Functions**
3. Add the following environment variables:

   - **Key**: `ONESIGNAL_APP_ID`
   - **Value**: `bf7a34d0-4e1b-467e-9feb-d72f8ea46d95`

   - **Key**: `ONESIGNAL_REST_API_KEY`
   - **Value**: `os_v2_app_x55djucodndh5h7l24xy5jdnsut7eutkcw7ue2f6wgmfjze2zziaey53czerjirufzjx7oc5wy5f6un3b6jprslnc3a4ilbk4ee5cma`

4. Save the changes

## Step 4: Deploy the Edge Function

If you haven't already deployed the Edge Function:

```bash
# Make sure you're in the project directory
cd /Users/pv/MUJFOODCLUB

# Deploy the function
supabase functions deploy send-push-notification
```

## Step 5: Run Database Migration

Run the SQL script to create the push subscriptions table:

1. Go to Supabase Dashboard > SQL Editor
2. Open and run: `scripts/create_push_subscriptions_table.sql`

Or via command line:
```bash
# If you have psql configured
psql -h your-db-host -U postgres -d postgres -f scripts/create_push_subscriptions_table.sql
```

## Step 6: Enable Localhost in OneSignal (for Testing)

1. Go to [OneSignal Dashboard](https://app.onesignal.com)
2. Select your app
3. Go to **Settings** > **Platforms** > **Web Push**
4. Under **Configure Web Push**, enable **Allow localhost as a secure origin**
5. Save changes

## Step 7: Test

1. **Local Testing**:
   - Start your dev server: `npm run dev`
   - Open `http://localhost:8080`
   - Sign in and you should see the push notification prompt
   - Accept notifications
   - Place a test order to verify notifications work

2. **Production Testing**:
   - Deploy to Vercel
   - Visit your production URL
   - Sign in and enable notifications
   - Test order flow

## Verification Checklist

- [ ] Added `VITE_ONESIGNAL_APP_ID` to `.env.local`
- [ ] Added `VITE_ENABLE_PUSH_NOTIFICATIONS=true` to `.env.local`
- [ ] Added environment variables to Vercel
- [ ] Added environment variables to Supabase Edge Functions
- [ ] Deployed Edge Function
- [ ] Ran database migration
- [ ] Enabled localhost in OneSignal dashboard
- [ ] Tested on localhost
- [ ] Tested on production

## Troubleshooting

If notifications aren't working:

1. **Check browser console** for any OneSignal errors
2. **Verify App ID** is correct in environment variables
3. **Check Supabase Edge Function logs** for any errors
4. **Verify database table** exists: `SELECT * FROM push_subscriptions LIMIT 1;`
5. **Check OneSignal dashboard** for subscription status

## Security Note

⚠️ **Never commit the REST API Key to git**. It should only be in:
- Supabase Edge Functions environment variables
- Your local `.env.local` (if needed for testing, but not recommended)

The App ID is safe to commit as it's public-facing.

