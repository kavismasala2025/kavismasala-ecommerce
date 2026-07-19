import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'kavis_auth',
  },
});

export const BRAND = {
  name: 'Kavis Masala',
  phone: '9585008083',
  phone2: '9790060710',
  tagline: 'Pure homemade masala products made with traditional recipes and authentic taste. Straight from Kanchipuram to your kitchen.',
  email: 'kavismasala2025@gmail.com',
  upiId: 'yaka.rkavitha-1@okhdfcbank',
  upiName: 'Kavitha Ramesh',
  logo: '/Screenshot_2026-05-04_195040.png',
  qrCode: '/WhatsApp_Image_2026-07-02_at_5.40.02_PM.jpeg',
  instagram: 'https://www.instagram.com/kavis_masala?igsh=azZoc2hmMjRwaW1j',
  instagramHandle: 'kavis_masala',
  fssaiLicense: '22415421000400',
};

export const CATEGORIES = [
  'Masala',
  'Podi Varieties',
  'Pickles',
  'Health Mix',
  'Rice Mixes',
  'Vadagam',
] as const;

export type Category = (typeof CATEGORIES)[number];

// Products that belong to Rice Mixes are stored under their primary
// category in the DB; this map lists the slugs that should also appear
// when the Rice Mixes filter is selected.
export const RICE_MIX_SLUGS = [
  'andhra-kaara-paruppu-podi',
  'karuveppilai-podi',
  'mudakathan-podi',
];

export const SHIPPING_RATES: Record<string, { label: string; rate: number; note?: string }> = {
  'Tamil Nadu': { label: 'Tamil Nadu', rate: 60, note: '₹60 courier charge (up to 1 kg)' },
  'Bangalore': { label: 'Bangalore (Karnataka)', rate: 90, note: '₹80–100 courier charge (avg ₹90)' },
  'Other': { label: 'Other States', rate: 130, note: 'Rates vary — we will confirm before dispatch' },
};

export const DELIVERY_LOCATIONS = Object.keys(SHIPPING_RATES);

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Shipped',
  'Delivered',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'kavis2026';
console.log("Supabase URL:", url);
console.log("Key loaded:", anonKey ? "YES" : "NO");
