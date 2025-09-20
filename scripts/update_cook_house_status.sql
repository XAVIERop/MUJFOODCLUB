-- Update Cook House cafe status to active and accepting orders
-- This script changes "Coming Soon" back to "Order Now"

BEGIN;

-- First, let's see the current status of Cook House
SELECT 
    id, 
    name, 
    is_active, 
    accepting_orders,
    CASE 
        WHEN is_active = false THEN 'Coming Soon'
        WHEN accepting_orders = false THEN 'Currently Closed'
        ELSE 'Order Now'
    END as status_display
FROM cafes 
WHERE name ILIKE '%cook%house%' OR name ILIKE '%house%';

-- Update Cook House to be active and accepting orders
UPDATE cafes 
SET 
    is_active = true,
    accepting_orders = true,
    updated_at = NOW()
WHERE name ILIKE '%cook%house%' OR name ILIKE '%house%';

-- Verify the update
SELECT 
    id, 
    name, 
    is_active, 
    accepting_orders,
    CASE 
        WHEN is_active = false THEN 'Coming Soon'
        WHEN accepting_orders = false THEN 'Currently Closed'
        ELSE 'Order Now'
    END as status_display
FROM cafes 
WHERE name ILIKE '%cook%house%' OR name ILIKE '%house%';

-- Show summary of all cafe statuses
SELECT 
    COUNT(*) as total_cafes,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_cafes,
    COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders_cafes
FROM cafes;

COMMIT;
