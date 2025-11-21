-- Add Kurkure chips items for Grabit with provided ImageKit URLs
-- Run in Supabase SQL editor after ensuring Grabit cafe exists

DO $$
DECLARE
    grabit_cafe_id UUID;
BEGIN
    SELECT id INTO grabit_cafe_id
    FROM public.cafes
    WHERE LOWER(name) LIKE '%grabit%'
       OR LOWER(slug) = 'grabit'
    LIMIT 1;

    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found.';
    END IF;

    INSERT INTO public.menu_items (id, name, description, price, category, is_available, out_of_stock, preparation_time, cafe_id, image_url)
    VALUES
        (gen_random_uuid(), 'Kurkure Puffcorn Yummy Cheese', 'Kurkure Puffcorn Yummy Cheese', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Kurkure/Puffcorn%20Yummy%20Cheese.avif?updatedAt=1762541123340'),
        (gen_random_uuid(), 'Kurkure Green Chutney Style', 'Kurkure Green Chutney Style', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Kurkure/Green%20Chutney%20Style.webp?updatedAt=1762541123512'),
        (gen_random_uuid(), 'Kurkure Solid Masti', 'Kurkure Solid Masti', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Kurkure/Solid%20Masti.webp?updatedAt=1762541123284'),
        (gen_random_uuid(), 'Kurkure Chilli Chatka', 'Kurkure Chilli Chatka', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Kurkure/Chilli%20Chatka.webp?updatedAt=1762541123579'),
        (gen_random_uuid(), 'Kurkure Masala Munch', 'Kurkure Masala Munch', 20, 'CHIPS', true, false, 0, grabit_cafe_id, 'https://ik.imagekit.io/foodclub/Grocery/Products/Chips/Kurkure/Masala%20Munch.webp?updatedAt=1762541123554')
    ON CONFLICT DO NOTHING;

END $$;

-- Verification query
SELECT mi.name, mi.price, mi.category, mi.image_url
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE (LOWER(c.name) LIKE '%grabit%' OR LOWER(c.slug) = 'grabit')
  AND mi.name LIKE 'Kurkure%';





