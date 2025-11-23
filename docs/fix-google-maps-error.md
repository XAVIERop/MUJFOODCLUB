# Fix "This page didn't load Google Maps correctly" Error

## Quick Fix Checklist

### ✅ Step 1: Verify API Key in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key: `AIzaSyBZ13lKr8MHqE3t57LGbCUgl1B5-gjas5M`
3. Click on it to edit

### ✅ Step 2: Check Application Restrictions

**For localhost (development):**
- Application restrictions: **"HTTP referrers (web sites)"**
- Add these referrers:
  - `http://localhost:8080/*`
  - `http://127.0.0.1:8080/*`
  - `http://localhost/*` (optional, for any port)

**For production (mujfoodclub.in):**
- Add these referrers:
  - `https://mujfoodclub.in/*`
  - `https://*.mujfoodclub.in/*`

### ✅ Step 3: Check API Restrictions

**Must be enabled:**
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API

**How to enable:**
1. Go to: https://console.cloud.google.com/apis/library
2. Search for each API
3. Click "Enable" if not already enabled

### ✅ Step 4: Verify Billing

1. Go to: https://console.cloud.google.com/billing
2. Ensure a billing account is linked
3. Google Maps requires billing (but has free tier)

### ✅ Step 5: Test the API Key Directly

Open this URL in your browser (replace YOUR_KEY):
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyBZ13lKr8MHqE3t57LGbCUgl1B5-gjas5M&libraries=places,geometry
```

**Expected results:**
- ✅ If you see JavaScript code → Key works, check domain restrictions
- ❌ If you see an error page → Key has issues (restrictions, billing, or APIs)

### ✅ Step 6: Check Browser Console

1. Open: http://localhost:8080/checkout
2. Press **F12** → **Console** tab
3. Look for:
   - `🗺️ Google Maps API Key found: AIzaSyBZ13...`
   - `✅ Google Maps script loaded successfully`
   - `❌ Google Maps authentication failed` (if auth error)
   - Any red error messages

## Common Error Messages & Fixes

### "RefererNotAllowedMapError"
**Fix:** Add `http://localhost:8080/*` to HTTP referrers in Google Cloud Console

### "ApiNotActivatedMapError"
**Fix:** Enable Maps JavaScript API, Places API, Geocoding API

### "BillingNotEnabledMapError"
**Fix:** Enable billing in Google Cloud Console

### "This API key is not authorized"
**Fix:** Check API restrictions - ensure Maps JavaScript API is enabled

### Script loads but map doesn't initialize
**Fix:** Check browser console for specific error. Usually means:
- API key restrictions blocking the domain
- Required APIs not enabled
- Billing not enabled

## For Production (Vercel)

1. Go to: https://vercel.com/dashboard
2. Select: **MUJFOODCLUB** project
3. **Settings** → **Environment Variables**
4. Add/Update: `VITE_GOOGLE_MAPS_API_KEY`
5. Value: Your API key
6. **Production** environment ✅
7. **Redeploy** (critical!)

## Still Not Working?

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Try incognito/private window**
3. **Restart dev server** after changing .env.local
4. **Wait 2-3 minutes** after updating Google Cloud Console (propagation time)
5. **Check Vercel deployment logs** for build errors

## Debug Commands

Run in browser console (F12):
```javascript
// Check if API key is loaded
console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.substring(0, 10));

// Check if Google Maps is loaded
console.log('Google Maps:', !!window.google);
console.log('Google Maps API:', !!window.google?.maps);

// Check for auth errors
console.log('Auth Failure Handler:', window.gm_authFailure);
```

