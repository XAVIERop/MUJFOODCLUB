# 🔧 Munch Box Auth Account Fix Guide

## **❌ Current Problem:**
- Munch Box cafe exists in database ✅
- Munch Box profile exists ✅  
- **Munch Box auth user does NOT exist** ❌
- Cannot login with credentials ❌

## **🔧 Solution Steps:**

### **Step 1: Create Auth User**
**Option A: Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add User"**
4. Fill in:
   - **Email**: `munchbox.owner@mujfoodclub.in`
   - **Password**: `Munchbox@2024`
   - **Auto Confirm**: ✅ Yes
   - **User Metadata**: 
     ```json
     {
       "full_name": "Munch Box Owner",
       "cafe_name": "Munch Box"
     }
     ```
5. Click **"Create User"**
6. **Copy the User ID** (you'll need this for Step 2)

### **Step 2: Update Profile**
1. Go to **SQL Editor** in Supabase dashboard
2. Run this query (replace `USER_ID_HERE` with the actual user ID from Step 1):

```sql
UPDATE public.profiles 
SET 
  id = 'USER_ID_HERE',  -- Replace with actual user ID
  updated_at = NOW()
WHERE email = 'munchbox.owner@mujfoodclub.in';
```

### **Step 3: Verify Fix**
Run this query to verify everything is working:

```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.accepting_orders,
  c.priority
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'munchbox.owner@mujfoodclub.in';
```

### **Step 4: Test Login**
- **Email**: `munchbox.owner@mujfoodclub.in`
- **Password**: `Munchbox@2024`

## **✅ Expected Result:**
- Munch Box owner can login to POS dashboard
- Profile is properly linked to auth user
- All cafe permissions work correctly

## **🔍 Troubleshooting:**
If login still fails:
1. Check if the auth user was created successfully
2. Verify the profile update worked
3. Ensure the user ID matches exactly
4. Check for any RLS (Row Level Security) policies blocking access
