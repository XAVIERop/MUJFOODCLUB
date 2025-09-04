# Food Court Owner Account Setup Guide

## Overview
This guide will help you create a cafe owner account for Food Court with the email `foodcourt.owner@mujfoodclub.in`.

## Step 1: Create the User Account

### Option A: Through Supabase Dashboard (Recommended)
1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**
4. Fill in the details:
   - **Email**: `foodcourt.owner@mujfoodclub.in`
   - **Password**: Create a strong password
   - **Email Confirmed**: ✅ Check this box
5. Click **"Create User"**

### Option B: Through the App
1. Go to your app's signup page
2. Use email: `foodcourt.owner@mujfoodclub.in`
3. Create a password and complete signup
4. Verify the email if required

## Step 2: Assign Cafe Ownership

### Run the SQL Script
1. Go to **Supabase SQL Editor**
2. Run the script: `scripts/assign_food_court_ownership.sql`

```sql
-- Assign Food Court Ownership to Existing User
-- Run this AFTER the user has signed up with foodcourt.owner@mujfoodclub.in

-- 1. Get Food Court cafe ID
DO $$
DECLARE
    food_court_id UUID;
    owner_user_id UUID;
BEGIN
    -- Get Food Court cafe ID
    SELECT id INTO food_court_id FROM public.cafes WHERE name = 'FOOD COURT';
    
    -- Get user ID
    SELECT id INTO owner_user_id FROM public.profiles WHERE email = 'foodcourt.owner@mujfoodclub.in';
    
    IF food_court_id IS NULL THEN
        RAISE EXCEPTION 'Food Court cafe not found.';
    END IF;
    
    IF owner_user_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found. Please ensure the user has signed up first.';
    END IF;
    
    -- Update profile to be cafe owner
    UPDATE public.profiles 
    SET 
        user_type = 'cafe_owner',
        cafe_id = food_court_id,
        updated_at = NOW()
    WHERE email = 'foodcourt.owner@mujfoodclub.in';
    
    -- Update cafe staff entry with user_id
    UPDATE public.cafe_staff 
    SET 
        user_id = owner_user_id,
        updated_at = NOW()
    WHERE cafe_id = food_court_id 
    AND email = 'foodcourt.owner@mujfoodclub.in';
    
    RAISE NOTICE 'Successfully assigned Food Court ownership to foodcourt.owner@mujfoodclub.in';
    
END $$;

-- 2. Verify the assignment
SELECT 
    p.email,
    p.full_name,
    p.user_type,
    c.name as cafe_name,
    cs.role,
    cs.is_active
FROM public.profiles p
JOIN public.cafes c ON p.cafe_id = c.id
JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.user_id = p.id
WHERE p.email = 'foodcourt.owner@mujfoodclub.in';
```

## Step 3: Verify the Setup

### Check the Results
After running the script, you should see:
- **Email**: foodcourt.owner@mujfoodclub.in
- **User Type**: cafe_owner
- **Cafe Name**: FOOD COURT
- **Role**: owner
- **Is Active**: true

## Step 4: Test the Account

### Login and Access
1. **Login** with `foodcourt.owner@mujfoodclub.in`
2. **Access Cafe Dashboard** - Should see Food Court management options
3. **Manage Menu** - Can add/edit Food Court menu items
4. **View Orders** - Can see and manage Food Court orders
5. **Analytics** - Can view Food Court sales and performance

## What the Owner Can Do

### Menu Management
- ✅ Add new menu items
- ✅ Edit existing items
- ✅ Update prices
- ✅ Manage availability
- ✅ Set preparation times

### Order Management
- ✅ View incoming orders
- ✅ Update order status
- ✅ Mark orders as completed
- ✅ Handle order cancellations

### Analytics & Reports
- ✅ View sales data
- ✅ Track performance metrics
- ✅ Monitor customer ratings
- ✅ Export reports

## Troubleshooting

### If the script fails:
1. **Check if Food Court exists**: Run `SELECT * FROM cafes WHERE name = 'FOOD COURT';`
2. **Check if user exists**: Run `SELECT * FROM profiles WHERE email = 'foodcourt.owner@mujfoodclub.in';`
3. **Check cafe staff table**: Run `SELECT * FROM cafe_staff WHERE email = 'foodcourt.owner@mujfoodclub.in';`

### If login doesn't work:
1. **Verify email confirmation** in Supabase Auth
2. **Check user status** in Authentication → Users
3. **Reset password** if needed

## Security Notes

- ✅ **Strong Password**: Use a secure password
- ✅ **Email Verification**: Ensure email is confirmed
- ✅ **Access Control**: Only the owner should have access
- ✅ **Regular Updates**: Keep the account secure

## Support

If you encounter any issues:
1. Check the Supabase logs
2. Verify all database entries
3. Test the login process
4. Contact support if needed

---

**Account Details:**
- **Email**: foodcourt.owner@mujfoodclub.in
- **Cafe**: FOOD COURT
- **Role**: Owner
- **Access Level**: Full Management
