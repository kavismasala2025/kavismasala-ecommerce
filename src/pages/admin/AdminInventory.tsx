import { useEffect, useState } from 'react';
import { Boxes, Loader2, AlertTriangle, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/format';
import AdminLayout from './AdminLayout';
import type { Product } from '../../lib/types';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*').order('stock', { ascending: true });
      setProducts((data as Product[] | null) ?? []);
      setBusy(false);
    })();
  }, []);

  const filtered = products.filter((p) =>
    !q.trim() ? true : p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())
  );

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outStock = products.filter((p) => p.stock === 0);
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <AdminLayout active="Inventory">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Boxes className="w-6 h-6 text-maroon-700" /> Inventory
        </h1>
        <p className="text-stone-500 text-sm mt-1">Stock levels across all products.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Total SKUs" value={String(products.length)} />
        <Stat label="Units in stock" value={String(totalUnits)} />
        <Stat label="Inventory value" value={formatINR(totalValue)} />
        <Stat label="Low / Out" value={`${lowStock.length} / ${outStock.length}`} warn={outStock.length > 0} />
      </div>

      <div className="relative w-full sm:w-64 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm"
        />
      </div>

      {busy ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-maroon-700 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-left px-4 py-3 font-semibold">Category</th>
                  <th className="text-right px-4 py-3 font-semibold">Price</th>
                  <th className="text-right px-4 py-3 font-semibold">Stock</th>
                  <th className="text-right px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => {
                  const out = p.stock === 0;
                  const low = p.stock > 0 && p.stock <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-stone-900">{p.name}</td>
                      <td className="px-4 py-3 text-stone-600">{p.category}</td>
                      <td className="px-4 py-3 text-right text-stone-700">{formatINR(p.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          out ? 'bg-red-50 text-red-700' : low ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {(out || low) && <AlertTriangle className="w-3 h-3" />}
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-stone-700">{formatINR(p.stock * p.price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${warn ? 'border-amber-200' : 'border-stone-100'}`}>
      <div className="text-xs text-stone-400">{label}</div>
      <div className={`text-lg font-bold mt-1 ${warn ? 'text-amber-700' : 'text-stone-900'}`}>{value}</div>
    </div>
  );
}
