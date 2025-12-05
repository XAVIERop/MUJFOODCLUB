# WhatsApp API Fixes - December 2025

## Issues Found in Logs

1. **Error: "Template params does not match the campaign"**
   - **Cause**: The campaign in Aisensy expects a different number of parameters than what's being sent
   - **Fix**: Updated Edge Function to handle both single and multi-parameter templates

2. **Error: "Invalid userName format"**
   - **Cause**: userName field contained special characters or was in wrong format
   - **Fix**: Improved userName extraction and cleaning (alphanumeric + spaces only, max 50 chars)

## Changes Made

### 1. Improved userName Extraction (`supabase/functions/send-whatsapp/index.ts`)

**Before:**
- Simple regex pattern that might fail
- No cleaning of special characters

**After:**
- Multiple extraction patterns to catch different formats
- Proper cleaning: removes special chars, normalizes spaces, limits to 50 chars
- Fallback to "Customer" if extraction fails

### 2. Template Parameter Handling

**Before:**
- Always sent as array (even for single parameter)

**After:**
- Detects parameter count
- Sends single parameter as string if count = 1
- Sends array if count > 1
- Matches Aisensy API requirements

### 3. Enhanced Logging

- Added detailed request logging
- Logs template parameter count
- Logs userName format and length
- Better error diagnostics

## What to Check in Aisensy Dashboard

### 1. Campaign Configuration

**Campaign Name**: `Order Notification V2`

**Check:**
- ✅ Campaign exists and is set to **"Live"** status
- ✅ Template has the correct number of parameters:
  - If using 4-parameter template: Template should have `{{1}}`, `{{2}}`, `{{3}}`, `{{4}}`
  - If using 1-parameter template: Template should have `{{1}}` only

### 2. Template Parameters

**Current Setup:**
- Frontend sends **4 parameters** by default
- Edge Function can handle **1 or 4 parameters**

**If errors persist:**
1. Check Aisensy dashboard → Campaigns → `Order Notification V2`
2. Verify the template parameter count matches what we're sending
3. If template has 1 parameter, update frontend to send single message
4. If template has 4 parameters, ensure frontend always sends 4

### 3. userName Requirements

**Aisensy Requirements:**
- Alphanumeric characters and spaces only
- Maximum 50 characters
- Cannot be empty

**Our Fix:**
- Extracts customer name from first parameter
- Cleans to alphanumeric + spaces only
- Limits to 50 characters
- Falls back to "Customer" if extraction fails

## Testing

After deploying the updated Edge Function:

1. **Place a test order**
2. **Check Supabase logs** for:
   - `📋 Request Details:` - Should show correct parameter count
   - `userName:` - Should be clean (no special chars)
   - `templateParamsCount:` - Should match campaign template

3. **Check for errors:**
   - If "Template params does not match": Verify campaign template parameter count
   - If "Invalid userName format": Should be fixed now

## Deployment

Deploy the updated Edge Function:

```bash
supabase functions deploy send-whatsapp --no-verify-jwt
```

Or if using `dynamic-function` name:

```bash
supabase functions deploy send-whatsapp --name dynamic-function --no-verify-jwt
```

## Next Steps

1. ✅ Deploy updated Edge Function
2. ⏳ Verify campaign in Aisensy matches parameter count
3. ⏳ Test with a real order
4. ⏳ Monitor logs for any remaining errors

