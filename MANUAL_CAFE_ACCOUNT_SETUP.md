# 🏪 Manual Cafe Account Setup Guide

## **Overview**
This system now works with **pre-created cafe owner accounts**. Only students can sign up, while cafe owners use credentials provided by the admin.

## **Current Status**
✅ **Student Signup**: Enabled for `@muj.manipal.edu` emails  
✅ **Cafe Owner Signup**: Disabled (accounts pre-created)  
✅ **Cafe Owner Login**: Enabled with pre-created credentials  
✅ **Data Isolation**: Each cafe sees only their data  

## **Chatkara Cafe Account**

### **Login Credentials**
- **Email**: `chatkara.owner@mujfoodclub.in`
- **Password**: `Chatkara1203!@#`
- **Cafe**: Chatkara
- **Access**: Full cafe dashboard

## **How to Create Cafe Owner Accounts**

### **Step 1: Create User in Supabase Auth**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter:
   - **Email**: `chatkara.owner@mujfoodclub.in`
   - **Password**: `Chatkara1203!@#`
   - **Email Confirm**: `true`
4. Click "Create User"
5. **Copy the User ID** (you'll need this)

### **Step 2: Create Profile in Database**
1. Go to Supabase Dashboard → SQL Editor
2. Run the migration first:
   ```sql
   -- Run this migration first
   -- File: supabase/migrations/20250825190054_add_user_type_and_cafe_id_to_profiles.sql
   ```

3. Then create the profile:
   ```sql
   INSERT INTO public.profiles (
     id,
     email,
     full_name,
     user_type,
     cafe_id,
     loyalty_points,
     loyalty_tier,
     total_orders,
     total_spent,
     qr_code,
     created_at,
     updated_at
   ) VALUES (
     'USER_ID_FROM_STEP_1', -- Replace with actual user ID
     'chatkara.owner@mujfoodclub.in',
     'Chatkara Cafe Owner',
     'cafe_owner',
     (SELECT id FROM public.cafes WHERE name = 'Chatkara' LIMIT 1),
     0,
     'foodie',
     0,
     0,
     'CAFE_CHATKARA_OWNER',
     NOW(),
     NOW()
   );
   ```

### **Step 3: Verify Account Creation**
```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in';
```

## **Testing the System**

### **Test 1: Student Signup (Should Work)**
1. Go to `/auth` → Sign Up
2. Email: `student@muj.manipal.edu`
3. **Expected**: Account created, redirected to student features

### **Test 2: Cafe Owner Signup (Should Fail)**
1. Go to `/auth` → Sign Up
2. Email: `chatkara.owner@mujfoodclub.in`
3. **Expected**: Error message about pre-created accounts

### **Test 3: Cafe Owner Login (Should Work)**
1. Go to `/auth` → Sign In
2. Email: `chatkara.owner@mujfoodclub.in`
3. Password: `Chatkara1203!@#`
4. **Expected**: Redirected to cafe dashboard showing "Managing: Chatkara"

## **System Behavior**

### **For Students:**
- ✅ **Can Sign Up**: With `@muj.manipal.edu` emails
- ✅ **Can Sign In**: Access student features
- ❌ **Cannot Access**: Cafe dashboard

### **For Cafe Owners:**
- ❌ **Cannot Sign Up**: Accounts pre-created by admin
- ✅ **Can Sign In**: With provided credentials
- ✅ **Can Access**: Their specific cafe dashboard

## **Adding More Cafes**

### **Template for New Cafe**
```sql
-- Replace these values for each new cafe
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  user_type,
  cafe_id,
  -- ... other fields
) VALUES (
  'NEW_USER_ID',
  'cafename.owner@mujfoodclub.in',
  'Cafe Name Owner',
  'cafe_owner',
  (SELECT id FROM public.cafes WHERE name = 'Cafe Name' LIMIT 1),
  -- ... other values
);
```

## **Security Features**
- **No Self-Registration**: Cafe owners cannot create accounts
- **Admin Control**: Only you can create cafe accounts
- **Data Isolation**: Each cafe sees only their data
- **Role-Based Access**: Clear separation of permissions

## **Current Implementation Status**
✅ **Dual Domain Support**: `@muj.manipal.edu` and `@mujfoodclub.in`  
✅ **Student Signup**: Fully functional  
✅ **Cafe Owner Signup**: Disabled with clear messaging  
✅ **Cafe Owner Login**: Ready for pre-created accounts  
✅ **Dashboard Access**: Role-based routing implemented  
✅ **Data Isolation**: Cafe-specific data display  

## **Next Steps**
1. **Run Database Migration**: Add user_type and cafe_id fields
2. **Create Chatkara Account**: Follow the setup steps above
3. **Test Login**: Verify cafe owner can access dashboard
4. **Add More Cafes**: Repeat process for other cafes

The system is ready for manual cafe account creation! 🚀
