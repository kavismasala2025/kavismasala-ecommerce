import { useEffect, useState } from 'react';
import { Plus, Search, X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { supabase, CATEGORIES } from '../../lib/supabase';
import { formatINR } from '../../lib/format';
import AdminLayout from './AdminLayout';
import type { Product } from '../../lib/types';

const EMPTY = {
  name: '',
  slug: '',
  description: '',
  price: '',
  category: 'Podi Varieties',
  image_url: '',
  weight: '',
  stock: '',
  is_trending: false,
  is_active: true,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: String(p.price),
      category: p.category,
      image_url: p.image_url ?? '',
      weight: p.weight ?? '',
      stock: String(p.stock),
      is_trending: p.is_trending,
      is_active: p.is_active,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      category: form.category,
      image_url: form.image_url.trim() || null,
      weight: form.weight.trim() || null,
      stock: Number(form.stock) || 0,
      is_trending: form.is_trending,
      is_active: form.is_active,
    };

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const remove = async () => {
    if (!confirmDelete) return;
    await supabase.from('products').delete().eq('id', confirmDelete.id);
    setConfirmDelete(null);
    load();
  };

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.slug.includes(q);
  });

  return (
    <AdminLayout active="Products">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-stone-500 text-sm">{products.length} products in catalog</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-lg transition">
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-500">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 font-semibold">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                          {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 line-clamp-1">{p.name}</div>
                          <div className="text-xs text-stone-500">{p.weight}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-stone-600">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{formatINR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${p.stock <= 10 ? 'text-red-600' : 'text-stone-700'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        {p.is_trending && <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded">Trending</span>}
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{p.is_active ? 'Active' : 'Hidden'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDelete(p)} className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-stone-100 p-4 flex items-center justify-between">
              <h2 className="font-bold text-stone-900 text-lg">{editing ? 'Edit product' : 'Add product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} required className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Price (INR) *</label>
                  <input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Stock *</label>
                  <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Weight / pack size</label>
                  <input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 200g" className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Image URL</label>
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none" />
                  {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 w-20 h-20 rounded-lg object-cover border border-stone-100" />}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-stone-700">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:outline-none" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <input type="checkbox" checked={form.is_trending} onChange={(e) => setForm({ ...form, is_trending: e.target.checked })} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-400" />
                    Trending on homepage
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-400" />
                    Active (visible)
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Delete product?</h3>
            <p className="text-sm text-stone-500 mt-1">"{confirmDelete.name}" will be permanently removed.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-stone-200 text-stone-700 font-medium hover:bg-stone-50">Cancel</button>
              <button onClick={remove} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
