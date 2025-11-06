-- Enable ordering for Grabit cafe
-- Run this script directly in your Supabase SQL Editor

-- First, check current status
SELECT 
  '=== CURRENT STATUS ===' as section;

SELECT 
  id,
  name,
  slug,
  priority,
  accepting_orders as current_status,
  is_active,
  location,
  hours,
  CASE 
    WHEN accepting_orders = true AND is_active = true THEN '✅ Currently accepting orders'
    WHEN accepting_orders = false THEN '❌ Not accepting orders'
    WHEN is_active = false THEN '⚠️ Cafe is inactive'
    ELSE '❓ Unknown status'
  END as status
FROM public.cafes
WHERE slug = 'grabit' 
   OR name ILIKE '%grabit%'
ORDER BY created_at DESC
LIMIT 1;

-- Enable ordering for Grabit
SELECT 
  '=== ENABLING ORDERS ===' as section;

UPDATE public.cafes
SET 
    accepting_orders = true,
    is_active = true,
    updated_at = NOW()
WHERE slug = 'grabit' 
   OR name ILIKE '%grabit%';

-- Verify the update
SELECT 
  '=== VERIFICATION ===' as section;

SELECT 
  id,
  name,
  slug,
  priority,
  accepting_orders as status,
  is_active,
  CASE 
    WHEN accepting_orders = true AND is_active = true THEN '✅ Orders enabled'
    ELSE '❌ Orders disabled'
  END as status_label,
  location,
  hours
FROM public.cafes
WHERE slug = 'grabit' 
   OR name ILIKE '%grabit%'
ORDER BY created_at DESC
LIMIT 1;

