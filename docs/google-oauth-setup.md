# Google OAuth Setup Guide

This guide will help you set up Google Sign-In for outside users in Supabase.

## Step 1: Configure OAuth Consent Screen (Show "Food Club" instead of Supabase URL)

**⚠️ IMPORTANT**: You need to navigate to the **"OAuth consent screen"** page, NOT the "OAuth Overview" page.

**How to get there:**
1. In the left sidebar, look for **"OAuth consent screen"** (it might be under "Google Auth Platform" or "APIs & Services")
2. OR go directly to: https://console.cloud.google.com/apis/credentials/consent
3. OR from the current page, click on **"Branding"** in the left sidebar (this is part of OAuth consent screen)

**IMPORTANT**: This step determines what users see when they click "Sign in with Google". The app name you set here will replace the Supabase domain (`kblazvxfducwviyyiwde.supabase.co`) in the Google sign-in dialog.

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (the one with Google OAuth credentials)
3. **Navigate to OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Or direct link: https://console.cloud.google.com/apis/credentials/consent
4. **Configure App Information**:
   - **App name**: `Food Club` or `MUJ Food Club` (this is what users will see instead of `kblazvxfducwviyyiwde.supabase.co`)
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - **App logo** (optional): Upload your logo (recommended for better UX)
   - **Application home page**: `https://mujfoodclub.in`
   - **Application privacy policy link**: `https://mujfoodclub.in/privacy-policy` (REQUIRED for verification)
   - **Application terms of service link**: `https://mujfoodclub.in/terms-of-service` (REQUIRED for verification)
   - **Authorized domains**: 
     - Click "ADD DOMAIN"
     - Add `mujfoodclub.in` (without `https://` or `www`)
     - This allows your domain to be used in the OAuth flow
5. **Select Audience**: Choose "External" (for public access)
6. **Add Scopes** (if needed):
   - Click "ADD OR REMOVE SCOPES"
   - Select: `email`, `profile`, `openid` (these are usually pre-selected)
   - Click "UPDATE"
7. **Add Test Users** (if app is in Testing mode):
   - Add your email and other test emails
   - Only these emails can sign in while app is in Testing mode
8. **Save and Continue** through all steps
9. **Submit for Verification** (if app is External and you want to remove "Unverified" warning):
   - This is optional but recommended for production
   - Google will review your app (can take a few days)

**After saving, the Google sign-in dialog will show "Food Club" instead of the Supabase domain!**

## Step 2: Create Google OAuth Credentials

1. **Go to "APIs & Services" → "Credentials"**
2. **Enable Google+ API** (if not already enabled):
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
3. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - **Authorized JavaScript origins**:
     - `http://localhost:8080` (for development)
     - `https://mujfoodclub.in` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:8080/auth` (for development)
     - `https://mujfoodclub.in/auth` (for production)
     - `https://kblazvxfducwviyyiwde.supabase.co/auth/v1/callback` (Supabase callback)
5. **Copy Client ID and Client Secret**

## Step 3: Configure Google OAuth in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to Authentication**:
   - Click on your project
   - Go to "Authentication" → "Providers"
3. **Enable Google Provider**:
   - Find "Google" in the list
   - Toggle it ON
   - Enter your **Client ID** and **Client Secret** from Step 1
   - Click "Save"

## Step 4: Update Redirect URLs

Make sure these redirect URLs are added in Google Cloud Console:
- `https://[your-project-ref].supabase.co/auth/v1/callback`
- `http://localhost:8080/auth` (development)
- `https://mujfoodclub.in/auth` (production)

## Step 5: Test Google Sign-In

1. **Start your development server**: `npm run dev`
2. **Go to Auth page**: `http://localhost:8080/auth`
3. **Click "Sign in with Google"** or **"Sign up with Google"** (for outside users)
4. **You should be redirected to Google** for authentication
5. **After signing in**, you'll be redirected back to `/auth`
6. **Profile will be automatically created** with `residency_scope = 'off_campus'`

## How It Works

### For Outside Users:
- Clicking "Sign in with Google" → Google OAuth flow → Profile created with `residency_scope = 'off_campus'`
- Can see only off-campus cafes
- Can order from off-campus cafes only

### Automatic Profile Creation:
- When a user signs in via Google, the `onAuthStateChange` listener detects it
- If profile doesn't exist, it's created with:
  - `residency_scope = 'off_campus'` for Gmail/other emails
  - `residency_scope = 'ghs'` for `@mujfoodclub.in` emails
  - Name from Google account
  - Email from Google account

## Troubleshooting

### Issue: Google sign-in shows Supabase domain instead of "Food Club"
- **Symptom**: When clicking "Sign in with Google", users see "to continue to `kblazvxfducwviyyiwde.supabase.co`" instead of "Food Club"
- **Root Cause**: Google displays the redirect URI domain in the consent screen. Since Supabase uses `https://kblazvxfducwviyyiwde.supabase.co/auth/v1/callback`, that domain appears.
- **Solution (Step-by-Step)**:
  1. **Go to Google Cloud Console**: https://console.cloud.google.com/
  2. **Select your project** (the one with OAuth credentials)
  3. **Navigate to OAuth Consent Screen**: APIs & Services → OAuth consent screen
  4. **Edit App Information**:
     - **App name**: Set to `Food Club` (this will appear in the heading)
     - **User support email**: Your email
     - **Developer contact information**: Your email
     - **App logo**: Upload your logo (optional but recommended)
  5. **Add Authorized Domains**:
     - Scroll to "Authorized domains" section
     - Click "ADD DOMAIN"
     - Add: `mujfoodclub.in` (without `https://` or `www`)
     - Click "SAVE"
  6. **Publish the App** (CRITICAL):
     - If your app is in "Testing" mode, you need to **Publish** it
     - Click "PUBLISH APP" button at the top
     - Confirm the publication
     - **Note**: Publishing makes the app available to all users (not just test users)
  7. **Wait for Propagation**:
     - Changes can take **5-15 minutes** to propagate
     - Clear browser cache completely (Ctrl+Shift+Delete / Cmd+Shift+Delete)
     - Try in an incognito/private window
  8. **Verify**:
     - The app name "Food Club" should appear in the heading
     - The domain will still show, but the app name should be more prominent
     - If still showing Supabase domain, wait longer and try again

- **Alternative Solution (If above doesn't work)**:
  - The redirect URI domain will always appear because that's how Google OAuth works
  - However, the **app name** should be more prominent
  - Consider using a custom domain for Supabase (if available) to replace the Supabase subdomain

### Error: "redirect_uri_mismatch"
- **Solution**: Make sure redirect URIs in Google Cloud Console match exactly with Supabase callback URL

### Error: "Google OAuth not enabled"
- **Solution**: Check Supabase Dashboard → Authentication → Providers → Google is toggled ON

### Profile not created after Google sign-in
- **Solution**: Check browser console for errors. The `onAuthStateChange` listener should create profile automatically.

## Notes

- Google OAuth users will have `residency_scope = 'off_campus'` by default
- `@muj.manipal.edu` Google users can manually update their `residency_scope` later if they're GHS residents
- `@mujfoodclub.in` Google users will get `residency_scope = 'ghs'` automatically

