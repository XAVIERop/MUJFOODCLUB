# Push Notifications Setup Guide

This guide explains how to set up and use push notifications in the MUJ Food Club application.

## Overview

The application uses **OneSignal** for browser push notifications. Users and cafe staff receive real-time notifications about:
- Order status updates (for customers)
- New orders (for cafe staff)

## Prerequisites

1. **OneSignal Account**: Create a free account at [onesignal.com](https://onesignal.com)
2. **OneSignal App**: Create a new web app in your OneSignal dashboard
3. **Environment Variables**: Add the following to your `.env.local` and Vercel:

```env
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

For the Supabase Edge Function, add:
```env
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_REST_API_KEY=your-onesignal-rest-api-key
```

## Setup Steps

### 1. OneSignal Dashboard Setup

1. Go to [OneSignal Dashboard](https://app.onesignal.com)
2. Create a new app (Web Push)
3. Configure your website URL
4. Copy your **App ID** and **REST API Key**

### 2. Database Setup

Run the SQL script to create the push subscriptions table:

```bash
# Run this in your Supabase SQL editor
psql -f scripts/create_push_subscriptions_table.sql
```

### 3. Supabase Edge Function Setup

Deploy the Edge Function for sending notifications:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-push-notification
```

### 4. Environment Variables

Add to `.env.local`:
```env
VITE_ONESIGNAL_APP_ID=your-app-id
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

Add to Vercel:
- Go to Project Settings > Environment Variables
- Add `VITE_ONESIGNAL_APP_ID` and `VITE_ENABLE_PUSH_NOTIFICATIONS`

Add to Supabase (for Edge Function):
- Go to Project Settings > Edge Functions > Environment Variables
- Add `ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY`

## How It Works

### For Users (Customers)

1. **Permission Request**: When a user logs in, they see a prompt to enable notifications
2. **Subscription**: If they accept, their browser subscription is stored in the database
3. **Notifications**: When order status changes, they receive push notifications:
   - Order Received
   - Order Confirmed
   - Order Preparing
   - Order Out for Delivery
   - Order Completed
   - Order Cancelled

### For Cafes

1. **Staff Subscription**: Cafe staff can enable notifications in their profile
2. **New Order Alerts**: When a new order is received, all active cafe staff get notified
3. **Preferences**: Staff can customize which notifications they want to receive

## User Preferences

Users can manage their notification preferences in the Profile page:
- Enable/disable specific notification types
- Unsubscribe from all notifications
- View subscription status

## Testing

1. **Local Testing**:
   - Make sure `VITE_ONESIGNAL_APP_ID` is set in `.env.local`
   - Enable localhost in OneSignal dashboard (Settings > Platforms > Web Push > Configure)
   - Test on `localhost:8080` (HTTPS not required for localhost)

2. **Production Testing**:
   - Deploy to Vercel with environment variables
   - Test on production URL (must be HTTPS)
   - Check browser console for any errors

## Troubleshooting

### Notifications Not Working

1. **Check Browser Support**: Ensure browser supports push notifications (Chrome, Firefox, Edge, Safari 16+)
2. **Check Permissions**: Verify user granted notification permission
3. **Check OneSignal**: Verify App ID is correct and app is active
4. **Check Database**: Verify subscription is stored in `push_subscriptions` table
5. **Check Edge Function**: Verify Edge Function is deployed and has correct credentials

### Common Issues

- **"OneSignal App ID not configured"**: Add `VITE_ONESIGNAL_APP_ID` to environment variables
- **"Permission denied"**: User needs to enable notifications in browser settings
- **"No active subscriptions"**: User hasn't subscribed or subscription expired
- **Notifications not sending**: Check Edge Function logs in Supabase dashboard

## Files Modified/Created

### New Files
- `src/services/pushNotificationService.ts` - Core push notification service
- `src/services/orderPushNotificationService.ts` - Order-specific notifications
- `src/services/onesignalNotificationService.ts` - OneSignal API wrapper
- `src/hooks/usePushNotifications.tsx` - React hook for push notifications
- `src/components/PushNotificationPrompt.tsx` - Permission request UI
- `src/components/NotificationPreferences.tsx` - User preferences UI
- `supabase/functions/send-push-notification/index.ts` - Edge Function
- `scripts/create_push_subscriptions_table.sql` - Database schema

### Modified Files
- `src/App.tsx` - Added PushNotificationPrompt component
- `src/pages/Checkout.tsx` - Send notifications on order creation
- `src/pages/POSDashboard.tsx` - Send notifications on status update
- `src/pages/Profile.tsx` - Added notification preferences
- `env.template` - Added OneSignal environment variables

## Security Notes

- OneSignal REST API Key should only be used in server-side code (Edge Function)
- Never expose the REST API Key in client-side code
- Use RLS policies to protect push subscription data
- Validate user permissions before sending notifications

## Next Steps

1. Set up OneSignal account and get App ID
2. Run database migration
3. Deploy Edge Function
4. Add environment variables
5. Test on localhost
6. Deploy to production

For questions or issues, check the OneSignal documentation or contact support.

