-- Create a function to setup Chatkara printer (bypasses RLS)
CREATE OR REPLACE FUNCTION setup_chatkara_printer(
  cafe_id UUID,
  printer_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert printer configuration
  INSERT INTO public.cafe_printer_configs (
    cafe_id,
    printer_name,
    printer_type,
    connection_type,
    printnode_printer_id,
    paper_width,
    print_density,
    auto_cut,
    is_active,
    is_default,
    created_at,
    updated_at
  ) VALUES (
    cafe_id,
    'Chatkara POS-80-Series',
    'epson_tm_t82'::printer_type,
    'network'::connection_type,
    printer_id,
    80,
    8,
    true,
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (cafe_id, is_default) 
  WHERE is_default = true
  DO UPDATE SET
    printer_name = EXCLUDED.printer_name,
    printer_type = EXCLUDED.printer_type,
    connection_type = EXCLUDED.connection_type,
    printnode_printer_id = EXCLUDED.printnode_printer_id,
    paper_width = EXCLUDED.paper_width,
    print_density = EXCLUDED.print_density,
    auto_cut = EXCLUDED.auto_cut,
    is_active = EXCLUDED.is_active,
    updated_at = NOW()
  RETURNING *;

  -- Get the created/updated configuration
  SELECT json_build_object(
    'success', true,
    'printer_config', row_to_json(cpc)
  ) INTO result
  FROM public.cafe_printer_configs cpc
  WHERE cpc.cafe_id = setup_chatkara_printer.cafe_id
  AND cpc.is_default = true;

  RETURN result;
END;
$$;
