-- Delete all Chaap items from Punjabi Tadka menu
DELETE FROM public.menu_items
WHERE id IN (
    '473ba3a1-e4aa-466f-8eba-605d1312f650', -- Chaap Gravy (Full)
    '4d9bf8a2-9ea1-4861-bc83-75ebc3486db2', -- Chaap Gravy (Half)
    '8d062a61-63d1-4959-ab6e-e57b65a0cdfa', -- Handi Chaap (Full)
    'a6e171fd-9c51-400b-bb54-f67b988af480', -- Handi Chaap (Half)
    'a438ada6-4ea2-4397-b938-f90d3266f74c', -- Keema Chaap (Full)
    '71dcef33-3b4c-43ed-a4aa-18e2590cd13d', -- Keema Chaap (Half)
    '587f21e2-7bd0-48d7-9974-3d7e8205736a', -- Punjabi Tadka Chaap
    '21d8af17-6ab5-4094-9db4-17f96ee46b03', -- Special Chaap (Full)
    'd4c07a66-2e95-487e-b500-6993638d6383', -- Special Chaap (Half)
    '615ca2f1-6a32-44a3-a1ac-fe2c3bcdc6d8', -- Tawa Chaap (Full)
    'd60f26d2-ba29-4bd0-a499-2c30a0ead928', -- Tawa Chaap (Half)
    'b79bfc47-5078-4161-b9be-ff507f805ded', -- Aachari Chaap (Full)
    '2be43710-1f5c-403a-be18-8fcb5753b62c', -- Aachari Chaap (Half)
    '30d90499-4d14-4658-84d9-36cd2fa25129', -- Afghani Chaap (Full)
    '09c52f47-5160-4ecf-bc15-4f738a17f9c8', -- Afghani Chaap (Half)
    'db330f84-e473-4087-8ba0-08e0b4c6cb7e', -- Malai Chaap (Full)
    'fe6ecd52-4b28-46cf-8133-a7499974bcaf', -- Malai Chaap (Half)
    '2af0bf66-3b64-4456-9630-870eb71dd200', -- Pudina Chaap (Full)
    '34d3f38a-45ec-443e-b6f0-0b26bc707f11', -- Pudina Chaap (Half)
    '49e3d5f5-a320-47d3-b848-2aa0f462e918', -- Garlic Masala Chaap (Full)
    'f40d2d50-af8e-432f-bca7-f4bf73319fe5', -- Garlic Masala Chaap (Half)
    '73bd1b54-ed22-48ac-91c7-43249284bf16', -- Peri-Peri Soya Chaap (Full)
    '73857789-9daf-4fd1-8a62-3475d759d4f1', -- Peri-Peri Soya Chaap (Half)
    'c10c21f0-2a84-4894-aa72-7a03c7214ed3', -- Soya Chaap Lolly Pop (4P)
    'd7592063-b60b-4d1c-86db-86a05bc8f20f', -- Tandoori Chaap (Full)
    'ab054cda-c673-4076-a012-819c0fadbe26'  -- Tandoori Chaap (Half)
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
        mi.category ILIKE '%chaap%'
        OR mi.name ILIKE '%chaap%'
    )
ORDER BY mi.category, mi.name;
