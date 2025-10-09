-- Delete specific items from Punjabi Tadka menu
DELETE FROM public.menu_items
WHERE id IN (
    '8f048a43-844d-4fb5-8629-98530354677c', -- Hara Bhara Kabab (Full)
    '3d40a098-8919-46ed-8217-ece2a09ee978', -- Hara Bhara Kabab (Half)
    '9672a409-1897-4680-a5ca-036d9ba4fc23', -- Paneer Malai Tikka (Full)
    '30e9e462-4970-4710-af37-0e37e00b1920', -- Paneer Malai Tikka (Half)
    '0e88a8f6-297f-4532-a7bb-ca2e6fb6f39b', -- Paneer Tikka (Full)
    'd4060839-9271-4309-87d6-9db8262151a8'  -- Paneer Tikka (Half)
);

-- Verify the deletion
SELECT 
    mi.id,
    mi.name,
    mi.category,
    mi.is_available,
    c.name as cafe_name
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE 
    c.name ILIKE '%punjabi tadka%'
    AND (
        mi.name ILIKE '%hara bhara kabab%'
        OR mi.name ILIKE '%paneer malai tikka%'
        OR mi.name ILIKE '%paneer tikka%'
    )
ORDER BY mi.name;
