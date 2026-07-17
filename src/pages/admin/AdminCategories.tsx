import { useEffect, useState } from 'react';
import { Tags, Loader2, Package } from 'lucide-react';
import { supabase, CATEGORIES } from '../../lib/supabase';
import { formatINR } from '../../lib/format';
import AdminLayout from './AdminLayout';
import type { Product } from '../../lib/types';

interface CategoryStat {
  name: string;
  count: number;
  inStock: number;
  totalValue: number;
  trending: number;
}

export default function AdminCategories() {
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*');
      const products = (data as Product[] | null) ?? [];
      const list: CategoryStat[] = CATEGORIES.map((name) => {
        const items = products.filter((p) => p.category === name);
        return {
          name,
          count: items.length,
          inStock: items.filter((p) => p.stock > 0).length,
          totalValue: items.reduce((s, p) => s + p.price * p.stock, 0),
          trending: items.filter((p) => p.is_trending).length,
        };
      });
      setStats(list);
      setBusy(false);
    })();
  }, []);

  return (
    <AdminLayout active="Categories">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Tags className="w-6 h-6 text-maroon-700" /> Categories
        </h1>
        <p className="text-stone-500 text-sm mt-1">Product groupings across the catalog.</p>
      </div>

      {busy ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-maroon-700 animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((c) => (
            <div key={c.name} className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-stone-900">{c.name}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{c.count} products</div>
                </div>
                <span className="text-xs font-semibold text-maroon-700 bg-maroon-50 px-2 py-1 rounded-full">
                  {c.inStock} in stock
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-stone-400 text-xs">Inventory value</div>
                  <div className="font-semibold text-stone-900">{formatINR(c.totalValue)}</div>
                </div>
                <div>
                  <div className="text-stone-400 text-xs">Trending</div>
                  <div className="font-semibold text-stone-900 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-maroon-700" /> {c.trending}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
