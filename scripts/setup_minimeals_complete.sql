-- =====================================================
-- Complete MINI MEALS Setup
-- =====================================================

-- 1. Get Mini Meals cafe ID
DO $$
DECLARE
    minimeals_cafe_id UUID;
    minimeals_owner_id UUID;
BEGIN
    -- Get Mini Meals cafe ID
    SELECT id INTO minimeals_cafe_id FROM public.cafes WHERE name = 'Mini Meals';
    
    IF minimeals_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Mini Meals cafe not found!';
    END IF;
    
    RAISE NOTICE 'Mini Meals Cafe ID: %', minimeals_cafe_id;
    
    -- 2. Create Mini Meals owner profile
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
        gen_random_uuid(),
        'minimeals.owner@mujfoodclub.in',
        'Mini Meals Owner',
        'cafe_owner',
        minimeals_cafe_id,
        0,
        'foodie',
        0,
        0,
        'CAFE_MINIMEALS_OWNER',
        NOW(),
        NOW()
    ) RETURNING id INTO minimeals_owner_id;
    
    RAISE NOTICE 'Mini Meals Owner ID: %', minimeals_owner_id;
    
    -- 3. Add Mini Meals owner to cafe_staff
    INSERT INTO public.cafe_staff (cafe_id, user_id, role, is_active)
    VALUES (minimeals_cafe_id, minimeals_owner_id, 'owner', true)
    ON CONFLICT (cafe_id, user_id) DO UPDATE SET
        role = 'owner',
        is_active = true,
        updated_at = NOW();
    
    -- 4. Configure Mini Meals WhatsApp (REPLACE WITH ACTUAL PHONE NUMBER)
    UPDATE public.cafes 
    SET 
        whatsapp_phone = '+91 XXXXXXXXXX', -- REPLACE WITH ACTUAL PHONE NUMBER
        whatsapp_enabled = true,
        whatsapp_notifications = true,
        updated_at = NOW()
    WHERE id = minimeals_cafe_id;
    
    RAISE NOTICE 'Mini Meals setup completed! NOTE: Update WhatsApp phone number!';
END $$;

-- 5. Verify Mini Meals setup
SELECT 
    '=== MINI MEALS SETUP VERIFICATION ===' as section,
    c.name,
    c.whatsapp_phone,
    c.whatsapp_enabled,
    c.whatsapp_notifications,
    p.email as owner_email,
    p.full_name as owner_name,
    cs.role,
    cs.is_active
FROM public.cafes c
LEFT JOIN public.cafe_staff cs ON c.id = cs.cafe_id AND cs.role = 'owner'
LEFT JOIN public.profiles p ON cs.user_id = p.id
WHERE c.name = 'Mini Meals';
