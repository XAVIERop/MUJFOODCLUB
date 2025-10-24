-- Check all cafe names to see why they're all showing Punjabi Tadka PrintNode account
SELECT 
    id,
    name,
    LOWER(name) as name_lowercase,
    accepting_orders,
    created_at
FROM public.cafes 
ORDER BY name;