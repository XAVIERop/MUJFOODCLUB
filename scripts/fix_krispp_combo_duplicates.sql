-- Fix duplicate KRISPP combo items in Food Court
-- Remove duplicates, keeping only the first entry for each combo

WITH duplicate_combos AS (
  SELECT 
    name,
    (ARRAY_AGG(id ORDER BY created_at ASC))[1] as keep_id,
    ARRAY_AGG(id ORDER BY created_at ASC) as all_ids
  FROM public.menu_items 
  WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT')
  AND (name ILIKE '%combo%' OR name ILIKE '%upgrade%')
  GROUP BY name
  HAVING COUNT(*) > 1
),
ids_to_delete AS (
  SELECT unnest(all_ids[2:]) as delete_id
  FROM duplicate_combos
)
DELETE FROM public.menu_items 
WHERE id IN (SELECT delete_id FROM ids_to_delete);

-- Verify the fix
SELECT 
  name,
  COUNT(*) as remaining_count,
  STRING_AGG(id::text, ', ') as remaining_ids
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'FOOD COURT')
AND (name ILIKE '%combo%' OR name ILIKE '%upgrade%')
GROUP BY name
ORDER BY name;
