-- Add Mogu Mogu drinks (320ml) to Grabit without images
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    grabit_cafe_id UUID;
    inserted_count INTEGER := 0;
BEGIN
    -- Locate Grabit cafe by name or slug
    SELECT id INTO grabit_cafe_id
    FROM public.cafes
    WHERE LOWER(name) LIKE '%grabit%'
       OR LOWER(slug) = 'grabit'
    LIMIT 1;

    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found. Please verify cafe setup.';
    END IF;

    RAISE NOTICE 'Adding Mogu Mogu drinks to Grabit (cafe_id=%)', grabit_cafe_id;

    -- Insert Mogu Mogu drinks (all priced at ₹70, size 320ml)
    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url)
    VALUES
        (gen_random_uuid(), 'Mogu Mogu Pineapple (320ml)', 'Mogu Mogu Pineapple drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Watermelon (320ml)', 'Mogu Mogu Watermelon drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Blackcurrant (320ml)', 'Mogu Mogu Blackcurrant drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Strawberry (320ml)', 'Mogu Mogu Strawberry drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Mango (320ml)', 'Mogu Mogu Mango drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Grape (320ml)', 'Mogu Mogu Grape drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Pink Guava (320ml)', 'Mogu Mogu Pink Guava drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Apple (320ml)', 'Mogu Mogu Apple drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Lychee (320ml)', 'Mogu Mogu Lychee drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Orange (320ml)', 'Mogu Mogu Orange drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL),
        (gen_random_uuid(), 'Mogu Mogu Melon (320ml)', 'Mogu Mogu Melon drink - 320ml bottle', 70, 'DRINKS', true, false, 0, grabit_cafe_id, NULL)
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RAISE NOTICE 'Inserted % Mogu Mogu items.', inserted_count;

END $$;

-- Verification query: list newly added Mogu Mogu drinks for Grabit
SELECT 
    mi.name,
    mi.price,
    mi.category,
    mi.is_available,
    mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name ILIKE 'mogu mogu%'
ORDER BY mi.name;





