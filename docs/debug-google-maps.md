# Debugging Google Maps API Error

## Quick Checklist

### 1. Verify Environment Variable in Vercel
- Go to: https://vercel.com/dashboard
- Select project: `MUJFOODCLUB`
- Settings → Environment Variables
- Check: `VITE_GOOGLE_MAPS_API_KEY` exists
- Value should be your Google Maps API key (never commit API keys to git!)
- **IMPORTANT**: Make sure it's set for **Production** environment
- After adding/updating: **Redeploy** the site

### 2. Check Browser Console
Open browser console (F12) and look for:
- `🗺️ Google Maps API Key found: [first 10 chars]...` (means key is loaded)
- `❌ Google Maps API key not found` (means key is missing)
- Any network errors when loading `maps.googleapis.com`

### 3. Verify Google Cloud Console Settings

#### API Key Restrictions:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add these referrers:
     - `https://mujfoodclub.in/*`
     - `https://*.mujfoodclub.in/*`
     - `https://*.vercel.app/*` (for preview deployments)
4. **API restrictions**:
   - Ensure these APIs are enabled:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API
5. **Save** changes

#### Billing:
- Go to: https://console.cloud.google.com/billing
- Ensure billing account is linked to your project
- Google Maps requires billing (but has free tier)

### 4. Test API Key Directly
Try loading this URL in your browser (replace YOUR_KEY):
```
https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places,geometry
```

If you see an error page, the API key has issues.

### 5. Common Issues

**Issue**: "RefererNotAllowedMapError"
- **Fix**: Add `https://mujfoodclub.in/*` to HTTP referrers in Google Cloud Console

**Issue**: "ApiNotActivatedMapError"
- **Fix**: Enable Maps JavaScript API, Places API, and Geocoding API

**Issue**: "BillingNotEnabledMapError"
- **Fix**: Enable billing in Google Cloud Console

**Issue**: Environment variable not loading
- **Fix**: 
  1. Verify variable name is exactly `VITE_GOOGLE_MAPS_API_KEY`
  2. Make sure it's set for Production environment
  3. Redeploy after adding/updating

### 6. Verify in Production
After redeploying, check:
1. Open: https://mujfoodclub.in/checkout
2. Open browser console (F12)
3. Look for the log: `🗺️ Google Maps API Key found: ...`
4. If you see "API key not found", the environment variable isn't set correctly

## Still Not Working?

1. **Check Vercel build logs**: Look for any errors during build
2. **Verify variable name**: Must be exactly `VITE_GOOGLE_MAPS_API_KEY` (case-sensitive)
3. **Check for typos**: Copy-paste the API key value carefully
4. **Wait a few minutes**: Sometimes changes take time to propagate

