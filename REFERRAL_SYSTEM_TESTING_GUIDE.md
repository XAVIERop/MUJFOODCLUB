# 🎯 Referral System Testing Guide

## ✅ WHAT YOU NEED TO DO NOW:

### Step 1: Update Environment Variables (IMPORTANT!)

1. Open your `.env.local` file
2. Change the Supabase URL and API key to **PRODUCTION**:

```bash
# PRODUCTION Database (Main Branch)
VITE_SUPABASE_URL=https://kblazvxfducwviyyiwde.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NjQ3MDIsImV4cCI6MjA1MTE0MDcwMn0.Zf3L4gHM2mHPV0EYbUPrfN7yS1TnoVLNL7AJGhZ7pYo
```

3. Save the file

### Step 2: Add Referral Tables to Production Database

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your **PRODUCTION** project (kblazvxfducwviyyiwde)
3. Go to **SQL Editor**
4. Open the file: `scripts/add_referral_to_production_safe.sql`
5. Copy and paste the entire script
6. Click **Run**
7. You should see: ✅ REFERRAL SYSTEM ADDED TO PRODUCTION SUCCESSFULLY!

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 4: Test the System

#### 🧪 Test 1: Homepage Check
- Open http://localhost:8080
- ✅ You should see all your cafes (not "No cafes available")

#### 🧪 Test 2: Signup with Referral Code
1. Go to Sign Up page
2. Fill in your details
3. Enter referral code: `PULKIT123`
4. ✅ You should see a green checkmark: "Valid code!"
5. Complete signup
6. ✅ Signup should work without errors

#### 🧪 Test 3: Checkout with Referral Code
1. Browse a cafe menu (e.g., Food Court)
2. Add items to cart
3. Go to Checkout
4. Scroll down to "Referral Code (Optional)" field
5. Enter: `PULKIT123`
6. ✅ You should see: "Valid code! You'll get ₹10 off your order"
7. ✅ Order summary should show: "Referral Discount -₹10.00"
8. ✅ Final total should be reduced by ₹10
9. Place the order
10. ✅ Order should be placed successfully

#### 🧪 Test 4: Invalid Referral Code
1. Try entering: `INVALID123`
2. ✅ You should see a red X: "Invalid referral code"
3. ✅ No discount should be applied

#### 🧪 Test 5: Database Verification
1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
```sql
-- Check referral usage tracking
SELECT * FROM referral_usage_tracking ORDER BY created_at DESC LIMIT 5;

-- Check orders with referral codes
SELECT order_number, referral_code_used, discount_amount, team_member_credit 
FROM orders 
WHERE referral_code_used IS NOT NULL 
ORDER BY created_at DESC LIMIT 5;
```
3. ✅ You should see your test order with referral code tracked

---

## 🎉 WHAT'S BEEN BUILT:

### ✅ Completed Features:
1. **Referral Code Validation** - Real-time validation with green/red indicators
2. **Signup Integration** - Users can enter referral codes during signup
3. **Checkout Integration** - Users can enter referral codes during checkout
4. **₹10 Discount** - Automatic discount application for valid codes
5. **Order Tracking** - All referral usage is tracked in database
6. **Team Member Credit** - ₹0.50 per order for team members
7. **Database Schema** - All tables, functions, and indexes created
8. **Test Page** - /referral-test for manual testing

### 📊 Database Tables Created:
- `referral_codes` - Store team member referral codes
- `team_member_performance` - Track team member analytics
- `referral_usage_tracking` - Track all referral usage
- `profiles` - Added referral columns
- `orders` - Added referral columns

### 🎯 Sample Referral Codes:
- `PULKIT123` - Pulkit Verma
- `TEAM002` - Sarah Johnson
- `TEAM003` - Mike Chen
- `TEAM004` - Emma Davis
- `TEAM005` - Alex Kumar

---

## 🚀 NEXT STEPS (Future):

### Not Yet Built (For Future Development):
1. **Admin Dashboard** - View team member analytics
2. **QR Code Generation** - Generate QR codes for team members
3. **Tiered Rewards** - Implement 1-50, 51-100, 100+ order tiers
4. **Mobile Optimization** - Ensure mobile UI is perfect

---

## 🐛 TROUBLESHOOTING:

### Issue: "No cafes available"
**Solution:** Check your `.env.local` - ensure it's pointing to production database

### Issue: "Referral code validation not working"
**Solution:** Make sure you ran the SQL script in production database

### Issue: "ReferralCodeInput not found"
**Solution:** Make sure all files are saved and dev server is restarted

---

## 📝 FILES MODIFIED:

### New Files Created:
- `src/services/referralService.ts`
- `src/components/ReferralCodeInput.tsx`
- `src/pages/ReferralTest.tsx`
- `scripts/add_referral_to_production_safe.sql`

### Files Modified:
- `src/pages/Auth.tsx` - Added referral code input to signup
- `src/hooks/useAuth.tsx` - Added referral code processing
- `src/pages/Checkout.tsx` - Added referral code input and tracking
- `src/App.tsx` - Added ReferralTest route

---

## 🎯 SUCCESS CRITERIA:

You'll know the system is working when:
- ✅ Homepage shows all cafes
- ✅ Signup with referral code shows green checkmark
- ✅ Checkout with referral code applies ₹10 discount
- ✅ Invalid codes show red X
- ✅ Orders are tracked in database with referral_code_used
- ✅ No console errors

---

**Ready to test! Follow the steps above and let me know if you encounter any issues.** 🚀
