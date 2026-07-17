import { useEffect, useState } from 'react';
import { ArrowRight, Leaf, Package, ShieldCheck, Truck, BadgeCheck } from 'lucide-react';
import { supabase, BRAND, CATEGORIES } from '../lib/supabase';
import type { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import { Link, useRouter } from '../lib/router';

const ALL_CATS = ['All Products', ...CATEGORIES] as const;

export default function Home() {
  const { navigate } = useRouter();
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Products');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_trending', true)
        .order('created_at', { ascending: false });
      setTrending(data ?? []);
      setLoading(false);
    })();
  }, []);

  const handleFilter = (cat: string) => {
    setActiveFilter(cat);
    if (cat === 'All Products') navigate('/shop');
    else navigate(`/shop?category=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="bg-cream-100 py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-stone-900">
              Welcome to<br />
              <span className="text-maroon-800">Kavis Masala</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-stone-600 leading-relaxed max-w-md">
              {BRAND.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold px-7 py-3 rounded-full transition shadow-lg shadow-maroon-800/30"
              >
                Shop Now
              </Link>
              <a
                href={`tel:${BRAND.phone}`}
                className="inline-flex items-center gap-2 border-2 border-maroon-800 text-maroon-800 hover:bg-maroon-50 font-bold px-5 py-3 rounded-full transition"
              >
                Call us
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Spices"
              className="w-full rounded-2xl shadow-xl object-cover max-h-80"
            />
          </div>
        </div>
      </section>

      {/* FSSAI trust banner */}
      <section className="bg-gradient-to-r from-maroon-800 to-maroon-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cream-300 text-maroon-900 flex items-center justify-center shrink-0 shadow-md">
            <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm sm:text-base tracking-wide">FSSAI Licensed</div>
            <div className="text-cream-200/90 text-xs sm:text-sm">
              License No: <span className="font-semibold tracking-wider">{BRAND.fssaiLicense}</span>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/20" />
          <p className="text-white/80 text-xs sm:text-sm max-w-md leading-snug">
            Certified for food safety &amp; quality. Shop with confidence.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap gap-6 justify-center md:justify-between items-center">
          {[
            { icon: Leaf, text: 'No Artificial Agents' },
            { icon: Package, text: 'No Preservatives' },
            { icon: Truck, text: 'Pan-India Delivery' },
            { icon: ShieldCheck, text: 'FSSAI Certified' },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <div className="w-8 h-8 rounded-full bg-maroon-100 flex items-center justify-center">
                <b.icon className="w-4 h-4 text-maroon-800" />
              </div>
              {b.text}
            </div>
          ))}
        </div>
      </section>

      {/* Category filter pills */}
      <section className="bg-white py-5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 flex-wrap justify-center">
            {ALL_CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition ${
                  activeFilter === cat
                    ? 'bg-maroon-800 border-maroon-800 text-white'
                    : 'bg-white border-maroon-300 text-maroon-800 hover:bg-maroon-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 uppercase tracking-wide">
            Trending Now
          </h2>
          <div className="mx-auto mt-2 w-16 h-1 rounded-full bg-maroon-700" />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-maroon-800 font-semibold hover:underline"
          >
            View all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-maroon-800 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Taste the Tradition</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-6">
            Order online and pay securely via Google Pay (UPI). Delivered fresh to your doorstep.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-cream-300 hover:bg-cream-400 text-maroon-900 font-bold px-7 py-3 rounded-full transition"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
