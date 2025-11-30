# Aisensy WhatsApp Campaign Setup Guide

## Important: Aisensy API Requirements

Based on the Aisensy API documentation, you need to:

1. **Create a WhatsApp Template** (if not already created)
2. **Create an API Campaign** in Aisensy dashboard
3. **Set the campaign to "Live" status**

## Step-by-Step Setup

### Step 1: Create WhatsApp Template

1. Go to Aisensy Dashboard → **Template Message**
2. Create a new template with:
   - **Template Name**: "Order Notification" (or your preferred name)
   - **Template Type**: Text message
   - **Message Content**: 
     ```
     {{1}}
     ```
   - This template accepts 1 parameter (the full order message)
3. Submit for approval (if required)
4. Wait for approval

### Step 2: Create API Campaign

1. Go to Aisensy Dashboard → **Campaigns**
2. Click **+Launch** → Select **API Campaign**
3. Fill in:
   - **Campaign Name**: `Order Notification` (must match exactly what we use in code)
   - **Select Template**: Choose the template you created in Step 1
   - **Status**: Set to **Live** (important!)
4. Save the campaign

### Step 3: Update Edge Function (if needed)

The Edge Function is already updated to use:
- **Endpoint**: `/campaign/t1/api/v2`
- **Campaign Name**: `Order Notification` (default)
- **API Key**: In request body (not header)

### Step 4: Test

1. Place a test order to Banna's Chowki
2. Check Edge Function logs in Supabase
3. Verify WhatsApp message received on `+918383080140`

## Alternative: Use Different Campaign Names

If you want to use a different campaign name:

1. Create the campaign in Aisensy with your preferred name
2. Update the Edge Function secret:
   - Add `AISENSY_DEFAULT_CAMPAIGN_NAME` secret in Supabase
   - Set value to your campaign name
3. Or pass `campaignName` in the request (requires frontend changes)

## Current Configuration

- **API Endpoint**: `https://backend.aisensy.com/campaign/t1/api/v2`
- **API Key**: ✅ Set (from dashboard)
- **Phone Number**: `919625851220`
- **Default Campaign Name**: `Order Notification` (needs to be created)

## Next Steps

1. ✅ Create WhatsApp template in Aisensy
2. ✅ Create API Campaign named "Order Notification"
3. ✅ Set campaign to "Live" status
4. ✅ Update Edge Function in Supabase with new code
5. ✅ Test with Banna's Chowki order

