-- CREATE TEST ORDER WITH ITEMS
-- This script creates a test order to verify the system works

-- 1. GET A TEST USER (first MUJ email user)
DO $$
DECLARE
    test_user_id UUID;
    test_cafe_id UUID;
    test_menu_item_id UUID;
    new_order_id UUID;
    new_order_number TEXT;
BEGIN
    -- Get first MUJ user
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email LIKE '%@muj.manipal.edu' 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No MUJ users found. Please create a user first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using test user: %', test_user_id;
    
    -- Get first cafe
    SELECT id INTO test_cafe_id 
    FROM public.cafes 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_cafe_id IS NULL THEN
        RAISE NOTICE 'No active cafes found.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using test cafe: %', test_cafe_id;
    
    -- Get first menu item
    SELECT id INTO test_menu_item_id 
    FROM public.menu_items 
    WHERE is_available = true 
    LIMIT 1;
    
    IF test_menu_item_id IS NULL THEN
        RAISE NOTICE 'No available menu items found.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using test menu item: %', test_menu_item_id;
    
    -- Generate order number
    new_order_number := 'TEST' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW())::INT % 10000)::TEXT, 4, '0');
    
    -- Create test order
    INSERT INTO public.orders (
        user_id,
        cafe_id,
        order_number,
        status,
        total_amount,
        delivery_block,
        payment_method,
        points_earned
    ) VALUES (
        test_user_id,
        test_cafe_id,
        new_order_number,
        'received',
        150.00,
        'B1',
        'cod',
        15
    ) RETURNING id INTO new_order_id;
    
    RAISE NOTICE 'Created test order: % with ID: %', new_order_number, new_order_id;
    
    -- Create test order items
    INSERT INTO public.order_items (
        order_id,
        menu_item_id,
        quantity,
        unit_price,
        total_price,
        special_instructions
    ) VALUES 
    (new_order_id, test_menu_item_id, 2, 75.00, 150.00, 'Test order item 1'),
    (new_order_id, test_menu_item_id, 1, 50.00, 50.00, 'Test order item 2');
    
    RAISE NOTICE 'Created test order items for order: %', new_order_number;
    
    -- Verify the test order
    RAISE NOTICE 'Verifying test order...';
    
END $$;

-- 2. VERIFY THE TEST ORDER WAS CREATED
SELECT 'Test order verification:' as status;
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  p.email,
  c.name as cafe_name,
  COUNT(oi.id) as item_count
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.cafes c ON o.cafe_id = c.id
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.order_number LIKE 'TEST%'
GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at, p.email, c.name
ORDER BY o.created_at DESC
LIMIT 1;

-- 3. SHOW TEST ORDER ITEMS
SELECT 'Test order items:' as status;
SELECT 
  oi.id,
  oi.order_id,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  oi.special_instructions,
  mi.name as menu_item_name,
  o.order_number
FROM public.order_items oi
JOIN public.menu_items mi ON oi.menu_item_id = mi.id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.order_number LIKE 'TEST%'
ORDER BY oi.id;

-- 4. SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE 'Test order creation completed!';
    RAISE NOTICE 'If you see the test order above, the system is working';
    RAISE NOTICE 'You can now test the orders page with this test data';
END $$;
