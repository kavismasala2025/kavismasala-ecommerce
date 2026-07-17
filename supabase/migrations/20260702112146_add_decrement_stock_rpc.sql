/*
# Add decrement_stock RPC

## Overview
Creates a security-definer function to atomically decrement product stock
when an order is placed. Prevents stock going negative.

## Function
- `decrement_stock(p_id uuid, qty int)` — decrements products.stock by
  qty, but never below zero. Returns void.

## Security
- Marked SECURITY DEFINER so the anon-key client can call it even though
  the function mutates data. The function only decrements and guards
  against negative stock — no ownership check is meaningful here because
  the storefront has no customer sign-in.
*/

CREATE OR REPLACE FUNCTION decrement_stock(p_id uuid, qty int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_stock(uuid, int) TO anon, authenticated;
