import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../lib/types';
import { formatINR } from '../lib/format';
import { useCart } from '../context/CartContext';
import { Link } from '../lib/router';

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (out) return;
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-xl hover:border-maroon-200 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-maroon-300 text-4xl font-bold">
            {product.name.charAt(0)}
          </div>
        )}
        {product.is_trending && (
          <span className="absolute top-3 left-3 bg-maroon-800 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
            Trending
          </span>
        )}
        {out && (
          <span className="absolute top-3 right-3 bg-stone-800 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-[11px] text-maroon-700 font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-maroon-800 transition">
          {product.name}
        </h3>
        {product.weight && <div className="text-xs text-stone-500 mt-0.5">{product.weight}</div>}
        <div className="flex items-center justify-between mt-3">
          <div className="text-lg font-bold text-maroon-900">{formatINR(product.price)}</div>
          <button
            onClick={handleAdd}
            disabled={out}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full transition ${
              out
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : added
                  ? 'bg-green-600 text-white'
                  : 'bg-maroon-800 text-white hover:bg-maroon-900'
            }`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
