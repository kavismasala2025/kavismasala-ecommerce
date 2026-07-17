import { useState } from 'react';
import { Menu, Search, ShoppingCart, X, User as UserIcon, LogOut } from 'lucide-react';
import { BRAND } from '../lib/supabase';
import { Link, useRouter } from '../lib/router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/shop' },
  { label: 'Track Order', to: '/track' },
  { label: 'About', to: '/about' },
];

export default function Header() {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const { navigate, path } = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    else navigate('/shop');
    setOpen(false);
    setQ('');
  };

  const cleanPath = path.split('?')[0];

  return (
    <header className="sticky top-0 z-40 bg-maroon-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={BRAND.logo}
              alt="Kavis Masala Logo"
              className="h-11 w-11 rounded-full object-cover border-2 border-cream-300 shadow-md"
            />
            <span className="text-white font-bold text-lg md:text-xl tracking-tight leading-tight">
              {BRAND.name}
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-4 pr-12 py-2 rounded-full bg-white/15 text-white placeholder-white/60 border border-white/30 focus:border-white/70 focus:bg-white/20 focus:outline-none text-sm transition"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 text-white/70 hover:text-white transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  cleanPath === n.to
                    ? 'text-white bg-white/20'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/account/profile"
                  className={`ml-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition ${
                    cleanPath.startsWith('/account') ? 'text-white bg-white/20' : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <UserIcon className="w-4 h-4" /> Account
                </Link>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/account"
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-white/85 hover:text-white hover:bg-white/10 transition"
              >
                <UserIcon className="w-4 h-4" /> Sign in
              </Link>
            )}
          </nav>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 bg-cream-300 hover:bg-cream-400 text-maroon-900 px-3 py-1.5 rounded-full font-semibold text-sm transition shrink-0 ml-2 md:ml-0"
            aria-label="Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-maroon-900 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {count}
            </span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-white rounded-full hover:bg-white/10"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-maroon-900 border-t border-white/10">
          <div className="px-4 py-3 space-y-2">
            <form onSubmit={submitSearch} className="relative mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 rounded-full bg-white/15 text-white placeholder-white/60 border border-white/30 focus:outline-none text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                <Search className="w-4 h-4" />
              </button>
            </form>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-full text-sm font-semibold text-white hover:bg-white/10"
              >
                {n.label}
              </Link>
            ))}
            <hr className="border-white/10 my-1" />
            {user ? (
              <>
                <Link
                  to="/account/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white hover:bg-white/10"
                >
                  <UserIcon className="w-4 h-4" /> My Account
                </Link>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white/80 hover:bg-white/10 text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white hover:bg-white/10"
              >
                <UserIcon className="w-4 h-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
