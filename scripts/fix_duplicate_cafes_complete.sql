-- Complete fix for duplicate Taste of India cafes
-- Step 1: Identify all Taste of India cafes
DO $$
DECLARE
    original_cafe_id UUID;
    duplicate_cafe_id UUID;
    chatkara_profile_id UUID;
    tasteofindia_profile_id UUID;
BEGIN
    -- Find the original Taste of India cafe (the one with menu items, older one)
    SELECT id INTO original_cafe_id
    FROM public.cafes
    WHERE name ILIKE '%taste of india%'
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- Find the duplicate (newer one)
    SELECT id INTO duplicate_cafe_id
    FROM public.cafes
    WHERE name ILIKE '%taste of india%'
      AND id != original_cafe_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    RAISE NOTICE 'Original Cafe ID: %', original_cafe_id;
    RAISE NOTICE 'Duplicate Cafe ID: %', duplicate_cafe_id;
    
    -- Get profile IDs
    SELECT id INTO chatkara_profile_id
    FROM public.profiles
    WHERE email = 'chatkara.owner@mujfoodclub.in';
    
    SELECT id INTO tasteofindia_profile_id
    FROM public.profiles
    WHERE email = 'tasteofindia.owner@mujfoodclub.in';
    
    RAISE NOTICE 'Chatkara Profile ID: %', chatkara_profile_id;
    RAISE NOTICE 'Taste of India Profile ID: %', tasteofindia_profile_id;
    
    -- Step 2: Update Taste of India owner to point to original cafe
    UPDATE public.profiles
    SET cafe_id = original_cafe_id,
        updated_at = NOW()
    WHERE id = tasteofindia_profile_id;
    
    -- Step 3: Update cafe_staff for Taste of India owner
    UPDATE public.cafe_staff
    SET cafe_id = original_cafe_id,
        updated_at = NOW()
    WHERE user_id = tasteofindia_profile_id;
    
    -- Step 4: Remove Chatkara owner's incorrect assignment to Taste of India
    -- First, get Chatkara cafe ID
    DECLARE chatkara_cafe_id UUID;
    BEGIN
        SELECT id INTO chatkara_cafe_id
        FROM public.cafes
        WHERE name ILIKE '%chatkara%'
        LIMIT 1;
        
        -- Update Chatkara profile to point to Chatkara cafe
        UPDATE public.profiles
        SET cafe_id = chatkara_cafe_id,
            updated_at = NOW()
        WHERE id = chatkara_profile_id;
        
        -- Delete incorrect Taste of India staff assignment for Chatkara owner
        -- (They already have a correct Chatkara staff record)
        DELETE FROM public.cafe_staff
        WHERE user_id = chatkara_profile_id
          AND cafe_id = original_cafe_id;
        
        RAISE NOTICE 'Removed incorrect Taste of India staff assignment for Chatkara owner';
        RAISE NOTICE 'Chatkara owner now correctly assigned to cafe: %', chatkara_cafe_id;
    END;
    
    -- Step 5: Delete duplicate Taste of India cafe (if exists and has no menu items)
    IF duplicate_cafe_id IS NOT NULL THEN
        -- Check if duplicate has any menu items
        DECLARE menu_count INT;
        BEGIN
            SELECT COUNT(*) INTO menu_count
            FROM public.menu_items
            WHERE cafe_id = duplicate_cafe_id;
            
            IF menu_count = 0 THEN
                -- Safe to delete - no menu items
                DELETE FROM public.cafe_staff WHERE cafe_id = duplicate_cafe_id;
                DELETE FROM public.cafes WHERE id = duplicate_cafe_id;
                RAISE NOTICE 'Deleted duplicate cafe: %', duplicate_cafe_id;
            ELSE
                RAISE NOTICE 'Duplicate cafe has % menu items - manual intervention needed', menu_count;
            END IF;
        END;
    END IF;
    
    RAISE NOTICE 'Fix completed successfully!';
END $$;

-- Verification: Check final state
SELECT 
    c.id,
    c.name,
    c.slug,
    c.priority,
    c.is_active,
    c.accepting_orders,
    COUNT(DISTINCT mi.id) as menu_items_count,
    COUNT(DISTINCT cs.id) as staff_count
FROM public.cafes c
LEFT JOIN public.menu_items mi ON c.id = mi.cafe_id
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id
WHERE c.name ILIKE '%taste of india%'
GROUP BY c.id, c.name, c.slug, c.priority, c.is_active, c.accepting_orders;

-- Check staff assignments
SELECT 
    cs.id as staff_record_id,
    cs.user_id,
    cs.role,
    cs.is_active,
    p.email,
    p.full_name,
    p.user_type,
    cs.cafe_id,
    c.name as cafe_name
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email IN ('tasteofindia.owner@mujfoodclub.in', 'chatkara.owner@mujfoodclub.in')
ORDER BY c.name;
