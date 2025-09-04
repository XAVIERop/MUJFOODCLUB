# 🚀 Deploy Simplified Points System

## 🚨 **Issue**: Database still has old multiplier logic

The frontend changes are deployed, but the database functions still have the old 1.5x and 1.25x multipliers.

## 🔧 **Quick Fix Steps**

### **Step 1: Update Database Function**

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Go to **SQL Editor**

2. **Run the Update Script**
   ```sql
   -- Copy and paste this entire script:
   
   CREATE OR REPLACE FUNCTION calculate_new_points(
     order_amount DECIMAL,
     user_tier TEXT,
     is_new_user BOOLEAN DEFAULT FALSE,
     new_user_orders_count INTEGER DEFAULT 0
   )
   RETURNS INTEGER AS $$
   DECLARE
     points_rate INTEGER;
     base_points INTEGER;
   BEGIN
     -- Set points rate based on tier
     CASE user_tier
       WHEN 'connoisseur' THEN points_rate := 10; -- 10% points
       WHEN 'gourmet' THEN points_rate := 5;     -- 5% points
       ELSE points_rate := 5;                    -- 5% points for foodie
     END CASE;
     
     -- Calculate base points (no multipliers)
     base_points := FLOOR((order_amount * points_rate) / 100);
     
     RETURN base_points;
   END;
   $$ LANGUAGE plpgsql;
   
   -- Grant permissions
   GRANT EXECUTE ON FUNCTION calculate_new_points(DECIMAL, TEXT, BOOLEAN, INTEGER) TO authenticated, anon;
   ```

3. **Click "Run"** to execute the script

### **Step 2: Test the Function**

Run this test to verify it's working:

```sql
-- Test the updated function
SELECT 
  '₹1000 Foodie Order' as test_case,
  calculate_new_points(1000, 'foodie', true, 1) as points_earned,
  'Expected: 50 points' as expected;

SELECT 
  '₹1000 Connoisseur Order' as test_case,
  calculate_new_points(1000, 'connoisseur', true, 1) as points_earned,
  'Expected: 100 points' as expected;
```

**Expected Results:**
- Foodie: 50 points (₹1000 × 5%)
- Connoisseur: 100 points (₹1000 × 10%)

### **Step 3: Check for Old Functions**

Run this to see if old functions still exist:

```sql
-- Check for old functions
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%point%' OR proname LIKE '%reward%';
```

### **Step 4: Test in Frontend**

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Or open in incognito/private mode

2. **Test Points Calculation**
   - Go to checkout with a test order
   - Check if points calculation shows simplified values
   - Verify no multipliers are applied

## 🔍 **Troubleshooting**

### **If Still Getting Old Points**

1. **Check Function Source**
   ```sql
   SELECT prosrc FROM pg_proc WHERE proname = 'calculate_new_points';
   ```
   - Should NOT contain "1.5" or "1.25" multipliers
   - Should only have base points calculation

2. **Check Frontend Cache**
   - Clear browser cache completely
   - Try in incognito mode
   - Check browser console for errors

3. **Check Network Requests**
   - Open browser DevTools → Network tab
   - Look for RPC calls to `calculate_new_points`
   - Check if the response shows correct values

### **If Function Update Fails**

1. **Check Permissions**
   ```sql
   -- Grant execute permissions
   GRANT EXECUTE ON FUNCTION calculate_new_points(DECIMAL, TEXT, BOOLEAN, INTEGER) TO authenticated, anon;
   ```

2. **Drop and Recreate**
   ```sql
   -- Drop old function
   DROP FUNCTION IF EXISTS calculate_new_points(DECIMAL, TEXT, BOOLEAN, INTEGER);
   
   -- Create new function (use the script from Step 1)
   ```

## ✅ **Verification Checklist**

- [ ] Database function updated (no multipliers)
- [ ] Function returns correct base points
- [ ] Frontend shows simplified calculation
- [ ] Test order shows correct points
- [ ] No 1.5x or 1.25x multipliers in calculation

## 🎯 **Expected Behavior After Fix**

### **Before (Old System)**
- ₹1000 order = 75 points (50 × 1.5 multiplier)

### **After (New System)**
- ₹1000 order = 50 points (base points only)
- + 50 welcome bonus = 100 points total

## 📞 **If Still Having Issues**

1. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Look for any function execution errors

2. **Verify Function Permissions**
   - Make sure `authenticated` and `anon` roles have execute permissions

3. **Test with Different User**
   - Try with a fresh user account
   - Check if the issue persists

The key is updating the database function - once that's done, the frontend will automatically use the simplified calculation! 🎯
