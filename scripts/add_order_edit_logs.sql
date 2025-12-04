-- Add Order Edit Logs System
-- This allows tracking of all order edits made by cafe staff

-- Step 1: Create order_edit_logs table
CREATE TABLE IF NOT EXISTS public.order_edit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  edited_by UUID NOT NULL REFERENCES public.cafe_staff(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- What changed
  action TEXT NOT NULL, -- 'item_added', 'item_removed', 'quantity_changed', 'item_updated'
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  menu_item_name TEXT, -- Store name for historical reference
  old_quantity INTEGER,
  new_quantity INTEGER,
  old_unit_price DECIMAL(8,2),
  new_unit_price DECIMAL(8,2),
  old_total_price DECIMAL(8,2),
  new_total_price DECIMAL(8,2),
  
  -- Order totals before and after
  old_order_total DECIMAL(10,2) NOT NULL,
  new_order_total DECIMAL(10,2) NOT NULL,
  
  -- Additional notes
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_order_edit_logs_order_id ON public.order_edit_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_edit_logs_edited_at ON public.order_edit_logs(edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_edit_logs_edited_by ON public.order_edit_logs(edited_by);

-- Step 3: Add comment for documentation
COMMENT ON TABLE public.order_edit_logs IS 'Tracks all edits made to orders by cafe staff';
COMMENT ON COLUMN public.order_edit_logs.action IS 'Type of edit: item_added, item_removed, quantity_changed, item_updated';
COMMENT ON COLUMN public.order_edit_logs.old_order_total IS 'Order total before this edit';
COMMENT ON COLUMN public.order_edit_logs.new_order_total IS 'Order total after this edit';

-- Step 4: Enable RLS
ALTER TABLE public.order_edit_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
-- Cafe staff can view edit logs for orders in their cafe
CREATE POLICY "cafe_staff_view_edit_logs" ON public.order_edit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.cafe_staff cs ON cs.cafe_id = o.cafe_id
      WHERE o.id = order_edit_logs.order_id
      AND cs.user_id = auth.uid()
      AND cs.is_active = true
    )
  );

-- Cafe staff can insert edit logs for orders in their cafe
CREATE POLICY "cafe_staff_insert_edit_logs" ON public.order_edit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.cafe_staff cs ON cs.cafe_id = o.cafe_id
      WHERE o.id = order_edit_logs.order_id
      AND cs.user_id = auth.uid()
      AND cs.is_active = true
    )
  );

-- Step 6: Grant permissions
GRANT SELECT, INSERT ON public.order_edit_logs TO authenticated;

-- Step 7: Create a function to get edit history for an order
CREATE OR REPLACE FUNCTION get_order_edit_history(p_order_id UUID)
RETURNS TABLE (
  id UUID,
  edited_at TIMESTAMPTZ,
  action TEXT,
  menu_item_name TEXT,
  old_quantity INTEGER,
  new_quantity INTEGER,
  old_total_price DECIMAL(8,2),
  new_total_price DECIMAL(8,2),
  old_order_total DECIMAL(10,2),
  new_order_total DECIMAL(10,2),
  edited_by_name TEXT,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    el.id,
    el.edited_at,
    el.action,
    el.menu_item_name,
    el.old_quantity,
    el.new_quantity,
    el.old_total_price,
    el.new_total_price,
    el.old_order_total,
    el.new_order_total,
    COALESCE(cs.staff_name, p.full_name, 'Unknown Staff') as edited_by_name,
    el.notes
  FROM public.order_edit_logs el
  LEFT JOIN public.cafe_staff cs ON cs.id = el.edited_by
  LEFT JOIN public.profiles p ON p.id = cs.user_id
  WHERE el.order_id = p_order_id
  ORDER BY el.edited_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_order_edit_history(UUID) TO authenticated;

-- Success message
SELECT 'Order edit logs system created successfully!' as status;

