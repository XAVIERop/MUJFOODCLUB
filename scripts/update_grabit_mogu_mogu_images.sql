-- Update Mogu Mogu drink image URLs for Grabit
-- Run this after inserting the base items (they must exist already)

DO $$
DECLARE
    grabit_cafe_id UUID;
    updated_total INTEGER := 0;
    rows_updated INTEGER := 0;
BEGIN
    -- Locate Grabit cafe
    SELECT id INTO grabit_cafe_id
    FROM public.cafes
    WHERE LOWER(name) LIKE '%grabit%'
       OR LOWER(slug) = 'grabit'
    LIMIT 1;

    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found. Cannot update images.';
    END IF;

    RAISE NOTICE 'Updating Mogu Mogu images for Grabit (cafe_id=%)', grabit_cafe_id;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Pineapple.webp?updatedAt=1762536581522', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Pineapple (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Watermelon.webp?updatedAt=1762536581413', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Watermelon (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20BlackCurrant.webp?updatedAt=1762536581340', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Blackcurrant (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Strawberry.webp?updatedAt=1762536581515', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Strawberry (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Mango.webp?updatedAt=1762536581473', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Mango (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Grape.webp?updatedAt=1762536581477', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Grape (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Pink%20Guava.webp?updatedAt=1762536581355', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Pink Guava (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Apple.webp?updatedAt=1762536581343', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Apple (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Lychee.webp?updatedAt=1762536581458', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Lychee (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Orange.webp?updatedAt=1762536581369', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Orange (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    UPDATE public.menu_items
    SET image_url = 'https://ik.imagekit.io/foodclub/Grocery/Products/Mogu%20Mogu/Mogu%20Mogu%20Melon.webp?updatedAt=1762536581442', updated_at = NOW()
    WHERE cafe_id = grabit_cafe_id AND name = 'Mogu Mogu Melon (320ml)';
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    updated_total := updated_total + rows_updated;

    RAISE NOTICE 'Total Mogu Mogu items updated: %', updated_total;

END $$;

-- Verification query to confirm image URLs
SELECT 
    mi.name,
    mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name ILIKE 'mogu mogu%'
ORDER BY mi.name;

