# Troubleshooting Map Loading Error

## Quick Debug Steps

### Step 1: Check Browser Console
1. Open: https://mujfoodclub.in/checkout
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for these messages:

**If you see:**
- `🗺️ Google Maps API Key found: AIzaSyCI...` → Key is loaded, check restrictions
- `❌ Google Maps API key not found` → Key not set in Vercel
- `Failed to load Google Maps script` → API key or restrictions issue

**Share what you see in the console!**

### Step 2: Verify Vercel Environment Variable
1. Go to: https://vercel.com/dashboard
2. Select: **MUJFOODCLUB** project
3. **Settings** → **Environment Variables**
4. Check:
   - Variable name: `VITE_GOOGLE_MAPS_API_KEY` (exact match, case-sensitive)
   - Value: Your new API key
   - **Production** environment is checked ✅
5. If missing or wrong:
   - Add/Update the variable
   - **Redeploy** (this is critical!)

### Step 3: Verify API Key Restrictions in Google Cloud
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Check **Application restrictions**:
   - Should be: **"HTTP referrers (web sites)"**
   - Must include:
     - `https://mujfoodclub.in/*`
     - `https://*.mujfoodclub.in/*`
4. Check **API restrictions**:
   - Should be: **"Restrict key"**
   - Must include:
     - Maps JavaScript API ✅
     - Places API ✅
     - Geocoding API ✅

### Step 4: Verify APIs are Enabled
1. Go to: https://console.cloud.google.com/apis/library
2. Search and verify these are **ENABLED**:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### Step 5: Check Billing
1. Go to: https://console.cloud.google.com/billing
2. Ensure billing account is linked
3. Google Maps requires billing (free tier available)

### Step 6: Test API Key Directly
Try this URL in your browser (replace YOUR_KEY):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places,geometry
```

**If you see an error page**, the key has restrictions or billing issues.

## Common Errors

### "RefererNotAllowedMapError"
- **Fix**: Add `https://mujfoodclub.in/*` to HTTP referrers

### "ApiNotActivatedMapError"  
- **Fix**: Enable Maps JavaScript API, Places API, Geocoding API

### "BillingNotEnabledMapError"
- **Fix**: Enable billing in Google Cloud Console

### "This API key is not authorized"
- **Fix**: Check API restrictions - ensure Maps JavaScript API is enabled

### Environment variable not loading
- **Fix**: 
  1. Verify exact name: `VITE_GOOGLE_MAPS_API_KEY`
  2. Make sure it's set for **Production**
  3. **Redeploy** after adding/updating

## Still Not Working?

1. **Clear browser cache** and try again
2. **Try incognito/private window**
3. **Check Vercel deployment logs** for build errors
4. **Wait 2-3 minutes** after adding to Vercel (propagation time)

