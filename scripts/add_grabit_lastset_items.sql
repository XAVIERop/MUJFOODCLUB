-- Upsert items from public/lastset.csv into Grabit menu

DO $$
DECLARE
    grabit_cafe_id UUID;
    updated_rows INTEGER;
    item_record RECORD;
BEGIN
    SELECT id INTO grabit_cafe_id
    FROM public.cafes
    WHERE LOWER(name) LIKE '%grabit%'
       OR LOWER(slug) = 'grabit'
    LIMIT 1;

    IF grabit_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Grabit cafe not found.';
    END IF;

    FOR item_record IN
        SELECT *
        FROM (
            VALUES
                ('Bikano Karare Peanuts 200g', 'Bikano Karare Peanuts 200g Pack', 60::numeric, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Karare_Peanut_200g-1.webp?updatedAt=1762610639296', ARRAY['Karare Peanuts'], 'snacks'),
                ('Bikano Chana Pataka 200g', 'Bikano Chana Pataka 200g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Chana%20Pataka%20.webp?updatedAt=1762610639711', ARRAY['Chana Pataka'], 'snacks'),
                ('Bikano Aloo Bhujia 225g', 'Bikano Aloo Bhujia 225g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Aloo%20Bhujia%20.webp?updatedAt=1762610640486', ARRAY['Aloo Bhujia'], 'snacks'),
                ('Bikano Bhelpuri Mixture 200g', 'Bikano Bhelpuri Mixture 200g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Bhelpuri%20Mixture%20.webp?updatedAt=1762610639288', ARRAY['Bhelpuri Mixture'], 'snacks'),
                ('Bikano Tasty Peanuts 225g', 'Bikano Tasty Peanuts 225g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Tasty%20Peanuts%20.webp?updatedAt=1762610639544', ARRAY['Tasty Peanuts'], 'snacks'),
                ('Bikano Matar Masala 200g', 'Bikano Matar Masala 200g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Matar%20Masala%20%20.webp?updatedAt=1762610723330', ARRAY['Matar Masala'], 'snacks'),
                ('Bikano All In One 200g', 'Bikano All In One 200g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/All%20In%20One%20.jpeg?updatedAt=1762610639028', ARRAY['All In One'], 'snacks'),
                ('Bikano Natkhat Nimbu 250g', 'Bikano Natkhat Nimbu 250g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Natkhat%20Nimbu%20.webp?updatedAt=1762610640514', ARRAY['Natkhat Nimbu'], 'snacks'),
                ('Bikano Khatta Meetha 250g', 'Bikano Khatta Meetha 250g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Khatta%20Meetha%20.webp?updatedAt=1762610641131', ARRAY['Khatta Meetha'], 'snacks'),
                ('Bikano Chana Masala 200g', 'Bikano Chana Masala 200g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Chana%20Masala.webp?updatedAt=1762610640734', ARRAY['Chana Masala'], 'snacks'),
                ('Bikano Aloo Lachha 150g', 'Bikano Aloo Lachha 150g Pack', 55, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Aloo%20Lachha%20.webp?updatedAt=1762610639601', ARRAY['Aloo Lachha'], 'snacks'),
                ('Bikano All Time Mixture 250g', 'Bikano All Time Mixture 250g Pack', 70, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/All%20Time%20Mixture%20.avif?updatedAt=1762610639526', ARRAY['All Time Mixture'], 'snacks'),
                ('Bikano Falahari Mixture 140g', 'Bikano Falahari Mixture 140g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Falahari%20Mixture%20.webp?updatedAt=1762610640514', ARRAY['Falahari Mixture'], 'snacks'),
                ('Bikano Lajawab Mixture 250g', 'Bikano Lajawab Mixture 250g Pack', 70, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Lajawab%20Mixture%20.jpeg?updatedAt=1762610639710', ARRAY['Lajawab Mixture'], 'snacks'),
                ('Bikano Wafers 120g', 'Bikano Wafers 120g Pack', 55, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Wafers%20.webp?updatedAt=1762610639542', ARRAY['Wafers'], 'snacks'),
                ('Balaji Sev Murmura 250g', 'Balaji Sev Murmura 250g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Sev%20Murmura.webp?updatedAt=1762610640574', ARRAY['Sev Murmura'], 'snacks'),
                ('Balaji Bhujia Sev 210g', 'Balaji Bhujia Sev 210g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Bhujia%20Sev.avif?updatedAt=1762610640746', ARRAY['Bhujia Sev'], 'snacks'),
                ('Balaji Navratan Mix 240g', 'Balaji Navratan Mix 240g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Navratan%20Mix.avif?updatedAt=1762610640530', ARRAY['Navratan Mix'], 'snacks'),
                ('Balaji Shing Bhujia 210g', 'Balaji Shing Bhujia 210g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Shing%20Bhujia%20.webp?updatedAt=1762610640542', ARRAY['Shing Bhujia'], 'snacks'),
                ('Balaji Khatta Meetha Mix 240g', 'Balaji Khatta Meetha Mix 240g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/%20Khatta%20Meetha%20Mix.webp?updatedAt=1762610640564', ARRAY['Khatta Meetha Mix'], 'snacks'),
                ('Balaji Tikha Mitha Mix 240g', 'Balaji Tikha Mitha Mix 240g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Tikha%20Mitha%20Mix%20.webp?updatedAt=1762610641181', ARRAY['Tikha Mitha Mix'], 'snacks'),
                ('Balaji Chana Jor Garam 240g', 'Balaji Chana Jor Garam 240g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Chana%20Jor%20Garam%20.webp?updatedAt=1762610640572', ARRAY['Chana Jor Garam'], 'snacks'),
                ('Bikaji Bikaneri Bhujia 200g', 'Bikaji Bikaneri Bhujia 200g Pack', 58, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Bikaji/Aloo%20Bhujia%20.webp?updatedAt=1762610641110', ARRAY['Bikaneri Bhujia'], 'snacks'),
                ('Bikaji Tana-tan Aloo Bhujia 200g', 'Bikaji Tana-tan Aloo Bhujia 200g Pack', 62, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Bikaji/Tana-tan%20Aloo%20Bhujia%20.png?updatedAt=1762610641001', ARRAY['Tana-tan Aloo Bhujia'], 'snacks'),
                ('Bikaji All In One Kuch-Kuch 200g', 'Bikaji All In One Kuch-Kuch 200g Pack', 58, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Bikaji/All%20In%20One%20Kuch-Kuch%20.webp?updatedAt=1762610641470', ARRAY['All In One Kuch-Kuch'], 'snacks'),
                ('Bikaji Falahari Mixture 200g', 'Bikaji Falahari Mixture 200g Pack', 80, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Bikaji/Falahari%20Mixture%20.webp?updatedAt=1762610641142', ARRAY['Falahari Mixture'], 'snacks'),
                ('Bikaji Chowpati Bhelpuri 110g', 'Bikaji Chowpati Bhelpuri 110g Pack', 49, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Bikano/Balaji/Bikaji/Chowpati%20Bhelpuri%20.webp?updatedAt=1762610640532', ARRAY['Chowpati Bhelpuri'], 'snacks'),
                ('Buldak 3x Spicy Hot Chicken Flavor Ramen 140g', 'Buldak 3x Spicy Hot Chicken Flavor Ramen 140g Pack', 140, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Buldak/3x%20Spicy%20Hot%20Chicken%20Flavor%20Ramen%20.jpeg?updatedAt=1762610959649', ARRAY['3x Spicy Hot Chicken Flavor Ramen'], 'instant'),
                ('Buldak Hot Chicken Flavor Ramen 140g', 'Buldak Hot Chicken Flavor Ramen 140g Pack', 140, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Buldak/Hot%20Chicken%20Flavor%20Ramen%20.webp?updatedAt=1762610959776', ARRAY['Hot Chicken Flavor Ramen'], 'instant'),
                ('Buldak Cheese Hot Chicken Flavor Ramen 140g', 'Buldak Cheese Hot Chicken Flavor Ramen 140g Pack', 150, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Buldak/Cheese%20Hot%20Chicken%20Flavor%20Ramen%20.webp?updatedAt=1762610959690', ARRAY['Cheese Hot Chicken Flavor Ramen'], 'instant'),
                ('Nongshim Shin Raymun Stir Fry Cheese 136g', 'Nongshim Shin Raymun Stir Fry Cheese 136g Pack', 169, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Buldak/Shin%20Raymun%20Stir%20Fry%20%20Cheese%20.webp?updatedAt=1762610959824', ARRAY['Shin Raymun Stir Fry  Cheese'], 'instant'),
                ('Nongshim Shin Raymun Noodles Soup Chicken Flavor 120g', 'Nongshim Shin Raymun Noodles Soup Chicken Flavor 120g Pack', 149, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Buldak/Shin%20Raymun%20Noodles%20Soup%20Chicken%20Flavor%20.jpg?updatedAt=1762610959692', ARRAY['Shin Raymun Noodles Soup Chicken Flavor'], 'instant'),
                ('Nongshim Shin Raymun Tom Yum Flavor 123g', 'Nongshim Shin Raymun Tom Yum Flavor 123g Pack', 159, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Buldak/Shin%20Raymun%20TomYum%20Flavor%20.webp?updatedAt=1762610959765', ARRAY['Shin Raymun TomYum Flavor'], 'instant'),
                ('MOM Biryani With Shahi Gravy 140g', 'MOM Biryani With Shahi Gravy 140g Pack', 130, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Biryani%20With%20Shahi%20Gravy.webp?updatedAt=1762609567130', ARRAY['Biryani With Shahi Gravy'], 'instant'),
                ('MOM Fried Rice With Schezwan Gravy 145g', 'MOM Fried Rice With Schezwan Gravy 145g Pack', 130, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Fried%20Rice%20With%20Schezwan%20Gravy.webp?updatedAt=1762609567077', ARRAY['Fried Rice With Schezwan Gravy'], 'instant'),
                ('MOM Creamy Tomato Pasta 74g', 'MOM Creamy Tomato Pasta 74g Pack', 85, 'INSTANTFOOD', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Creamy%20Tomato%20Pasta.webp?updatedAt=1762609567309', ARRAY['Creamy Tomato Pasta'], 'instant'),
                ('MOM Super Berry Mix 120g', 'MOM Super Berry Mix 120g Pack', 249, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Super%20Berry%20Mix.webp?updatedAt=1762609567167', ARRAY['Super Berry Mix'], 'snacks'),
                ('MOM Ragi Chips Peri Peri 70g', 'MOM Ragi Chips Peri Peri 70g Pack', 55, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Ragi%20Chips%20Peri%20Peri.avif?updatedAt=1762609566436', ARRAY['Ragi Chips Peri Peri'], 'snacks'),
                ('MOM Super Seed Mix 140g', 'MOM Super Seed Mix 140g Pack', 199, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Super%20Seed%20Mix%20.webp?updatedAt=1762609567119', ARRAY['Super Seed Mix'], 'snacks'),
                ('MOM Daily Sports Mix 140g', 'MOM Daily Sports Mix 140g Pack', 0, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Daily%20Sports%20Mix.webp?updatedAt=1762609567191', ARRAY['Daily Sports Mix'], 'snacks'),
                ('MOM Roasted Makhana Himalayan Salt & Pepper 60g', 'MOM Roasted Makhana Himalayan Salt & Pepper 60g Pack', 150, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Roasted%20Makhana%20Himalyan%20Salt%20&%20Pepper.webp?updatedAt=1762609566962', ARRAY['Roasted Makhana Himalyan Salt & Pepper'], 'snacks'),
                ('MOM Roasted Makhana Himalayan Pudina 40g', 'MOM Roasted Makhana Himalayan Pudina 40g Pack', 99, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Roasted%20Makhana%20Himalyan%20Pudina.webp?updatedAt=1762609567023', ARRAY['Roasted Makhana Himalyan Pudina'], 'snacks'),
                ('MOM Daily Health Mix 140g', 'MOM Daily Health Mix 140g Pack', 199, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/MOM/Daily%20Health%20Mix.webp?updatedAt=1762609567127', ARRAY['Daily Health Mix'], 'snacks'),
                ('Kellogs Muesli 0% Added Sugar 400g', 'Kellogs Muesli 0% Added Sugar 400g Pack', 390, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Muesli%200_%20Added%20Sugar%20.jpg?updatedAt=1762609566982', ARRAY['Muesli 0% Added Sugar'], 'snacks'),
                ('Max Protein Granola Fruits & Nuts 500g', 'Max Protein Granola Fruits & Nuts 500g Pack', 399, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Granola%20Fruits%20&%20Nuts.webp?updatedAt=1762609567327', ARRAY['Granola Fruits & Nuts'], 'snacks'),
                ('Max Protein Oats & Raisins Cookie 55g', 'Max Protein Oats & Raisins Cookie 55g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Oats%20&%20Raisins%20Cookie.avif?updatedAt=1762609567112', ARRAY['Oats & Raisins Cookie'], 'snacks'),
                ('Max Protein Choco Almond Cookie 60g', 'Max Protein Choco Almond Cookie 60g Pack', 60, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Choco%20Almond%20Cookie.webp?updatedAt=1762609567025', ARRAY['Choco Almond Cookie'], 'snacks'),
                ('Max Protein Trail Mix Cookie 55g', 'Max Protein Trail Mix Cookie 55g Pack', 50, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Trail%20Mix%20Cookie.jpeg?updatedAt=1762609566197', ARRAY['Trail Mix Cookie'], 'snacks'),
                ('Max Protein Date & Almond Bar 75g', 'Max Protein Date & Almond Bar 75g Pack', 140, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Date%20&%20Almond%20Bar.avif?updatedAt=1762609566535', ARRAY['Date & Almond Bar'], 'snacks'),
                ('Max Protein Peanut Butter Bar 70g', 'Max Protein Peanut Butter Bar 70g Pack', 140, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Peanut%20Butter%20Bar.webp?updatedAt=1762609566914', ARRAY['Peanut Butter Bar'], 'snacks'),
                ('Max Protein Choco Berry Bar 50g', 'Max Protein Choco Berry Bar 50g Pack', 80, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Choco%20Berry%20Bar.webp?updatedAt=1762609566873', ARRAY['Choco Berry Bar'], 'snacks'),
                ('Max Protein Choco Almond Bar 50g', 'Max Protein Choco Almond Bar 50g Pack', 80, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Choco%20Almond%20Bar.webp?updatedAt=1762609566926', ARRAY['Choco Almond Bar'], 'snacks'),
                ('Max Protein Fruit & Nut Bar 50g', 'Max Protein Fruit & Nut Bar 50g Pack', 80, 'CHIPS', 'https://ik.imagekit.io/foodclub/Grocery/Products/More/Fruit%20&%20Nut%20Bar.webp?updatedAt=1762609566960', ARRAY['Fruit & Nut Bar'], 'snacks')
        ) AS items(name, description, price, category, image_url, legacy_names, display_section)
    LOOP
        UPDATE public.menu_items
        SET description = item_record.description,
            price = item_record.price,
            category = item_record.category,
            image_url = NULLIF(item_record.image_url, ''),
            is_available = true,
            out_of_stock = false,
            updated_at = NOW()
        WHERE cafe_id = grabit_cafe_id
          AND (
                LOWER(name) = LOWER(item_record.name)
             OR EXISTS (
                    SELECT 1
                    FROM unnest(item_record.legacy_names) AS legacy_name
                    WHERE LOWER(menu_items.name) = LOWER(legacy_name)
                )
          );

        GET DIAGNOSTICS updated_rows = ROW_COUNT;

        IF updated_rows = 0 THEN
            INSERT INTO public.menu_items (
                id,
                name,
                description,
                price,
                category,
                is_available,
                out_of_stock,
                preparation_time,
                cafe_id,
                image_url
            )
            VALUES (
                gen_random_uuid(),
                item_record.name,
                item_record.description,
                item_record.price,
                item_record.category,
                true,
                false,
                0,
                grabit_cafe_id,
                NULLIF(item_record.image_url, '')
            );
        END IF;
    END LOOP;
END $$;



