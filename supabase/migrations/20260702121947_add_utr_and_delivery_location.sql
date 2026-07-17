/*
# Add UTR number and delivery location to orders

## Overview
Two new columns on the `orders` table:

### New Columns on `orders`
- `utr_number` (text, nullable) — UPI Transaction Reference (UTR) number
  entered by the customer after making payment. Admins use this to
  manually verify the payment.
- `delivery_location` (text, not null, default 'Tamil Nadu') — the
  delivery region selected at checkout. Used to calculate courier charges.
  Values: 'Tamil Nadu', 'Bangalore', 'Other'.

## Notes
- Idempotent: uses `DO $$ IF NOT EXISTS` blocks for both columns.
- Existing rows get the default values.
- No RLS changes needed (policies already allow anon CRUD on orders).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'utr_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN utr_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_location'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_location text NOT NULL DEFAULT 'Tamil Nadu';
  END IF;
END $$;
