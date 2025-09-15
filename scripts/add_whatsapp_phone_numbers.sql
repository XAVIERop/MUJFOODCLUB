-- =====================================================
-- Add WhatsApp Phone Numbers for All Cafes
-- =====================================================

-- Update cafes with their WhatsApp phone numbers
-- Replace the phone numbers with actual cafe owner numbers

-- 1. ZERO DEGREE CAFE
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'ZERO DEGREE CAFE';

-- 2. Dialog
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Dialog';

-- 3. Waffle Fit N Fresh
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Waffle Fit N Fresh';

-- 4. The Crazy Chef
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'The Crazy Chef';

-- 5. Taste of India
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Taste of India';

-- 6. ZAIKA
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'ZAIKA';

-- 7. China Town
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'China Town';

-- 8. STARDOM Café & Lounge
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'STARDOM Café & Lounge';

-- 9. Dev Sweets & Snacks
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Dev Sweets & Snacks';

-- 10. Mini Meals
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Mini Meals';

-- 11. Tea Tradition
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Tea Tradition';

-- 12. Let's Go Live
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Let\'s Go Live';

-- 13. Munch Box
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Munch Box';

-- 14. ITALIAN OVEN
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'ITALIAN OVEN';

-- 15. Soya Chaap Corner
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Soya Chaap Corner';

-- 16. Punjabi Tadka
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Punjabi Tadka';

-- 17. The Kitchen & Curry
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'The Kitchen & Curry';

-- 18. Havmor
UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX'  -- Replace with actual number
WHERE name = 'Havmor';

-- Verify the updates
SELECT 
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications
FROM public.cafes 
WHERE is_active = true
ORDER BY name;
