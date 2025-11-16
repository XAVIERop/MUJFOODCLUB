-- Update Punjabi Tadka combo meals to provide Rice / Tandoori Roti selectors

DO $$
DECLARE
    punjabi_tadka_id UUID;
    combo RECORD;
    base_name TEXT;
    new_description TEXT;
    bread_options TEXT[] := ARRAY['Laccha Paratha', 'Butter Naan'];
    side_options TEXT[] := ARRAY['Pickle', 'Salad'];
    special_bread_options TEXT[] := ARRAY['Chur Chur Naan', 'Amritsari Kulcha'];
BEGIN
    SELECT id INTO punjabi_tadka_id
    FROM public.cafes
    WHERE LOWER(name) = 'punjabi tadka'
       OR LOWER(slug) = 'punjabi-tadka'
    LIMIT 1;

    IF punjabi_tadka_id IS NULL THEN
        RAISE EXCEPTION 'Punjabi Tadka cafe not found.';
    END IF;

    FOR combo IN
        SELECT id, name, price, category, description, image_url, is_available, out_of_stock, preparation_time, is_vegetarian
        FROM public.menu_items
        WHERE cafe_id = punjabi_tadka_id
          AND name IN (
            'Dal Makhani Combo',
            'Dal Tadka Combo',
            'Mix Veg Combo',
            'Paneer Butter Masala Combo'
          )
    LOOP
        base_name := combo.name;
        new_description := CASE base_name
            WHEN 'Dal Makhani Combo' THEN 'Dal Makhani + Rice/Tandoori Roti(2) + Pickle + Salad + Chaach'
            WHEN 'Dal Tadka Combo' THEN 'Dal Tadka + Rice/Tandoori Roti(2) + Pickle + Salad + Chaach'
            WHEN 'Mix Veg Combo' THEN 'Mix Veg + Rice/Tandoori Roti(2) + Pickle + Salad + Chaach'
            WHEN 'Paneer Butter Masala Combo' THEN 'Paneer Butter Masala + Rice/Tandoori Roti(2) + Pickle + Salad + Chaach'
            ELSE COALESCE(combo.description, '')
        END;

        -- Rename existing record to Rice variant
        UPDATE public.menu_items
        SET name = base_name || ' (Rice)',
            description = new_description,
            updated_at = NOW()
        WHERE id = combo.id;

        -- Upsert Tandoori Roti variant
        IF EXISTS (
            SELECT 1 FROM public.menu_items
            WHERE cafe_id = punjabi_tadka_id
              AND name = base_name || ' (Tandoori Roti)'
        ) THEN
            UPDATE public.menu_items
            SET description = new_description,
                price = combo.price,
                category = combo.category,
                image_url = combo.image_url,
                is_available = combo.is_available,
                out_of_stock = combo.out_of_stock,
                preparation_time = combo.preparation_time,
                is_vegetarian = combo.is_vegetarian,
                updated_at = NOW()
            WHERE cafe_id = punjabi_tadka_id
              AND name = base_name || ' (Tandoori Roti)';
        ELSE
            INSERT INTO public.menu_items (
                id,
                cafe_id,
                name,
                description,
                price,
                category,
                image_url,
                is_available,
                out_of_stock,
                preparation_time,
                is_vegetarian
            )
            VALUES (
                gen_random_uuid(),
                punjabi_tadka_id,
                base_name || ' (Tandoori Roti)',
                new_description,
                combo.price,
                combo.category,
                combo.image_url,
                combo.is_available,
                combo.out_of_stock,
                combo.preparation_time,
                combo.is_vegetarian
            );
        END IF;
    END LOOP;

    FOR combo IN
        SELECT id, name, price, category, description, image_url, is_available, out_of_stock, preparation_time, is_vegetarian
        FROM public.menu_items
        WHERE cafe_id = punjabi_tadka_id
          AND name IN (
            'Dal Makhani Premium Combo',
            'Mix Veg Premium Combo',
            'Paneer Butter Masala Premium Combo'
          )
    LOOP
        base_name := combo.name;
        new_description := CASE base_name
            WHEN 'Dal Makhani Premium Combo' THEN 'Dal Makhani + Laccha Paratha(2)/Butter Naan(2) + Pickle/Salad + Chaach'
            WHEN 'Mix Veg Premium Combo' THEN 'Mix Veg + Laccha Paratha(2)/Butter Naan(2) + Pickle/Salad + Chaach'
            WHEN 'Paneer Butter Masala Premium Combo' THEN 'Paneer Butter Masala + Laccha Paratha(2)/Butter Naan(2) + Pickle/Salad + Chaach'
            ELSE COALESCE(combo.description, '')
        END;

        -- Use the first combination (Laccha Paratha + Pickle) for the existing record
        UPDATE public.menu_items
        SET name = base_name || ' (' || bread_options[1] || ' + ' || side_options[1] || ')',
            description = new_description,
            updated_at = NOW()
        WHERE id = combo.id;

        FOR i IN 1..array_length(bread_options, 1) LOOP
            FOR j IN 1..array_length(side_options, 1) LOOP
                IF i = 1 AND j = 1 THEN
                    -- existing record already updated
                    CONTINUE;
                END IF;

                PERFORM 1;

                IF EXISTS (
                    SELECT 1 FROM public.menu_items
                    WHERE cafe_id = punjabi_tadka_id
                      AND name = base_name || ' (' || bread_options[i] || ' + ' || side_options[j] || ')'
                ) THEN
                    UPDATE public.menu_items
                    SET description = new_description,
                        price = combo.price,
                        category = combo.category,
                        image_url = combo.image_url,
                        is_available = combo.is_available,
                        out_of_stock = combo.out_of_stock,
                        preparation_time = combo.preparation_time,
                        is_vegetarian = combo.is_vegetarian,
                        updated_at = NOW()
                    WHERE cafe_id = punjabi_tadka_id
                      AND name = base_name || ' (' || bread_options[i] || ' + ' || side_options[j] || ')';
                ELSE
                    INSERT INTO public.menu_items (
                        id,
                        cafe_id,
                        name,
                        description,
                        price,
                        category,
                        image_url,
                        is_available,
                        out_of_stock,
                        preparation_time,
                        is_vegetarian
                    )
                    VALUES (
                        gen_random_uuid(),
                        punjabi_tadka_id,
                        base_name || ' (' || bread_options[i] || ' + ' || side_options[j] || ')',
                        new_description,
                        combo.price,
                        combo.category,
                        combo.image_url,
                        combo.is_available,
                        combo.out_of_stock,
                        combo.preparation_time,
                        combo.is_vegetarian
                    );
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    FOR combo IN
        SELECT id, name, price, category, description, image_url, is_available, out_of_stock, preparation_time, is_vegetarian
        FROM public.menu_items
        WHERE cafe_id = punjabi_tadka_id
          AND name = 'Pindi Chole Combo'
    LOOP
        base_name := combo.name;
        new_description := 'Pindi Chole + Chur Chur Naan/Amritsari Kulcha + Pickle/Salad + Chaach';

        UPDATE public.menu_items
        SET name = base_name || ' (' || special_bread_options[1] || ' + ' || side_options[1] || ')',
            description = new_description,
            updated_at = NOW()
        WHERE id = combo.id;

        FOR i IN 1..array_length(special_bread_options, 1) LOOP
            FOR j IN 1..array_length(side_options, 1) LOOP
                IF i = 1 AND j = 1 THEN
                    CONTINUE;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM public.menu_items
                    WHERE cafe_id = punjabi_tadka_id
                      AND name = base_name || ' (' || special_bread_options[i] || ' + ' || side_options[j] || ')'
                ) THEN
                    UPDATE public.menu_items
                    SET description = new_description,
                        price = combo.price,
                        category = combo.category,
                        image_url = combo.image_url,
                        is_available = combo.is_available,
                        out_of_stock = combo.out_of_stock,
                        preparation_time = combo.preparation_time,
                        is_vegetarian = combo.is_vegetarian,
                        updated_at = NOW()
                    WHERE cafe_id = punjabi_tadka_id
                      AND name = base_name || ' (' || special_bread_options[i] || ' + ' || side_options[j] || ')';
                ELSE
                    INSERT INTO public.menu_items (
                        id,
                        cafe_id,
                        name,
                        description,
                        price,
                        category,
                        image_url,
                        is_available,
                        out_of_stock,
                        preparation_time,
                        is_vegetarian
                    )
                    VALUES (
                        gen_random_uuid(),
                        punjabi_tadka_id,
                        base_name || ' (' || special_bread_options[i] || ' + ' || side_options[j] || ')',
                        new_description,
                        combo.price,
                        combo.category,
                        combo.image_url,
                        combo.is_available,
                        combo.out_of_stock,
                        combo.preparation_time,
                        combo.is_vegetarian
                    );
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    FOR combo IN
        SELECT id, name, price, category, description, image_url, is_available, out_of_stock, preparation_time, is_vegetarian
        FROM public.menu_items
        WHERE cafe_id = punjabi_tadka_id
          AND name IN (
            'Dal Tadka Special Combo',
            'Dal Makhani Special Combo'
          )
    LOOP
        base_name := combo.name;
        new_description := CASE base_name
            WHEN 'Dal Tadka Special Combo' THEN 'Dal Tadka + Mix Veg + Laccha Paratha(2)/Butter Naan(2) + Salad/Pickle + Chaach'
            WHEN 'Dal Makhani Special Combo' THEN 'Dal Makhani + Paneer Butter Masala + Laccha Paratha(2)/Butter Naan(2) + Salad/Pickle + Chaach'
            ELSE COALESCE(combo.description, '')
        END;

        UPDATE public.menu_items
        SET name = base_name || ' (' || bread_options[1] || ' + ' || side_options[1] || ')',
            description = new_description,
            updated_at = NOW()
        WHERE id = combo.id;

        FOR i IN 1..array_length(bread_options, 1) LOOP
            FOR j IN 1..array_length(side_options, 1) LOOP
                IF i = 1 AND j = 1 THEN
                    CONTINUE;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM public.menu_items
                    WHERE cafe_id = punjabi_tadka_id
                      AND name = base_name || ' (' || bread_options[i] || ' + ' || side_options[j] || ')'
                ) THEN
                    UPDATE public.menu_items
                    SET description = new_description,
                        price = combo.price,
                        category = combo.category,
                        image_url = combo.image_url,
                        is_available = combo.is_available,
                        out_of_stock = combo.out_of_stock,
                        preparation_time = combo.preparation_time,
                        is_vegetarian = combo.is_vegetarian,
                        updated_at = NOW()
                    WHERE cafe_id = punjabi_tadka_id
                      AND name = base_name || ' (' || bread_options[i] || ' + ' || side_options[j] || ')';
                ELSE
                    INSERT INTO public.menu_items (
                        id,
                        cafe_id,
                        name,
                        description,
                        price,
                        category,
                        image_url,
                        is_available,
                        out_of_stock,
                        preparation_time,
                        is_vegetarian
                    )
                    VALUES (
                        gen_random_uuid(),
                        punjabi_tadka_id,
                        base_name || ' (' || bread_options[i] || ' + ' || side_options[j] || ')',
                        new_description,
                        combo.price,
                        combo.category,
                        combo.image_url,
                        combo.is_available,
                        combo.out_of_stock,
                        combo.preparation_time,
                        combo.is_vegetarian
                    );
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Verification
SELECT name, description, price
FROM public.menu_items
WHERE cafe_id = (
    SELECT id FROM public.cafes WHERE LOWER(name) = 'punjabi tadka' OR LOWER(slug) = 'punjabi-tadka' LIMIT 1
)
  AND name IN (
    'Dal Makhani Combo (Rice)',
    'Dal Makhani Combo (Tandoori Roti)',
    'Dal Tadka Combo (Rice)',
    'Dal Tadka Combo (Tandoori Roti)',
    'Mix Veg Combo (Rice)',
    'Mix Veg Combo (Tandoori Roti)',
    'Paneer Butter Masala Combo (Rice)',
    'Paneer Butter Masala Combo (Tandoori Roti)',
    'Dal Makhani Premium Combo (Laccha Paratha + Pickle)',
    'Dal Makhani Premium Combo (Laccha Paratha + Salad)',
    'Dal Makhani Premium Combo (Butter Naan + Pickle)',
    'Dal Makhani Premium Combo (Butter Naan + Salad)',
    'Mix Veg Premium Combo (Laccha Paratha + Pickle)',
    'Mix Veg Premium Combo (Laccha Paratha + Salad)',
    'Mix Veg Premium Combo (Butter Naan + Pickle)',
    'Mix Veg Premium Combo (Butter Naan + Salad)',
    'Paneer Butter Masala Premium Combo (Laccha Paratha + Pickle)',
    'Paneer Butter Masala Premium Combo (Laccha Paratha + Salad)',
    'Paneer Butter Masala Premium Combo (Butter Naan + Pickle)',
    'Paneer Butter Masala Premium Combo (Butter Naan + Salad)',
    'Pindi Chole Combo (Chur Chur Naan + Pickle)',
    'Pindi Chole Combo (Chur Chur Naan + Salad)',
    'Pindi Chole Combo (Amritsari Kulcha + Pickle)',
    'Pindi Chole Combo (Amritsari Kulcha + Salad)',
    'Dal Tadka Special Combo (Laccha Paratha + Pickle)',
    'Dal Tadka Special Combo (Laccha Paratha + Salad)',
    'Dal Tadka Special Combo (Butter Naan + Pickle)',
    'Dal Tadka Special Combo (Butter Naan + Salad)',
    'Dal Makhani Special Combo (Laccha Paratha + Pickle)',
    'Dal Makhani Special Combo (Laccha Paratha + Salad)',
    'Dal Makhani Special Combo (Butter Naan + Pickle)',
    'Dal Makhani Special Combo (Butter Naan + Salad)'
)
ORDER BY name;

