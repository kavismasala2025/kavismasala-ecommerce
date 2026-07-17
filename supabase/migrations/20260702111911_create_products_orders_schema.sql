/*
# Kavis Masala — Products, Orders, and Order Items schema

## Overview
Creates the core e-commerce schema for the Kavis Masala storefront:
- `products` — the catalog of masala/podi/pickle/health-mix/rice-mix/vadagam items.
- `orders` — customer orders with contact, address, and payment info.
- `order_items` — line items belonging to an order.

This is a single-tenant storefront with no customer sign-in. Customers
browse and place orders anonymously. Admin access is gated in the
frontend by a simple username/password check (not Supabase Auth), so the
anon-key client must be able to read products and create orders. Admin
mutations (product CRUD, order status updates) also run through the anon
key, so policies are intentionally permissive (`USING (true)`) — the data
is shared/public by design.

## New Tables

### products
- `id` (uuid, primary key)
- `name` (text, not null) — product display name
- `slug` (text, unique, not null) — URL-friendly identifier
- `description` (text) — long description
- `price` (numeric, not null) — price in INR
- `category` (text, not null) — one of: Masala, Podi Varieties, Pickles, Health Mix, Rice Mixes, Vadagam
- `image_url` (text) — product image URL
- `weight` (text) — pack size, e.g. "200g"
- `stock` (integer, not null, default 0) — inventory count
- `is_trending` (boolean, default false) — show on homepage trending section
- `is_active` (boolean, default true) — soft delete / hide from storefront
- `created_at` (timestamptz, default now())

### orders
- `id` (uuid, primary key)
- `order_number` (text, unique, not null) — human-readable ID like KM2026XXXXX
- `customer_name` (text, not null)
- `phone` (text, not null)
- `address` (text, not null)
- `city` (text)
- `pincode` (text)
- `items_total` (numeric, not null) — sum of line item prices
- `shipping` (numeric, default 0)
- `grand_total` (numeric, not null) — items_total + shipping
- `payment_method` (text, default 'UPI') — always UPI for this store
- `payment_status` (text, default 'Paid') — Paid / Unpaid
- `status` (text, default 'Pending') — Pending/Confirmed/Preparing/Shipped/Delivered
- `notes` (text)
- `created_at` (timestamptz, default now())

### order_items
- `id` (uuid, primary key)
- `order_id` (uuid, references orders(id) on delete cascade)
- `product_id` (uuid, references products(id) on delete set null)
- `product_name` (text, not null) — snapshot of name at order time
- `price` (numeric, not null) — snapshot of unit price
- `quantity` (integer, not null)
- `line_total` (numeric, not null) — price * quantity

## Security
- RLS enabled on all three tables.
- Policies allow `anon, authenticated` full CRUD because the storefront
  has no customer sign-in and the admin panel authenticates in the
  frontend only. The data is intentionally shared/public.

## Important Notes
1. Products are seeded in a follow-up migration.
2. `order_number` is generated in the frontend as `KM` + year + 5-digit
   zero-padded sequence derived from a count of existing orders.
3. Stock is decremented when an order is placed (handled in the frontend
   insert flow).
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  image_url text,
  weight text,
  stock integer NOT NULL DEFAULT 0,
  is_trending boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text,
  pincode text,
  items_total numeric NOT NULL DEFAULT 0,
  shipping numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'UPI',
  payment_status text NOT NULL DEFAULT 'Paid',
  status text NOT NULL DEFAULT 'Pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  line_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "anon_update_order_items" ON order_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "anon_delete_order_items" ON order_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_trending ON products(is_trending);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
