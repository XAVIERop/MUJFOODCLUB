# How to Create a New Google Maps API Key

## Step-by-Step Guide

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Make sure you're in the correct project: **My First Project** (or your project name)
3. If you need to switch projects, click the project dropdown at the top

### Step 2: Navigate to Credentials
1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
2. Or direct link: https://console.cloud.google.com/apis/credentials

### Step 3: Create API Key
1. Click the **"+ CREATE CREDENTIALS"** button at the top
2. Select **"API key"** from the dropdown
3. A new API key will be generated and displayed in a popup
4. **Copy the API key immediately** (you won't be able to see it again in full)

### Step 4: Restrict the API Key (IMPORTANT for Security)

**⚠️ DO NOT skip this step!** Unrestricted API keys can be abused.

1. In the popup, click **"RESTRICT KEY"** (or click "Close" and then click on the new key to edit it)

2. **Application restrictions:**
   - Select **"HTTP referrers (web sites)"**
   - Click **"ADD AN ITEM"** and add:
     - `https://mujfoodclub.in/*`
     - `https://*.mujfoodclub.in/*`
     - `https://*.vercel.app/*` (for preview deployments)
   - Click **"SAVE"**

3. **API restrictions:**
   - Select **"Restrict key"**
   - Click **"SELECT APIs"**
   - Enable these APIs:
     - ✅ **Maps JavaScript API** (required)
     - ✅ **Places API** (required)
     - ✅ **Geocoding API** (required)
   - Click **"SAVE"**

4. Click **"SAVE"** at the bottom to save all restrictions

### Step 5: Enable Required APIs
Make sure these APIs are enabled in your project:

1. Go to: **"APIs & Services"** → **"Library"**
2. Search for and enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### Step 6: Verify Billing is Enabled
Google Maps requires billing (but has a free tier):

1. Go to: https://console.cloud.google.com/billing
2. Make sure a billing account is linked to your project
3. If not, link one (you can use the free tier credits)

### Step 7: Add to Vercel
1. Go to: https://vercel.com/dashboard
2. Select project: **MUJFOODCLUB**
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Value**: (paste your new API key)
   - **Environments**: Check **Production**, **Preview**, and **Development**
6. Click **"Save"**

### Step 8: Redeploy
1. Go to: **Deployments** tab in Vercel
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 9: Test
1. Open: https://mujfoodclub.in/checkout
2. Open browser console (F12)
3. Look for: `🗺️ Google Maps API Key found: [first 10 chars]...`
4. Try adding a new address - the map should load

## Security Best Practices

✅ **DO:**
- Always restrict API keys
- Use HTTP referrer restrictions for web apps
- Restrict to only needed APIs
- Store keys in environment variables only
- Never commit API keys to git

❌ **DON'T:**
- Share API keys publicly
- Commit keys to git repositories
- Use unrestricted keys in production
- Hardcode keys in source code

## Troubleshooting

**Error: "RefererNotAllowedMapError"**
- Fix: Add your domain to HTTP referrers in API key restrictions

**Error: "ApiNotActivatedMapError"**
- Fix: Enable Maps JavaScript API, Places API, and Geocoding API

**Error: "BillingNotEnabledMapError"**
- Fix: Enable billing in Google Cloud Console

**Error: "This API key is not authorized"**
- Fix: Check that the correct APIs are enabled and the key has proper restrictions

