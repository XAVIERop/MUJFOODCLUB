-- Add delivered_by_staff_id field to orders table
-- This field will track which staff member delivered each order

-- Add the new column
ALTER TABLE orders 
ADD COLUMN delivered_by_staff_id UUID REFERENCES cafe_staff(id);

-- Add comment for documentation
COMMENT ON COLUMN orders.delivered_by_staff_id IS 'ID of the staff member who delivered this order';

-- Create index for better query performance
CREATE INDEX idx_orders_delivered_by_staff_id ON orders(delivered_by_staff_id);

-- Update the updated_at timestamp
UPDATE orders SET updated_at = NOW() WHERE updated_at IS NOT NULL;
