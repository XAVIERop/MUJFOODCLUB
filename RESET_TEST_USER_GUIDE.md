# 🔄 Reset Test User Account Guide

## 🎯 **Purpose**
Reset your `test@muj.manipal.edu` account to test the simplified points system from scratch.

## 🚀 **Quick Reset (Recommended)**

### **Step 1: Go to Supabase Dashboard**
1. Open your Supabase project
2. Go to **SQL Editor**

### **Step 2: Run Simple Reset Script**
Copy and paste this script:

```sql
-- Simple Reset for Test User
UPDATE public.profiles 
SET 
  loyalty_points = 0,
  total_orders = 0,
  total_spent = 0,
  monthly_spending = 0,
  loyalty_tier = 'foodie',
  is_new_user = true,
  new_user_orders_count = 0,
  last_maintenance_reset = NOW()
WHERE email = 'test@muj.manipal.edu';

-- Verify the reset
SELECT 
  'Test user profile reset to:' as status,
  email,
  full_name,
  loyalty_points,
  total_orders,
  total_spent,
  loyalty_tier,
  is_new_user,
  new_user_orders_count
FROM public.profiles 
WHERE email = 'test@muj.manipal.edu';
```

### **Step 3: Click "Run"**
The script will reset the user and show the updated profile.

## 🔍 **Complete Reset (If Needed)**

If you want to completely wipe all data for the test user:

### **Run Complete Reset Script**
```sql
-- 1. Delete all orders
DELETE FROM public.orders 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
);

-- 2. Delete all order items
DELETE FROM public.order_items 
WHERE order_id IN (
  SELECT id FROM public.orders 
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
  )
);

-- 3. Delete all loyalty transactions
DELETE FROM public.loyalty_transactions 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu'
);

-- 4. Reset profile
UPDATE public.profiles 
SET 
  loyalty_points = 0,
  total_orders = 0,
  total_spent = 0,
  monthly_spending = 0,
  loyalty_tier = 'foodie',
  is_new_user = true,
  new_user_orders_count = 0,
  last_maintenance_reset = NOW()
WHERE email = 'test@muj.manipal.edu';
```

## ✅ **What Gets Reset**

### **Profile Data**
- ✅ **Loyalty Points**: Reset to 0
- ✅ **Total Orders**: Reset to 0
- ✅ **Total Spent**: Reset to 0
- ✅ **Monthly Spending**: Reset to 0
- ✅ **Loyalty Tier**: Reset to 'foodie'
- ✅ **New User Status**: Reset to true
- ✅ **New User Orders Count**: Reset to 0

### **Optional (Complete Reset)**
- ✅ **All Orders**: Deleted
- ✅ **All Order Items**: Deleted
- ✅ **All Loyalty Transactions**: Deleted

## 🧪 **Testing After Reset**

### **Expected Behavior**
1. **First Order**: Base points + 50 welcome bonus
2. **No Multipliers**: Simple calculation only
3. **Tier Benefits**: Still active based on spending

### **Test Scenarios**

#### **Test 1: ₹500 Order**
- **Expected Points**: 25 (base) + 50 (welcome) = 75 points
- **Tier**: Foodie (5% points rate)

#### **Test 2: ₹1000 Order**
- **Expected Points**: 50 (base) + 50 (welcome) = 100 points
- **Tier**: Foodie (5% points rate)

#### **Test 3: ₹2000 Order (After reaching Connoisseur)**
- **Expected Points**: 200 (base) + 50 (welcome) = 250 points
- **Tier**: Connoisseur (10% points rate)

## 🔧 **Troubleshooting**

### **If Reset Doesn't Work**
1. **Check User Exists**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'test@muj.manipal.edu';
   ```

2. **Check Profile Exists**
   ```sql
   SELECT * FROM public.profiles WHERE email = 'test@muj.manipal.edu';
   ```

3. **Manual Reset**
   ```sql
   -- If user doesn't exist, create profile manually
   INSERT INTO public.profiles (
     id, email, full_name, user_type, block,
     loyalty_points, loyalty_tier, total_orders, total_spent,
     qr_code, is_new_user, new_user_orders_count
   ) VALUES (
     'USER_ID_FROM_AUTH', 'test@muj.manipal.edu', 'Test User', 'student', 'B1',
     0, 'foodie', 0, 0, 'STUDENT_B1_USER_ID', true, 0
   );
   ```

## 🎯 **Next Steps After Reset**

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5)
   - Or use incognito mode

2. **Sign In Again**
   - Use `test@muj.manipal.edu`
   - Your password

3. **Test Points Calculation**
   - Go to checkout
   - Verify simplified points calculation
   - Check for welcome bonus

4. **Verify No Multipliers**
   - Points should be base rate only
   - No 1.5x or 1.25x multipliers

## 📊 **Verification Checklist**

- [ ] Profile reset to initial state
- [ ] Loyalty points = 0
- [ ] Total orders = 0
- [ ] Total spent = 0
- [ ] Loyalty tier = 'foodie'
- [ ] Is new user = true
- [ ] New user orders count = 0
- [ ] Can sign in successfully
- [ ] Points calculation shows simplified values

Your test user is now ready for fresh testing! 🎉
