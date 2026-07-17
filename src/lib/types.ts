export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  weight: string | null;
  stock: number;
  is_trending: boolean;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  phone2: string | null;
  whatsapp_number: string | null;
  address: string;
  city: string | null;
  pincode: string | null;
  items_total: number;
  shipping: number;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes: string | null;
  utr_number: string | null;
  delivery_location: string;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone: string | null;
  door_no: string;
  street_name: string;
  area: string | null;
  city: string;
  pincode: string;
  delivery_location: string;
  is_default: boolean;
  created_at: string;
}
