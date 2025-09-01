-- Check if Mini Meals cafe owner account exists
SELECT 
    id,
    email,
    full_name,
    user_type,
    cafe_id,
    created_at
FROM profiles 
WHERE email LIKE '%mini%meals%' 
   OR email LIKE '%minimeals%'
   OR full_name LIKE '%Mini Meals%'
ORDER BY created_at DESC;

-- Also check cafes table for Mini Meals
SELECT 
    id,
    name,
    type,
    description,
    accepting_orders
FROM cafes 
WHERE name LIKE '%Mini Meals%' 
   OR name LIKE '%mini%meals%'
ORDER BY name;
