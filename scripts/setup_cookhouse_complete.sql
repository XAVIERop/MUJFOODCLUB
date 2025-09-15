-- =====================================================
-- Complete COOK HOUSE Setup
-- =====================================================

-- 1. Get Cook House cafe ID
DO $$
DECLARE
    cookhouse_cafe_id UUID;
    cookhouse_owner_id UUID;
BEGIN
    -- Get Cook House cafe ID
    SELECT id INTO cookhouse_cafe_id FROM public.cafes WHERE name = 'COOK HOUSE';
    
    IF cookhouse_cafe_id IS NULL THEN
        RAISE EXCEPTION 'COOK HOUSE cafe not found!';
    END IF;
    
    RAISE NOTICE 'Cook House Cafe ID: %', cookhouse_cafe_id;
    
    -- 2. Create Cook House owner profile
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
        'cookhouse.owner@mujfoodclub.in',
        'Cook House Owner',
        'cafe_owner',
        cookhouse_cafe_id,
        0,
        'foodie',
        0,
        0,
        'CAFE_COOKHOUSE_OWNER',
        NOW(),
        NOW()
    ) RETURNING id INTO cookhouse_owner_id;
    
    RAISE NOTICE 'Cook House Owner ID: %', cookhouse_owner_id;
    
    -- 3. Add Cook House owner to cafe_staff
    INSERT INTO public.cafe_staff (cafe_id, user_id, role, is_active)
    VALUES (cookhouse_cafe_id, cookhouse_owner_id, 'owner', true)
    ON CONFLICT (cafe_id, user_id) DO UPDATE SET
        role = 'owner',
        is_active = true,
        updated_at = NOW();
    
    -- 4. Verify Cook House WhatsApp configuration
    UPDATE public.cafes 
    SET 
        whatsapp_phone = '+91 9116966635',
        whatsapp_enabled = true,
        whatsapp_notifications = true,
        updated_at = NOW()
    WHERE id = cookhouse_cafe_id;
    
    RAISE NOTICE 'Cook House setup completed successfully!';
END $$;

-- 5. Verify Cook House setup
SELECT 
    '=== COOK HOUSE SETUP VERIFICATION ===' as section,
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
WHERE c.name = 'COOK HOUSE';
