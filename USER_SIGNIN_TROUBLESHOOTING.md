# 🔧 User Sign-In Troubleshooting Guide

## 🚨 **Issue**: New user `test@muj.manipal.edu` cannot sign in

## 🔍 **Debugging Steps**

### **1. Check User Status in Supabase Dashboard**

#### **A. Check Auth Users**
1. Go to Supabase Dashboard → Authentication → Users
2. Search for `test@muj.manipal.edu`
3. Check if user exists and note:
   - ✅ **Email Confirmed**: Should be `true`
   - ✅ **Created At**: When user was created
   - ✅ **Last Sign In**: Should be recent if sign-in worked

#### **B. Check Profiles Table**
1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Filter by email: `test@muj.manipal.edu`
3. Check if profile exists with:
   - ✅ **ID**: Should match auth user ID
   - ✅ **User Type**: Should be `student`
   - ✅ **Loyalty Tier**: Should be `foodie`
   - ✅ **Block**: Should have a valid block

### **2. Common Issues & Solutions**

#### **Issue A: Email Not Confirmed**
**Symptoms**: User exists but cannot sign in
**Solution**:
1. In Supabase Dashboard → Authentication → Users
2. Find the user and click "Send confirmation email"
3. Or manually confirm by setting `email_confirmed_at` to current timestamp

#### **Issue B: No Profile Created**
**Symptoms**: User exists in auth but no profile
**Solution**:
```sql
-- Create profile manually
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  user_type,
  block,
  loyalty_points,
  loyalty_tier,
  total_orders,
  total_spent,
  qr_code
) VALUES (
  'USER_ID_FROM_AUTH', -- Replace with actual user ID
  'test@muj.manipal.edu',
  'Test User',
  'student',
  'B1',
  0,
  'foodie',
  0,
  0,
  'STUDENT_B1_USER_ID'
);
```

#### **Issue C: Wrong Password**
**Symptoms**: "Invalid login credentials" error
**Solution**:
1. Reset password in Supabase Dashboard
2. Or create new user with known password

#### **Issue D: RLS Policy Issues**
**Symptoms**: User can sign in but profile not loading
**Solution**: Check RLS policies on `profiles` table

### **3. Manual User Creation (If Needed)**

#### **Step 1: Create Auth User**
```sql
-- This requires admin access, usually done via Supabase Dashboard
-- Go to Authentication → Users → Add User
-- Email: test@muj.manipal.edu
-- Password: [set a strong password]
-- Confirm email: Yes
```

#### **Step 2: Create Profile**
```sql
-- Get the user ID from auth.users first
SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu';

-- Then create profile (replace USER_ID with actual ID)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  user_type,
  block,
  loyalty_points,
  loyalty_tier,
  total_orders,
  total_spent,
  qr_code,
  is_new_user,
  new_user_orders_count
) VALUES (
  'USER_ID',
  'test@muj.manipal.edu',
  'Test User',
  'student',
  'B1',
  0,
  'foodie',
  0,
  0,
  'STUDENT_B1_USER_ID',
  true,
  0
);
```

### **4. Test Sign-In Process**

#### **Frontend Testing**
1. Go to `/auth` page
2. Try sign-in with:
   - Email: `test@muj.manipal.edu`
   - Password: [the password you set]
3. Check browser console for errors
4. Check network tab for failed requests

#### **Backend Testing**
Run the debug script:
```bash
cd scripts
node debug_user_signin.js
```

### **5. Check Database Permissions**

#### **RLS Policies**
Ensure these policies exist on `profiles` table:
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);
```

### **6. Email Verification Issues**

#### **If Email Not Received**
1. Check spam/junk folder
2. Check email deliverability settings in Supabase
3. Try resending confirmation email
4. Use magic link authentication instead

#### **Magic Link Alternative**
1. Go to `/auth` page
2. Click "Quick Email Verification"
3. Enter `test@muj.manipal.edu`
4. Check email for magic link
5. Click link to sign in

### **7. Common Error Messages**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Invalid login credentials" | Wrong password/email | Reset password or check email |
| "Email not confirmed" | User hasn't verified email | Send confirmation email |
| "User not found" | User doesn't exist in auth | Create user in Supabase Dashboard |
| "Profile not found" | No profile created | Create profile manually |
| "Access denied" | RLS policy issue | Check RLS policies |

### **8. Quick Fix Commands**

#### **Reset User Password**
```sql
-- In Supabase Dashboard → Authentication → Users
-- Find user and click "Reset password"
```

#### **Confirm Email Manually**
```sql
-- Update auth.users table (requires admin access)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test@muj.manipal.edu';
```

#### **Create Missing Profile**
```sql
-- Get user ID first
SELECT id FROM auth.users WHERE email = 'test@muj.manipal.edu';

-- Create profile (replace USER_ID)
INSERT INTO public.profiles (
  id, email, full_name, user_type, block, 
  loyalty_points, loyalty_tier, total_orders, total_spent, qr_code
) VALUES (
  'USER_ID', 'test@muj.manipal.edu', 'Test User', 'student', 'B1',
  0, 'foodie', 0, 0, 'STUDENT_B1_USER_ID'
);
```

## 🎯 **Next Steps**

1. **Check Supabase Dashboard** for user status
2. **Run debug scripts** to identify the issue
3. **Apply appropriate fix** based on the problem
4. **Test sign-in** after fixing
5. **Verify profile loading** works correctly

## 📞 **If Still Having Issues**

1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Verify Supabase project settings
4. Check email deliverability configuration
5. Test with a different email address
