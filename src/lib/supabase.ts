import { createClient } from '@supabase/supabase-js';
import type { Product } from './types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'kavis_auth',
  },
});

const PRODUCT_STORAGE_KEY = 'kavis-products-catalog';

function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    const products = raw ? JSON.parse(raw) : [];
    console.log(`[LocalStorage] Retrieved ${products.length} products`);
    if (products.length > 0) {
      console.log('[LocalStorage] First product:', { id: products[0].id, name: products[0].name, category_id: products[0].category_id });
    }
    return products;
  } catch (e) {
    console.error('[LocalStorage] Failed to parse products', e);
    return [];
  }
}

function setStoredProducts(products: Product[]) {
  if (typeof window === 'undefined') return;
  const json = JSON.stringify(products);
  console.log(`[LocalStorage] Saving ${products.length} products (${(json.length / 1024).toFixed(2)} KB)`);
  console.log('[LocalStorage] Sample product:', products[0] ? { id: products[0].id, name: products[0].name, category_id: products[0].category_id } : 'N/A');
  window.localStorage.setItem(PRODUCT_STORAGE_KEY, json);
}

function normalizeProduct(product: Record<string, any>, categoryMap: Record<string, string> = {}) {
  return {
    ...product,
    id: product.id ?? (globalThis.crypto?.randomUUID?.() ?? String(Date.now())),
    category: product.category ?? (product.category_id ? (categoryMap[product.category_id] ?? 'Uncategorized') : 'Uncategorized'),
    image_url: product.image_url ?? (Array.isArray(product.images) ? product.images[0] : null),
    stock: Number(product.stock ?? 0),
    price: Number(product.price ?? 0),
    is_trending: Boolean(product.is_trending),
    is_active: product.is_active !== false,
  } as Product;
}

export async function getCategoryMap() {
  const { data } = await supabase.from('categories').select('id,name').order('sort_order', { ascending: true });
  return Object.fromEntries((data ?? []).map((c: { id: string; name: string }) => [c.id, c.name]));
}

export async function enrichProductsWithCategory(products: Array<Record<string, any>>) {
  const categoryMap = await getCategoryMap();
  return (products ?? []).map((product) => normalizeProduct(product, categoryMap));
}

export async function loadProductsCatalog() {
  try {
    console.log('[Supabase] Fetching products from database...');
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    console.log(`[Supabase] Fetch result: ${data?.length || 0} products, error: ${error?.message || 'none'}`);
    if (data && data.length > 0) {
      console.log('[Supabase] First product:', { id: data[0].id, name: data[0].name, category_id: data[0].category_id });
      const categoryMap = await getCategoryMap();
      const mapped = data.map((product) => normalizeProduct(product, categoryMap));
      setStoredProducts(mapped);
      return mapped;
    }
  } catch (err) {
    console.error('[Supabase] Fetch failed', err);
    // fall back to local storage
  }

  console.log('[Cache] Falling back to localStorage');
  return getStoredProducts();
}

export async function saveProductRecord(payload: Record<string, any>, editingId?: string) {
  console.log('[SaveRecord] Starting save, editingId:', editingId, 'payload:', { name: payload.name, category_id: payload.category_id });
  const stored = getStoredProducts();
  const categoryMap = await getCategoryMap();
  const productId = editingId ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  const normalized = normalizeProduct({
    ...payload,
    id: productId,
    created_at: payload.created_at ?? new Date().toISOString(),
  }, categoryMap);

  console.log('[SaveRecord] Normalized product:', { id: normalized.id, name: normalized.name, category_id: normalized.category_id });
  const nextProducts = editingId
    ? stored.map((product) => (product.id === editingId ? normalized : product))
    : [normalized, ...stored];
  console.log('[SaveRecord] Updated product list, count:', nextProducts.length);
  setStoredProducts(nextProducts);

  try {
    if (editingId) {
      console.log('[SaveRecord] Attempting Supabase update for ID:', editingId);
      const { data, error } = await supabase
  .from('products')
  .update(payload)
  .eq('id', editingId)
  .select();

console.log('[AdminProducts] UPDATE DATA:', data);
console.log('[AdminProducts] UPDATE ERROR:', error);

console.log('[SaveRecord] Supabase update result:', error?.message || 'success');
      if (!error) {
        notifyProductsChanged();
        return { success: true, product: normalized };
      }
    } else {
      console.log('[SaveRecord] Attempting Supabase insert');
      const { error } = await supabase.from('products').insert(payload);
      console.log('[SaveRecord] Supabase insert result:', error?.message || 'success');
      if (!error) {
        notifyProductsChanged();
        return { success: true, product: normalized };
      }
    }
  } catch (err) {
    console.error('[SaveRecord] Supabase operation failed', err);
    // fall back to local storage updates above
  }

  console.log('[SaveRecord] Notifying products changed');
  notifyProductsChanged();
  return { success: true, product: normalized, fallback: true };
}

export function notifyProductsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('products:updated'));
  window.localStorage.setItem('products:updated', String(Date.now()));
}

export function subscribeToProducts(callback: (payload: unknown) => void) {
  if (typeof window === 'undefined') return () => undefined;

  const handleRefresh = () => callback({ source: 'browser-event' });
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'products:updated') callback({ source: 'storage-event' });
  };

  window.addEventListener('products:updated', handleRefresh);
  window.addEventListener('storage', handleStorage);

  const channel = supabase.channel('products-changes');
  channel.on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'products' },
    (payload) => callback(payload),
  );
  channel.subscribe();

  return () => {
    window.removeEventListener('products:updated', handleRefresh);
    window.removeEventListener('storage', handleStorage);
    channel.unsubscribe();
  };
}

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
