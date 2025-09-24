# Daily Order Number System - Testing Guide

## 🎯 Overview
This guide will help you test the new daily reset order number system that generates order numbers like:
- **Chatkara**: CHA000001, CHA000002, CHA000003...
- **Food Court**: FC000001, FC000002, FC000003...
- **Other Cafes**: {PREFIX}000001, {PREFIX}000002...

## 📋 Prerequisites
1. **Database Function**: Run the SQL script `scripts/implement_daily_order_numbers.sql` in Supabase dashboard
2. **Frontend Code**: Updated Checkout.tsx and CafeScanner.tsx with new order number generation
3. **Development Server**: Running at http://localhost:8084/

## 🧪 Testing Steps

### Step 1: Test Database Function
Run this SQL in Supabase dashboard to verify the function works:

```sql
-- Test order number generation
SELECT 
  c.name as cafe_name,
  public.generate_daily_order_number(c.id) as sample_order_number
FROM public.cafes c
WHERE c.is_active = true
LIMIT 5;
```

**Expected Results:**
- Chatkara should generate: CHA000001
- Food Court should generate: FC000001
- Other cafes should generate: {PREFIX}000001

### Step 2: Test Online Orders
1. Go to http://localhost:8084/
2. Navigate to any cafe menu
3. Add items to cart
4. Go to checkout
5. Fill in details and place order
6. **Check the order number format**

**Expected Results:**
- Order number should be like: CHA000001, FC000001, etc.
- Console should show: "✅ Generated daily order number: CHA000001"

### Step 3: Test Offline Orders (CafeScanner)
1. Go to POS Dashboard
2. Navigate to Manual Order tab
3. Scan a QR code or search for a student
4. Add items and place order
5. **Check the order number format**

**Expected Results:**
- Order number should be like: CHA000002, FC000002, etc.
- Console should show: "✅ Generated daily order number: CHA000002"

### Step 4: Test Multiple Orders
1. Place 3-4 orders from the same cafe
2. **Verify sequential numbering**: CHA000001, CHA000002, CHA000003, CHA000004

### Step 5: Test Fallback System
To test the fallback (old system), you can temporarily break the database function:

```sql
-- Temporarily break the function (for testing only)
DROP FUNCTION IF EXISTS public.generate_daily_order_number(UUID);
```

Then place an order and verify it uses the old format: `ONLINE-{timestamp}-{random}-{userid}`

**Restore the function after testing:**
```sql
-- Re-run the implementation script to restore the function
```

### Step 6: Test Date Reset
1. Wait until next day (or manually change date in database for testing)
2. Place a new order
3. **Verify it starts from 000001 again**

## 🔍 Verification Points

### ✅ Success Indicators
- [ ] Order numbers are 6 characters long (3 letters + 6 digits)
- [ ] Order numbers start with correct cafe prefix
- [ ] Sequential numbering works (000001, 000002, 000003...)
- [ ] Different cafes have different prefixes
- [ ] Console shows success messages
- [ ] Orders appear in POS dashboard with new numbers

### ❌ Failure Indicators
- [ ] Order numbers are still in old format (ONLINE-...)
- [ ] Console shows error messages about order number generation
- [ ] Orders fail to be created
- [ ] Duplicate order numbers are generated

## 🐛 Troubleshooting

### Issue: "Function not found" Error
**Solution**: Run the SQL script in Supabase dashboard:
```sql
-- Run the entire scripts/implement_daily_order_numbers.sql file
```

### Issue: Orders still use old format
**Possible Causes**:
1. Database function not created
2. Frontend code not updated
3. Cache issues

**Solutions**:
1. Check if function exists: `SELECT public.generate_daily_order_number('test-id');`
2. Restart development server
3. Clear browser cache

### Issue: Duplicate order numbers
**Solution**: Check if multiple orders are created simultaneously. The function should handle this, but if it happens, check the database logs.

## 📊 Expected Results by Cafe

| Cafe Name | Expected Prefix | Example Order Numbers |
|-----------|----------------|----------------------|
| Chatkara | CHA | CHA000001, CHA000002, CHA000003 |
| Food Court | FC | FC000001, FC000002, FC000003 |
| Cook House | CH | CH000001, CH000002, CH000003 |
| Momo Street | MOM | MOM000001, MOM000002, MOM000003 |
| Gobbler's | GOB | GOB000001, GOB000002, GOB000003 |
| Krispp | KRI | KRI000001, KRI000002, KRI000003 |
| Tata MyBristo | TAT | TAT000001, TAT000002, TAT000003 |

## 🎉 Success Criteria

The implementation is successful when:
1. ✅ All order numbers follow the new format
2. ✅ Sequential numbering works correctly
3. ✅ Different cafes have different prefixes
4. ✅ Orders can be placed successfully
5. ✅ POS dashboard displays new order numbers
6. ✅ No existing functionality is broken

## 📝 Notes

- **Fallback System**: If the database function fails, the system automatically falls back to the old order number format
- **Thread Safety**: The database function handles concurrent orders safely
- **Daily Reset**: Order numbers reset to 000001 each day
- **Cafe Prefixes**: Automatically determined from cafe names

## 🚀 Ready for Production

Once all tests pass, the system is ready for production use!
