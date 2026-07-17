DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'phone2'
  ) THEN
    ALTER TABLE orders ADD COLUMN phone2 text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN whatsapp_number text;
  END IF;
END $$;
