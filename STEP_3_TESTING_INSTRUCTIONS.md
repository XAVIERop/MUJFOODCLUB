# Step 3: Restart Server & Test

## 🎯 Once you've successfully run the SQL script in Supabase...

### A. Restart Development Server

In your terminal where `npm run dev` is running:

```bash
# Press Ctrl+C to stop the server
# Then restart:
npm run dev
```

Wait for: `➜  Local:   http://localhost:8080/`

---

### B. Test Checklist

#### Test 1: Homepage ✅
1. Open: http://localhost:8080
2. **Expected:** You should see all your cafes (Food Court, Pizza Bakers, etc.)
3. **If you see "No cafes available"**: Something is wrong, let me know

#### Test 2: Referral Code Validation (Test Page) ✅
1. Go to: http://localhost:8080/referral-test
2. In the input field, type: `PULKIT123`
3. **Expected:** Green checkmark ✅ appears with "Valid code from Pulkit Verma!"
4. Clear the field, type: `INVALID123`
5. **Expected:** Red X ❌ appears with "Invalid referral code"

#### Test 3: Signup with Referral Code ✅
1. Click "Sign Up" in header
2. Fill in test details:
   - Email: `test123@example.com`
   - Password: `Test1234!`
   - Full Name: `Test User`
   - Block: `B1`
   - Phone: `9876543210`
3. Scroll to "Referral Code (Optional)"
4. Type: `PULKIT123`
5. **Expected:** Green checkmark appears: "Valid code from Pulkit Verma!"
6. Click "Sign Up"
7. **Expected:** Account created successfully, no errors

#### Test 4: Checkout with Referral Code ✅
1. Browse any cafe (e.g., Food Court)
2. Add 2-3 items to cart (total should be > ₹50)
3. Click cart icon → "Proceed to Checkout"
4. Fill in delivery details
5. Scroll down to "Referral Code (Optional)"
6. Type: `PULKIT123`
7. **Expected Results:**
   - ✅ Green checkmark: "Valid code! You'll get ₹10 off your order"
   - ✅ Order summary shows: "Referral Discount -₹10.00"
   - ✅ Final total is reduced by ₹10
8. (Optional) Place the order to test complete flow

#### Test 5: Invalid Referral Code ✅
1. At checkout, try entering: `WRONGCODE`
2. **Expected:** Red X ❌ with "Invalid referral code"
3. **Expected:** No discount applied to total

---

### C. Database Verification (Optional but Recommended)

After placing a test order with a referral code:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
-- Check recent referral usage
SELECT * FROM referral_usage_tracking 
ORDER BY created_at DESC 
LIMIT 5;

-- Check orders with referral codes
SELECT 
    order_number, 
    referral_code_used, 
    discount_amount, 
    team_member_credit 
FROM orders 
WHERE referral_code_used IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 5;
```

3. **Expected:** You should see your test order with:
   - `referral_code_used = 'PULKIT123'`
   - `discount_amount = 10.00`
   - `team_member_credit = 0.50`

---

## ✅ Success Criteria

You'll know everything is working when:
- ✅ Homepage shows all cafes
- ✅ Test page validates codes correctly (green ✅ for valid, red ❌ for invalid)
- ✅ Signup accepts referral codes without errors
- ✅ Checkout shows ₹10 discount when valid code is entered
- ✅ No console errors in browser developer tools

---

## 🐛 Troubleshooting

### Issue: "No cafes available"
**Cause:** Database connection issue
**Fix:** 
1. Check .env.local has correct production URL
2. Restart dev server
3. Check browser console for errors

### Issue: "ReferralCodeInput not found"
**Cause:** Component not compiled
**Fix:** 
1. Restart dev server
2. Check for any build errors in terminal

### Issue: "Referral code validation not working"
**Cause:** SQL script not run or run on wrong database
**Fix:** 
1. Verify you ran script on PRODUCTION (kblazvxfducwviyyiwde)
2. Run this query to check:
   ```sql
   SELECT * FROM referral_codes;
   ```
3. Should see 5 codes (PULKIT123, TEAM002, etc.)

---

## 📞 Report Results

After testing, let me know:
1. ✅ Which tests passed
2. ❌ Which tests failed (if any)
3. Any error messages you see
4. Screenshots if helpful

Then we can proceed to commit and deploy! 🚀
