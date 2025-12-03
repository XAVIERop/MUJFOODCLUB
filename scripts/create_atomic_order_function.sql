-- Create Universal Atomic Order Creation Function
-- This function creates an order and its items in a single transaction
-- Prevents race conditions where POS dashboard queries before items are inserted

CREATE OR REPLACE FUNCTION create_order_with_items(
  -- Required parameters (no defaults)
  p_user_id UUID,
  p_cafe_id UUID,
  p_order_number TEXT,
  p_total_amount NUMERIC,
  p_delivery_block TEXT,
  p_order_items JSONB,
  
  -- Optional parameters (all have defaults, must come after required ones)
  p_order_type TEXT DEFAULT 'delivery',
  p_table_number TEXT DEFAULT NULL,
  p_delivery_address TEXT DEFAULT NULL,
  p_delivery_latitude NUMERIC DEFAULT NULL,
  p_delivery_longitude NUMERIC DEFAULT NULL,
  p_delivery_notes TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'cod',
  p_points_earned INTEGER DEFAULT 0,
  p_referral_code_used TEXT DEFAULT NULL,
  p_discount_amount NUMERIC DEFAULT 0,
  p_team_member_credit NUMERIC DEFAULT 0,
  p_estimated_delivery TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with function owner's privileges
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_items_inserted INTEGER := 0;
BEGIN
  -- Validate inputs
  IF p_cafe_id IS NULL THEN
    RAISE EXCEPTION 'cafe_id is required';
  END IF;
  
  IF p_order_number IS NULL OR p_order_number = '' THEN
    RAISE EXCEPTION 'order_number is required';
  END IF;
  
  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'total_amount must be greater than 0';
  END IF;
  
  IF p_order_items IS NULL OR jsonb_array_length(p_order_items) = 0 THEN
    RAISE EXCEPTION 'order_items cannot be empty';
  END IF;
  
  -- Validate delivery_block is provided (required field)
  IF p_delivery_block IS NULL OR p_delivery_block = '' THEN
    RAISE EXCEPTION 'delivery_block is required';
  END IF;
  
  -- Set default estimated_delivery if not provided
  IF p_estimated_delivery IS NULL THEN
    p_estimated_delivery := NOW() + INTERVAL '30 minutes';
  END IF;
  
  -- Insert order in a transaction
  INSERT INTO orders (
    user_id,
    cafe_id,
    order_number,
    order_type,
    total_amount,
    delivery_block,
    table_number,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    delivery_notes,
    customer_name,
    phone_number,
    payment_method,
    points_earned,
    referral_code_used,
    discount_amount,
    team_member_credit,
    status,
    estimated_delivery,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_cafe_id,
    p_order_number,
    p_order_type,
    p_total_amount,
    p_delivery_block::block_type, -- Cast TEXT to block_type enum
    p_table_number,
    p_delivery_address,
    p_delivery_latitude,
    p_delivery_longitude,
    p_delivery_notes,
    p_customer_name,
    p_phone_number,
    p_payment_method,
    p_points_earned,
    p_referral_code_used,
    p_discount_amount,
    p_team_member_credit,
    'received',
    p_estimated_delivery,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_order_id;
  
  -- Validate order was created
  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'Failed to create order';
  END IF;
  
  -- Insert order items in the same transaction
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      menu_item_id,
      quantity,
      unit_price,
      total_price,
      special_instructions
    ) VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'total_price')::NUMERIC,
      NULLIF(v_item->>'special_instructions', '')
    );
    
    v_items_inserted := v_items_inserted + 1;
  END LOOP;
  
  -- Validate items were inserted
  IF v_items_inserted = 0 THEN
    -- Rollback order if no items were inserted
    DELETE FROM orders WHERE id = v_order_id;
    RAISE EXCEPTION 'No order items were inserted';
  END IF;
  
  -- Return order info
  RETURN json_build_object(
    'id', v_order_id,
    'order_number', p_order_number,
    'items_inserted', v_items_inserted,
    'success', true
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE EXCEPTION 'Error creating order: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_order_with_items TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_with_items TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION create_order_with_items IS 'Creates an order and its items atomically in a single transaction. Prevents race conditions where POS dashboard queries before items are inserted.';

-- Success message
SELECT 'Atomic order creation function created successfully!' as status;

