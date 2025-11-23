# 🚨 QUICK FIX: Google Maps Authentication Failed

## The Error
**Toast message:** "Google Maps authentication failed Check API key restrictions and enabled APIs in Google Cloud Console."

This means your API key is being **blocked** by restrictions.

## ✅ 5-Minute Fix

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key (the one in `.env.local`)

### Step 2: Edit API Key Restrictions
Click on your API key → **Edit**

#### Application Restrictions:
- Select: **"HTTP referrers (web sites)"**
- **Add these referrers:**
  ```
  http://localhost:8080/*
  http://127.0.0.1:8080/*
  https://mujfoodclub.in/*
  https://*.mujfoodclub.in/*
  ```

#### API Restrictions:
- Select: **"Restrict key"**
- **Enable these APIs:**
  - ✅ Maps JavaScript API
  - ✅ Places API
  - ✅ Geocoding API

### Step 3: Save & Wait
1. Click **"Save"**
2. **Wait 2-3 minutes** for changes to propagate

### Step 4: Verify APIs Are Enabled
1. Go to: https://console.cloud.google.com/apis/library
2. Search for each API and click **"Enable"** if not already:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### Step 5: Check Billing
1. Go to: https://console.cloud.google.com/billing
2. Ensure billing account is linked (free tier is fine)

### Step 6: Test
1. **Restart your dev server:**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Open:** http://localhost:8080/checkout
4. **Check console** (F12) for:
   - ✅ `🗺️ Google Maps API Key found: AIzaSyBZ13...`
   - ✅ `✅ Google Maps script loaded successfully`
   - ✅ `✅ Google Map initialized successfully`

## Still Not Working?

### Check Browser Console (F12)
Look for specific error messages:
- `RefererNotAllowedMapError` → Add localhost to referrers
- `ApiNotActivatedMapError` → Enable APIs
- `BillingNotEnabledMapError` → Enable billing

### Test API Key Directly
Open this URL in browser (replace YOUR_KEY):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places,geometry
```

**If you see JavaScript code** → Key works, check domain restrictions  
**If you see an error page** → Key has issues (restrictions, billing, or APIs)

## Common Mistakes

❌ **Wrong:** Application restrictions = "None" (allows all, but less secure)  
✅ **Right:** Application restrictions = "HTTP referrers" with specific domains

❌ **Wrong:** API restrictions = "Don't restrict key"  
✅ **Right:** API restrictions = "Restrict key" with specific APIs enabled

❌ **Wrong:** Only added `https://mujfoodclub.in/*` (missing localhost)  
✅ **Right:** Added both localhost AND production domains

## Need Help?

Check the browser console (F12) and share:
1. Any red error messages
2. The output of: `console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 10))`
3. The output of: `console.log('Google Maps:', !!window.google)`

