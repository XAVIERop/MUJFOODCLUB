-- =====================================================
-- Daily Stock Management System
-- =====================================================
-- This migration adds daily stock tracking for menu items
-- Features:
-- - Daily stock quantity limits per item
-- - Auto-deduction when orders go to 'preparing' status
-- - Auto reset at cafe-specific time (default 11:00 AM)
-- - Allow overselling up to -10 with warnings
-- - Opt-in system for cafes

-- =====================================================
-- 1. ADD COLUMNS TO MENU_ITEMS TABLE
-- =====================================================

ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS daily_stock_quantity INTEGER,
ADD COLUMN IF NOT EXISTS current_stock_quantity INTEGER,
ADD COLUMN IF NOT EXISTS last_stock_reset TIMESTAMPTZ;

-- Add comments for clarity
COMMENT ON COLUMN public.menu_items.daily_stock_quantity IS 'Daily stock limit for this item (null = unlimited)';
COMMENT ON COLUMN public.menu_items.current_stock_quantity IS 'Current remaining stock for today (null = not tracking)';
COMMENT ON COLUMN public.menu_items.last_stock_reset IS 'Timestamp of last stock reset';

-- =====================================================
-- 2. ADD COLUMNS TO CAFES TABLE
-- =====================================================

ALTER TABLE public.cafes
ADD COLUMN IF NOT EXISTS enable_daily_stock BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_reset_time TIME DEFAULT '11:00:00';

-- Add comments for clarity
COMMENT ON COLUMN public.cafes.enable_daily_stock IS 'Whether cafe has opted into daily stock management';
COMMENT ON COLUMN public.cafes.stock_reset_time IS 'Time of day to reset stock (default 11:00 AM)';

-- =====================================================
-- 3. CREATE FUNCTION TO DEDUCT STOCK WHEN ORDER IS PREPARING
-- =====================================================

CREATE OR REPLACE FUNCTION handle_stock_deduction_on_preparing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cafe_id UUID;
  v_enable_stock BOOLEAN;
  v_item RECORD;
  v_order_quantity INTEGER;
  v_new_stock INTEGER;
BEGIN
  -- Only process when status changes to 'preparing'
  IF NEW.status = 'preparing' AND (OLD.status IS NULL OR OLD.status != 'preparing') THEN
    -- Get cafe ID
    SELECT cafe_id INTO v_cafe_id FROM public.orders WHERE id = NEW.id;
    
    -- Check if cafe has daily stock enabled
    SELECT enable_daily_stock INTO v_enable_stock 
    FROM public.cafes 
    WHERE id = v_cafe_id;
    
    -- Only process if cafe has enabled daily stock
    IF v_enable_stock THEN
      -- Loop through all order items
      FOR v_item IN 
        SELECT 
          oi.menu_item_id,
          oi.quantity,
          mi.daily_stock_quantity,
          mi.current_stock_quantity
        FROM public.order_items oi
        JOIN public.menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = NEW.id
          AND mi.daily_stock_quantity IS NOT NULL  -- Only items with stock tracking
      LOOP
        -- Deduct stock
        v_new_stock := COALESCE(v_item.current_stock_quantity, v_item.daily_stock_quantity) - v_item.quantity;
        
        -- Update menu item stock
        UPDATE public.menu_items
        SET 
          current_stock_quantity = v_new_stock,
          out_of_stock = CASE 
            WHEN v_new_stock <= 0 THEN true 
            ELSE false 
          END,
          updated_at = NOW()
        WHERE id = v_item.menu_item_id;
        
        -- If stock goes below -10, log a warning (we still allow it)
        IF v_new_stock < -10 THEN
          RAISE WARNING 'Stock for menu_item % is now % (below -10 limit)', 
            v_item.menu_item_id, v_new_stock;
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- 4. CREATE TRIGGER FOR STOCK DEDUCTION
-- =====================================================

DROP TRIGGER IF EXISTS trigger_stock_deduction_on_preparing ON public.orders;

CREATE TRIGGER trigger_stock_deduction_on_preparing
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'preparing' AND (OLD.status IS NULL OR OLD.status != 'preparing'))
  EXECUTE FUNCTION handle_stock_deduction_on_preparing();

-- =====================================================
-- 5. CREATE FUNCTION TO RESET STOCK DAILY
-- =====================================================

CREATE OR REPLACE FUNCTION reset_daily_stock()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cafe RECORD;
  v_reset_time TIME;
  v_now TIME;
BEGIN
  -- Get current time
  v_now := CURRENT_TIME;
  
  -- Loop through cafes with daily stock enabled
  FOR v_cafe IN 
    SELECT id, stock_reset_time 
    FROM public.cafes 
    WHERE enable_daily_stock = true
  LOOP
    v_reset_time := COALESCE(v_cafe.stock_reset_time, '11:00:00'::TIME);
    
    -- Check if it's time to reset (within 1 hour window after reset time)
    -- This allows the function to run periodically and catch the reset time
    IF EXTRACT(HOUR FROM (v_now - v_reset_time)) BETWEEN 0 AND 1 
       OR EXTRACT(HOUR FROM (v_reset_time - v_now)) BETWEEN 23 AND 24 THEN
      
      -- Reset stock for all items of this cafe
      UPDATE public.menu_items
      SET 
        current_stock_quantity = daily_stock_quantity,
        last_stock_reset = NOW(),
        out_of_stock = CASE 
          WHEN daily_stock_quantity IS NULL OR daily_stock_quantity <= 0 THEN out_of_stock
          ELSE false 
        END,
        updated_at = NOW()
      WHERE cafe_id = v_cafe.id
        AND daily_stock_quantity IS NOT NULL
        AND (
          -- Only reset if not reset in the last 23 hours (prevent duplicate resets)
          last_stock_reset IS NULL 
          OR last_stock_reset < NOW() - INTERVAL '23 hours'
        );
      
      RAISE NOTICE 'Reset stock for cafe %', v_cafe.id;
    END IF;
  END LOOP;
END;
$$;

-- =====================================================
-- 6. CREATE FUNCTION TO MANUALLY RESET STOCK FOR A CAFE
-- =====================================================

CREATE OR REPLACE FUNCTION manual_reset_stock(p_cafe_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset stock for all items of this cafe
  UPDATE public.menu_items
  SET 
    current_stock_quantity = daily_stock_quantity,
    last_stock_reset = NOW(),
    out_of_stock = CASE 
      WHEN daily_stock_quantity IS NULL OR daily_stock_quantity <= 0 THEN out_of_stock
      ELSE false 
    END,
    updated_at = NOW()
  WHERE cafe_id = p_cafe_id
    AND daily_stock_quantity IS NOT NULL;
  
  RAISE NOTICE 'Manually reset stock for cafe %', p_cafe_id;
END;
$$;

-- =====================================================
-- 7. CREATE FUNCTION TO HANDLE STOCK RESTORATION ON ORDER CANCELLATION
-- =====================================================

CREATE OR REPLACE FUNCTION handle_stock_restore_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cafe_id UUID;
  v_enable_stock BOOLEAN;
  v_item RECORD;
  v_new_stock INTEGER;
BEGIN
  -- Only process when status changes to 'cancelled' from 'preparing' or later
  IF NEW.status = 'cancelled' AND OLD.status IN ('preparing', 'on_the_way', 'completed') THEN
    -- Get cafe ID
    SELECT cafe_id INTO v_cafe_id FROM public.orders WHERE id = NEW.id;
    
    -- Check if cafe has daily stock enabled
    SELECT enable_daily_stock INTO v_enable_stock 
    FROM public.cafes 
    WHERE id = v_cafe_id;
    
    -- Only process if cafe has enabled daily stock
    IF v_enable_stock THEN
      -- Loop through all order items and restore stock
      FOR v_item IN 
        SELECT 
          oi.menu_item_id,
          oi.quantity,
          mi.current_stock_quantity
        FROM public.order_items oi
        JOIN public.menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = NEW.id
          AND mi.daily_stock_quantity IS NOT NULL  -- Only items with stock tracking
      LOOP
        -- Restore stock
        v_new_stock := COALESCE(v_item.current_stock_quantity, 0) + v_item.quantity;
        
        -- Update menu item stock
        UPDATE public.menu_items
        SET 
          current_stock_quantity = v_new_stock,
          out_of_stock = CASE 
            WHEN v_new_stock <= 0 THEN true 
            ELSE false 
          END,
          updated_at = NOW()
        WHERE id = v_item.menu_item_id;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- 8. CREATE TRIGGER FOR STOCK RESTORATION ON CANCELLATION
-- =====================================================

DROP TRIGGER IF EXISTS trigger_stock_restore_on_cancel ON public.orders;

CREATE TRIGGER trigger_stock_restore_on_cancel
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IN ('preparing', 'on_the_way', 'completed'))
  EXECUTE FUNCTION handle_stock_restore_on_cancel();

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION reset_daily_stock() TO authenticated;
GRANT EXECUTE ON FUNCTION manual_reset_stock(UUID) TO authenticated;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Daily stock reset should be scheduled via Supabase Cron or pg_cron extension
--    Example cron job: Run reset_daily_stock() every hour
-- 2. Cafes must opt-in by setting enable_daily_stock = true
-- 3. Stock is deducted when order status becomes 'preparing'
-- 4. Stock is restored if order is cancelled after being in 'preparing' status
-- 5. Items automatically become out_of_stock when current_stock_quantity <= 0
-- 6. Overselling is allowed up to -10, but warnings are logged
-- 7. Manual reset can be triggered via manual_reset_stock(cafe_id) function

