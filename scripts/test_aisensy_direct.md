# Test Aisensy WhatsApp Directly

## Quick Test via Browser Console

Run this in your browser console after placing an order to see the full response:

```javascript
// Check the last Edge Function call
fetch('https://kblazvxfducwviyyiwde.supabase.co/functions/v1/dynamic-function', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${YOUR_SUPABASE_ANON_KEY}`,
    'apikey': YOUR_SUPABASE_ANON_KEY
  },
  body: JSON.stringify({
    phoneNumber: '918383080140',
    message: 'Test message from Food Club'
  })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

## What to Check in Supabase Logs

1. Go to: Supabase Dashboard → Edge Functions → `dynamic-function` → Logs
2. Look for these log entries after placing an order:
   - `📤 Sending request to Aisensy API:` - Shows the request being sent
   - `📥 Aisensy API Response:` - Shows the response from Aisensy
3. Check the response status code:
   - `200` = Success
   - `400` = Bad Request (check campaign name, template params)
   - `401` = Unauthorized (check API key)
   - `404` = Campaign not found (check campaign name)

## Common Issues

### Issue 1: Campaign Name Mismatch
- **Symptom**: 404 or 400 error
- **Fix**: Ensure campaign name in Aisensy is exactly "Order Notification" (case-sensitive)

### Issue 2: Template Not Approved
- **Symptom**: 400 error with template-related message
- **Fix**: Check Aisensy dashboard → Templates → Ensure `order_notification` is approved

### Issue 3: Campaign Not Live
- **Symptom**: 400 error
- **Fix**: Go to Aisensy → Campaigns → "Order Notification" → Click "Set Live"

### Issue 4: Wrong API Endpoint
- **Symptom**: 404 error
- **Fix**: Verify the endpoint is `/campaign/t1/api/v2`

## Expected Success Response

```json
{
  "success": true,
  "endpoint": "/campaign/t1/api/v2",
  "response": "{...aisensy response...}"
}
```

