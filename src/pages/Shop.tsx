import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { supabase, CATEGORIES, RICE_MIX_SLUGS } from '../lib/supabase';
import { useRouter } from '../lib/router';
import type { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';

function parseQuery(search: string) {
  const params = new URLSearchParams(search);
  return { category: params.get('category') ?? '', q: params.get('q') ?? '' };
}

export default function Shop() {
  const { path } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const queryString = path.includes('?') ? path.split('?')[1] : '';

  useEffect(() => {
    const q = parseQuery(queryString);
    setActiveCat(q.category);
    setSearch(q.q);
  }, [queryString]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setProducts(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCat) {
      if (activeCat === 'Rice Mixes') {
        list = list.filter((p) => RICE_MIX_SLUGS.includes(p.slug));
      } else {
        list = list.filter((p) => p.category === activeCat);
      }
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(b.is_trending) - Number(a.is_trending));
    }
    return list;
  }, [products, activeCat, search, sort]);

  const setCategory = (cat: string) => {
    setActiveCat(cat);
    const qs = new URLSearchParams();
    if (cat) qs.set('category', cat);
    if (search) qs.set('q', search);
    const qsStr = qs.toString();
    window.history.pushState({}, '', qsStr ? `/shop?${qsStr}` : '/shop');
    // popstate won't fire on pushState; dispatch a popstate so the router updates
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="bg-cream-50 min-h-screen">
      <div className="bg-maroon-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {activeCat || 'All Products'}
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            {search && ` matching "${search}"`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-60 shrink-0`}>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="lg:hidden text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="mt-1.5 w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:border-maroon-400 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</label>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => setCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    !activeCat ? 'bg-maroon-100 text-maroon-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  All Products
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      activeCat === c ? 'bg-maroon-100 text-maroon-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-700"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-stone-500 hidden sm:block">Sort:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:border-maroon-400"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
              <div className="text-5xl mb-3">:(</div>
              <h3 className="font-semibold text-stone-900 text-lg">No products found</h3>
              <p className="text-stone-500 text-sm mt-1">Try a different category or search term.</p>
              <button
                onClick={() => { setCategory(''); setSearch(''); }}
                className="mt-4 text-maroon-700 font-semibold text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
