/*
# Customer accounts with persistent addresses

1. Purpose
   Lets shoppers create an account, save multiple delivery addresses, and
   have their details auto-filled at checkout. One address per customer is
   marked as the default and is the one pre-selected on the checkout page.

2. New Tables
   - `customers`
     - `id` uuid PRIMARY KEY, mirrors `auth.users.id` (one row per user)
     - `full_name` text (collected at signup, used in order alerts)
     - `phone` text (primary contact, 10 digits)
     - `created_at` timestamptz DEFAULT now()
   - `customer_addresses`
     - `id` uuid PRIMARY KEY
     - `customer_id` uuid NOT NULL, references `customers(id)` ON DELETE CASCADE
     - `label` text (e.g. "Home", "Office") — short identifier the user picks
     - `full_name` text (recipient name for this address)
     - `phone` text (recipient phone for this address)
     - `door_no` text
     - `street_name` text
     - `area` text (optional landmark / area)
     - `city` text
     - `pincode` text (6 digits)
     - `delivery_location` text (one of the SHIPPING_RATES keys)
     - `is_default` boolean DEFAULT false
     - `created_at` timestamptz DEFAULT now()

3. Security
   - RLS enabled on both tables.
   - `customers`: a user can read/update only their own row. INSERT is
     handled by the user inserting their own row (id = auth.uid()).
   - `customer_addresses`: full CRUD scoped to the owning customer via
     `auth.uid() = customer_id`. The `customer_id` column has
     `DEFAULT auth.uid()` so inserts from the client (which omit it)
     still satisfy the WITH CHECK policy.
   - All policies scoped `TO authenticated` — this app now has a sign-in
     screen, so anon access is intentionally blocked.

4. Important Notes
   - The `customers.id` is the same as `auth.users.id` (no separate
     generated id). This makes joins and ownership checks trivial.
   - `customer_addresses.customer_id` defaults to `auth.uid()` so the
     frontend can `.insert({ label, ... })` without threading the id.
   - Only one address per customer should be `is_default = true`. This is
     enforced in application code (the API resets siblings before setting
     one) rather than via a partial unique index, because Postgres partial
     unique indexes on `is_default = true` allow at most one default
     across ALL customers — not what we want.
*/

-- ── customers ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_customer" ON customers;
CREATE POLICY "select_own_customer" ON customers FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_customer" ON customers;
CREATE POLICY "insert_own_customer" ON customers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_customer" ON customers;
CREATE POLICY "update_own_customer" ON customers FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_customer" ON customers;
CREATE POLICY "delete_own_customer" ON customers FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ── customer_addresses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES customers(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  full_name text NOT NULL,
  phone text,
  door_no text NOT NULL,
  street_name text NOT NULL,
  area text,
  city text NOT NULL,
  pincode text NOT NULL,
  delivery_location text NOT NULL DEFAULT 'Tamil Nadu',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer
  ON customer_addresses(customer_id);

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_addresses" ON customer_addresses;
CREATE POLICY "select_own_addresses" ON customer_addresses FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON customer_addresses;
CREATE POLICY "insert_own_addresses" ON customer_addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "update_own_addresses" ON customer_addresses;
CREATE POLICY "update_own_addresses" ON customer_addresses FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON customer_addresses;
CREATE POLICY "delete_own_addresses" ON customer_addresses FOR DELETE
  TO authenticated USING (auth.uid() = customer_id);
