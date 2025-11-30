-- Open Dev Sweets & Snacks cafe
-- This script sets the cafe to accept orders and makes it active

DO $$
DECLARE
    dev_sweets_cafe_id UUID;
BEGIN
    -- Get Dev Sweets cafe ID
    SELECT id INTO dev_sweets_cafe_id 
    FROM public.cafes 
    WHERE name ILIKE '%dev sweets%' 
       OR name ILIKE '%dev%snacks%'
       OR slug ILIKE '%dev-sweets%'
       OR slug ILIKE '%dev%'
    LIMIT 1;
    
    IF dev_sweets_cafe_id IS NULL THEN
        RAISE EXCEPTION 'Dev Sweets cafe not found. Please verify the cafe exists.';
    END IF;
    
    RAISE NOTICE 'Found Dev Sweets cafe with ID: %', dev_sweets_cafe_id;
    
    -- Update cafe to open (accepting orders and active)
    UPDATE public.cafes
    SET 
        accepting_orders = true,
        is_active = true,
        updated_at = NOW()
    WHERE id = dev_sweets_cafe_id;
    
    RAISE NOTICE 'Dev Sweets cafe has been opened successfully!';
    
END $$;

-- Verify the cafe status
SELECT 
    id,
    name,
    slug,
    accepting_orders,
    is_active,
    priority,
    location_scope,
    updated_at,
    CASE 
        WHEN accepting_orders = true AND is_active = true THEN '✅ Cafe is OPEN'
        WHEN accepting_orders = false THEN '❌ Cafe is CLOSED (not accepting orders)'
        WHEN is_active = false THEN '❌ Cafe is INACTIVE'
        ELSE '⚠️ Unknown status'
    END as status
FROM public.cafes 
WHERE name ILIKE '%dev sweets%' 
   OR name ILIKE '%dev%snacks%'
   OR slug ILIKE '%dev-sweets%'
   OR slug ILIKE '%dev%'
ORDER BY name;

