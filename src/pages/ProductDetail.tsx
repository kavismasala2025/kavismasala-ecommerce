import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, Check, ChevronRight, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/types';
import { formatINR } from '../lib/format';
import { useCart } from '../context/CartContext';
import { Link, useRouter } from '../lib/router';
import ProductCard from '../components/ProductCard';

export default function ProductDetail({ slug }: { slug: string }) {
  const { add } = useCart();
  const { navigate } = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      setProduct(data);
      if (data) {
        const { data: rel } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .eq('category_id', data.category_id)
  .neq('id', data.id)
  .limit(4);
        setRelated(rel ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-96 bg-stone-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Product not found</h1>
        <Link to="/shop" className="text-maroon-700 font-semibold mt-3 inline-block hover:underline">Back to shop</Link>
      </div>
    );
  }

  const out = product.stock <= 0;

  const handleAdd = () => {
    if (out) return;
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const buyNow = () => {
    if (out) return;
    add(product, qty);
    navigate('/cart');
  };

  return (
    <div className="bg-cream-50 min-h-screen">
      <div className="bg-maroon-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link to="/" className="hover:text-cream-300">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/shop" className="hover:text-cream-300">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/shop" className="hover:text-cream-300">
  Shop
</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="rounded-2xl overflow-hidden bg-cream-100 aspect-square shadow-md">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-maroon-300 text-7xl font-bold">
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
        <div className="text-maroon-700 font-semibold text-sm uppercase tracking-wider">
  Product
</div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1">{product.name}</h1>
            {product.weight && <div className="text-stone-500 mt-2">Pack size: {product.weight}</div>}

            <div className="mt-4 text-3xl font-bold text-maroon-900">{formatINR(product.price)}</div>
            <div className="text-sm text-stone-500 mt-1">Inclusive of all taxes</div>

            <p className="mt-5 text-stone-600 leading-relaxed">{product.description ?? 'No description available.'}</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border-2 border-maroon-200 rounded-full">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3 text-stone-600 hover:text-maroon-700 disabled:opacity-40"
                  disabled={out}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="p-3 text-stone-600 hover:text-maroon-700 disabled:opacity-40"
                  disabled={out || qty >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm">
                {out ? (
                  <span className="text-red-600 font-semibold">Out of stock</span>
                ) : (
                  <span className="text-green-600 font-medium">{product.stock} in stock</span>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={out}
                className={`flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-full transition ${
                  out
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : added
                      ? 'bg-green-600 text-white'
                      : 'bg-maroon-800 text-white hover:bg-maroon-900'
                }`}
              >
                {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {added ? 'Added to cart' : 'Add to cart'}
              </button>
              <button
                onClick={buyNow}
                disabled={out}
                className="flex-1 inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-full border-2 border-maroon-800 text-maroon-800 hover:bg-maroon-50 transition disabled:opacity-40"
              >
                Buy now
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-cream-100">
                <Leaf className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <div className="text-xs text-stone-700 font-medium">100% Natural</div>
              </div>
              <div className="p-3 rounded-xl bg-cream-100">
                <ShieldCheck className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <div className="text-xs text-stone-700 font-medium">FSSAI Certified</div>
              </div>
              <div className="p-3 rounded-xl bg-cream-100">
                <Truck className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <div className="text-xs text-stone-700 font-medium">Fast Shipping</div>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
