-- Remove ELICIT 2025 cafe and all related data
-- This script will clean up the ELICIT event system from the database

-- Get the ELICIT cafe ID first
DO $$
DECLARE
    elicit_cafe_id UUID;
BEGIN
    -- Get the ELICIT cafe ID
    SELECT id INTO elicit_cafe_id FROM cafes WHERE name = 'ELICIT 2025';
    
    IF elicit_cafe_id IS NOT NULL THEN
        -- First, remove all menu items for ELICIT 2025 cafe
        DELETE FROM menu_items WHERE cafe_id = elicit_cafe_id;
        
        -- Remove all orders for ELICIT 2025 cafe
        DELETE FROM orders WHERE cafe_id = elicit_cafe_id;
        
        -- Remove any cafe staff entries for ELICIT
        DELETE FROM cafe_staff WHERE cafe_id = elicit_cafe_id;
        
        -- Remove the ELICIT cafe owner account (if exists)
        -- This needs to be done before removing the cafe due to foreign key constraints
        DELETE FROM profiles WHERE email = 'elicit@mujfoodclub.in';
        
        -- Now remove the ELICIT 2025 cafe
        DELETE FROM cafes WHERE id = elicit_cafe_id;
        
        RAISE NOTICE 'ELICIT 2025 cafe and all related data removed successfully';
    ELSE
        RAISE NOTICE 'ELICIT 2025 cafe not found';
    END IF;
END $$;

-- Note: The auth.users entry for elicit@mujfoodclub.in will remain
-- as it's managed by Supabase Auth and should be removed manually
-- from the Supabase Dashboard if needed
