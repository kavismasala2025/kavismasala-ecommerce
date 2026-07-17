import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../lib/types';

interface CartLine {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  total: number;
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'kavis_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, l) => n + l.quantity, 0);
    const total = items.reduce((s, l) => s + l.product.price * l.quantity, 0);
    return {
      items,
      count,
      total,
      add: (product, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((l) => l.product.id === product.id);
          if (existing) {
            return prev.map((l) =>
              l.product.id === product.id ? { ...l, quantity: l.quantity + qty } : l,
            );
          }
          return [...prev, { product, quantity: qty }];
        }),
      remove: (productId) => setItems((prev) => prev.filter((l) => l.product.id !== productId)),
      setQty: (productId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((l) => l.product.id !== productId)
            : prev.map((l) => (l.product.id === productId ? { ...l, quantity: qty } : l)),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
