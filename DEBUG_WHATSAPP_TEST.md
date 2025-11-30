# Debug WhatsApp Test for Banna's Chowki

## What to Check After Placing Order

### 1. Browser Console - Look for These Logs

Scroll up in the console and look for these WhatsApp-related logs:

**Expected Logs:**
```
📱 [CHECKOUT] Starting WhatsApp notification process...
📱 [CHECKOUT] Order: BAN000037
📱 [CHECKOUT] Cafe ID: ...
📱 [CHECKOUT] Cafe Name: Banna's Chowki
📱 [CHECKOUT] WhatsApp service instance created
📱 [CHECKOUT] Order data formatted: {...}
📱 [CHECKOUT] Calling WhatsApp service...
📱 [WHATSAPP SERVICE] Starting notification process...
📱 [WHATSAPP SERVICE] Cafe ID: ...
📱 [WHATSAPP SERVICE] All checks passed, formatting message...
📱 Calling Supabase Edge Function: https://...supabase.co/functions/v1/dynamic-function
```

**Success:**
```
✅ Message sent via Aisensy successfully
✅ [CHECKOUT] WhatsApp notification sent successfully
```

**Failure:**
```
❌ [CHECKOUT] WhatsApp notification failed
❌ Edge Function not found (404)
❌ Aisensy API error: ...
```

### 2. Check Console Filters

Make sure console filters aren't hiding logs:
- Click the filter icon in console
- Make sure "All levels" or "Info" is selected
- Clear any text filters

### 3. Check Supabase Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to: Edge Functions → `dynamic-function`
3. Click "Logs" tab
4. Look for recent logs (should show your order time)
5. Check for:
   - `📱 Sending WhatsApp via Aisensy:`
   - `📡 Trying endpoint:`
   - `✅ Success with endpoint` OR error messages

### 4. Verify WhatsApp Message Received

Check phone number: **+918383080140**
- Should receive a WhatsApp message with order details
- Message format: Order number, customer name, items, total, etc.

### 5. Common Issues

**If no WhatsApp logs appear:**
- The code might not be executing
- Check if there's an error before the WhatsApp code runs
- Verify the order was actually placed (check database)

**If logs show "404 - Edge Function not found":**
- `dynamic-function` might not be deployed
- Check Supabase Dashboard → Edge Functions

**If logs show "500 - Edge Function error":**
- Check Edge Function secrets are set
- Check Edge Function logs for detailed error

**If logs show "All Aisensy endpoints failed":**
- Aisensy API endpoint might be wrong
- Check Edge Function logs for which endpoint/format worked
- Verify Aisensy API key is valid

### 6. Quick Test Query

Verify the order was created:
```sql
SELECT 
  id,
  order_number,
  cafe_id,
  total_amount,
  created_at
FROM public.orders 
WHERE order_number = 'BAN000037'
LIMIT 1;
```

