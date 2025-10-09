# Vercel Environment Variables Setup Guide

## Issue
PrintNode is working on localhost but not on the deployed site (mujfoodclub.in) because environment variables are not configured in Vercel.

## Solution
You need to add the following environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Go to your MUJFOODCLUB project
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar

### 2. Add Required Environment Variables

Add these environment variables one by one:

#### Supabase Configuration (if not already set)
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### PrintNode API Keys
```
VITE_PRINTNODE_API_KEY=MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ
VITE_CHATKARA_PRINTNODE_API_KEY=your-chatkara-printnode-api-key
VITE_COOKHOUSE_PRINTNODE_API_KEY=your-cookhouse-printnode-api-key
VITE_FOODCOURT_PRINTNODE_API_KEY=your-foodcourt-printnode-api-key
VITE_PUNJABI_TADKA_PRINTNODE_API_KEY=MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ
VITE_MUNCHBOX_PRINTNODE_API_KEY=your-munchbox-printnode-api-key
VITE_PIZZA_BAKERS_PRINTNODE_API_KEY=lqcFxuYUnhlI4_B5q0eX30KrSZYBzAtvTCO6GzNRI0I
```

#### WhatsApp Configuration (if not already set)
```
VITE_TWILIO_ACCOUNT_SID=your-twilio-account-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
VITE_TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
VITE_WHATSAPP_SANDBOX_MODE=true
```

### 3. Set Environment for All Environments
For each variable, make sure to:
- Set it for "Production", "Preview", and "Development"
- Click "Save" after adding each variable

### 4. Redeploy
After adding all environment variables:
1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger automatic deployment

### 5. Verify Setup
After redeployment, check:
1. Go to `mujfoodclub.in/pos-dashboard`
2. Check if PrintNode shows "Connected" status
3. Verify Punjabi Tadka shows "Connected" with POS-60C printer

## Current Status
- ✅ **Localhost**: Working (environment variables set in .env.local)
- ❌ **Production**: Not working (environment variables missing in Vercel)

## Key Variables for Punjabi Tadka
The most important variables for Punjabi Tadka are:
- `VITE_PRINTNODE_API_KEY` (main API key)
- `VITE_PUNJABI_TADKA_PRINTNODE_API_KEY` (cafe-specific API key)

Both should be set to: `MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ`

## Troubleshooting
If still not working after setup:
1. Check browser console for environment variable errors
2. Verify the API key is correct
3. Ensure PrintNode agent is running on the cafe computer
4. Check if the printer is online in PrintNode dashboard
