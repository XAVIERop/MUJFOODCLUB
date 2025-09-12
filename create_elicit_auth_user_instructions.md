# ELICIT Cafe Account Setup Instructions

## Step 1: Run the Cafe Setup Script
First, run `setup_elicit_cafe_only.sql` in Supabase SQL Editor to configure the ELICIT cafe.

## Step 2: Create Auth User in Supabase Dashboard

### 2.1 Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**

### 2.2 Create the User
Fill in the following details:
- **Email**: `elicit@mujfoodclub.in`
- **Password**: `Elicit123!@#`
- **Email Confirmed**: ✅ (check this box)
- **Phone**: `+91-9876543210`

### 2.3 Get the User ID
After creating the user, copy the **User ID** from the user details page.

## Step 3: Create Profile and Link to Cafe

Run this SQL script in Supabase SQL Editor, replacing `YOUR_USER_ID_HERE` with the actual User ID from Step 2.3:

```sql
-- Create ELICIT profile and link to cafe
DO $$
DECLARE
    elicit_cafe_id UUID;
    elicit_user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace with actual User ID
BEGIN
    -- Get ELICIT cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE slug = 'elicit-2025';
    
    IF elicit_cafe_id IS NULL THEN
        RAISE NOTICE 'ELICIT cafe not found.';
        RETURN;
    END IF;
    
    -- Create profile for ELICIT user
    INSERT INTO profiles (
        id,
        full_name,
        email,
        phone,
        user_type,
        cafe_id,
        block,
        created_at,
        updated_at
    ) VALUES (
        elicit_user_id,
        'ELICIT Cafe Owner',
        'elicit@mujfoodclub.in',
        '+91-9876543210',
        'cafe_owner',
        elicit_cafe_id,
        NULL,
        NOW(),
        NOW()
    );
    
    -- Link ELICIT cafe to the user
    UPDATE cafes 
    SET 
        owner_id = elicit_user_id,
        updated_at = NOW()
    WHERE id = elicit_cafe_id;
    
    -- Create cafe_staff entry
    INSERT INTO cafe_staff (
        id,
        cafe_id,
        user_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        elicit_cafe_id,
        elicit_user_id,
        'owner',
        true,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'ELICIT cafe account created successfully!';
    RAISE NOTICE 'Email: elicit@mujfoodclub.in';
    RAISE NOTICE 'Password: Elicit123!@#';
    RAISE NOTICE 'User ID: %', elicit_user_id;
    RAISE NOTICE 'Cafe ID: %', elicit_cafe_id;
    
END $$;

-- Verify the setup
SELECT 
    c.name as cafe_name,
    c.owner_id,
    p.full_name,
    p.email,
    p.user_type,
    cs.role as staff_role,
    cs.is_active
FROM cafes c
LEFT JOIN profiles p ON c.owner_id = p.id
LEFT JOIN cafe_staff cs ON c.id = cs.cafe_id AND c.owner_id = cs.user_id
WHERE c.slug = 'elicit-2025';
```

## Step 4: Test the Account
1. Go to your app's login page
2. Login with `elicit@mujfoodclub.in` / `Elicit123!@#`
3. Verify you can access the POS dashboard for ELICIT orders

## Summary
- **Email**: `elicit@mujfoodclub.in`
- **Password**: `Elicit123!@#`
- **Role**: Cafe Owner
- **Cafe**: ELICIT 2025
- **Access**: Full POS dashboard access
