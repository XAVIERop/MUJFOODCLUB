# Debug PrintNode Production Issues

## Current Status
- ✅ **Environment Variables**: Set in Vercel
- ✅ **Localhost**: Working correctly
- ❌ **Production**: PrintNode shows "not configured"

## Possible Causes & Solutions

### 1. **Browser Cache Issue**
**Solution**: Clear browser cache and hard refresh
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or open in incognito/private mode

### 2. **Environment Variable Not Loading**
**Check**: Open browser console on production site
1. Go to `mujfoodclub.in/pos-dashboard`
2. Open Developer Tools (F12)
3. Check Console for errors like:
   - `VITE_PUNJABI_TADKA_PRINTNODE_API_KEY not set`
   - `PrintNode not configured`

### 3. **Cafe Name Mismatch**
**Issue**: The code checks for cafe name containing "punjabi" AND "tadka"
**Check**: Run this query to verify cafe name:
```sql
SELECT name FROM public.cafes WHERE name ILIKE '%punjabi%' OR name ILIKE '%tadka%';
```

### 4. **PrintNode Agent Not Running**
**Check**: On the cafe computer (DESKTOP-KN060F1)
1. Is PrintNode Agent running?
2. Is the POS-60C printer online in PrintNode dashboard?
3. Check PrintNode dashboard: https://app.printnode.com

### 5. **API Key Issues**
**Check**: Verify the API key is correct
- Current key: `MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ`
- Test in PrintNode dashboard

### 6. **Deployment Issue**
**Solution**: Force redeploy
1. Go to Vercel dashboard
2. Go to Deployments
3. Click "Redeploy" on latest deployment
4. Wait for deployment to complete

### 7. **Environment Variable Scope**
**Check**: In Vercel dashboard
1. Go to Settings → Environment Variables
2. Verify `VITE_PUNJABI_TADKA_PRINTNODE_API_KEY` is set for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

## Debugging Steps

### Step 1: Check Browser Console
1. Go to `mujfoodclub.in/pos-dashboard`
2. Open Developer Tools (F12)
3. Look for PrintNode-related logs
4. Check for environment variable errors

### Step 2: Test Environment Variables
Add this temporary debug code to see what's happening:
```javascript
console.log('🔍 Debug Environment Variables:');
console.log('VITE_PRINTNODE_API_KEY:', import.meta.env.VITE_PRINTNODE_API_KEY);
console.log('VITE_PUNJABI_TADKA_PRINTNODE_API_KEY:', import.meta.env.VITE_PUNJABI_TADKA_PRINTNODE_API_KEY);
```

### Step 3: Check PrintNode Dashboard
1. Go to https://app.printnode.com
2. Login with punjabitadka.foodclub@gmail.com
3. Check if POS-60C printer is online
4. Verify API key is correct

### Step 4: Test PrintNode API
Test the API key directly:
```bash
curl -H "Authorization: Basic $(echo -n 'MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ:' | base64)" \
     https://api.printnode.com/whoami
```

## Quick Fixes to Try

### Fix 1: Force Redeploy
1. Go to Vercel → Deployments
2. Click "Redeploy" on latest deployment
3. Wait for completion

### Fix 2: Clear Browser Cache
1. Hard refresh: `Ctrl+Shift+R`
2. Or use incognito mode

### Fix 3: Check PrintNode Agent
1. On cafe computer, ensure PrintNode Agent is running
2. Check if POS-60C printer is online

### Fix 4: Verify Environment Variables
1. Go to Vercel → Settings → Environment Variables
2. Check if all variables are set for all environments
3. Make sure no typos in variable names

## Expected Behavior
After fixing, you should see:
- ✅ PrintNode Status: "Connected"
- ✅ Account: "Punjabi Tadka"
- ✅ Available Printers: "POS-60C (online)"

## Still Not Working?
If none of the above fixes work, the issue might be:
1. **Network/Firewall**: PrintNode Agent can't connect to cloud
2. **API Key**: Wrong or expired key
3. **Cafe Name**: Database name doesn't match code logic
4. **Browser**: Specific browser compatibility issue

Try testing in a different browser or device to isolate the issue.
