-- Update the create_table_order function to use the proper order number format
CREATE OR REPLACE FUNCTION create_table_order(
  p_cafe_id UUID,
  p_table_number TEXT,
  p_customer_name TEXT,
  p_phone_number TEXT,
  p_delivery_notes TEXT,
  p_total_amount NUMERIC,
  p_order_items JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with function owner's privileges
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
BEGIN
  -- Generate proper order number using existing function (e.g., BAN000013)
  v_order_number := generate_daily_order_number(p_cafe_id);
  
  -- Insert order
  INSERT INTO orders (
    user_id,
    cafe_id,
    order_number,
    order_type,
    table_number,
    customer_name,
    phone_number,
    delivery_notes,
    total_amount,
    status,
    payment_method,
    delivery_block,
    estimated_delivery
  ) VALUES (
    NULL, -- guest order
    p_cafe_id,
    v_order_number,
    'table_order',
    p_table_number,
    p_customer_name,
    p_phone_number,
    p_delivery_notes,
    p_total_amount,
    'received',
    'cash',
    'DINE_IN',
    NOW() + INTERVAL '30 minutes'
  )
  RETURNING id INTO v_order_id;
  
  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      menu_item_id,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'total_price')::NUMERIC
    );
  END LOOP;
  
  RETURN json_build_object(
    'id', v_order_id,
    'order_number', v_order_number
  );
END;
$$;

-- Verify the function was updated
SELECT 'Table order RPC function updated to use proper order number format!' as status;

