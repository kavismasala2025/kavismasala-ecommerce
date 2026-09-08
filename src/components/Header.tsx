import { useState } from 'react';
import {
  Menu,
  Search,
  ShoppingCart,
  X,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
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

    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    } else {
      navigate('/shop');
    }

    setOpen(false);
    setQ('');
  };

  const cleanPath = path.split('?')[0];

  return (
    <header className="sticky top-0 z-40 bg-maroon-800/95 backdrop-blur-md shadow-lg">

      {/* =====================================================
          MAIN HEADER
      ====================================================== */}

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">

        <div className="flex items-center gap-2 sm:gap-4 h-[68px]">

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 group"
          >
            <div className="relative">

              <img
               src="/kavis-logo.png"
  alt="Kavis Masala Logo"
                className="
                  h-11 w-11
                  sm:h-12 sm:w-12
                  rounded-full
                  object-cover
                  border-2 border-cream-300
                  shadow-md
                  transition-transform duration-300
                  group-hover:scale-105
                  group-active:scale-95
                "
              />

            </div>

            <span
              className="
                text-white
                font-bold
                text-base
                sm:text-lg
                md:text-xl
                tracking-tight
                leading-tight
                whitespace-nowrap
              "
            >
              {BRAND.name}
            </span>
          </Link>


          {/* =================================================
              DESKTOP SEARCH
          ================================================= */}

          <form
            onSubmit={submitSearch}
            className="
              hidden md:flex
              flex-1
              max-w-xl
              mx-3 lg:mx-5
              relative
            "
          >

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="
                w-full
                pl-5 pr-12
                py-2.5
                rounded-full
                bg-white/15
                text-white
                placeholder-white/60
                border border-white/25
                focus:border-white/70
                focus:bg-white/20
                focus:ring-2
                focus:ring-white/10
                focus:outline-none
                text-sm
                transition-all duration-200
              "
            />

            <button
              type="submit"
              className="
                absolute
                right-1
                top-1/2
                -translate-y-1/2
                w-9 h-9
                flex items-center justify-center
                rounded-full
                text-white/70
                hover:text-white
                hover:bg-white/10
                active:scale-90
                transition-all
              "
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

          </form>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav className="hidden md:flex items-center gap-0.5 ml-auto">

            {NAV.map((n) => {

              const active = cleanPath === n.to;

              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`
                    relative
                    px-3 lg:px-4
                    py-2.5
                    rounded-full
                    text-sm
                    font-semibold
                    transition-all duration-200

                    ${
                      active
                        ? 'text-white bg-white/20 shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {n.label}

                  {active && (
                    <span
                      className="
                        absolute
                        left-1/2
                        -translate-x-1/2
                        bottom-1
                        w-1 h-1
                        rounded-full
                        bg-cream-300
                      "
                    />
                  )}
                </Link>
              );
            })}


            {/* ACCOUNT */}

            {user ? (
              <>

                <Link
                  to="/account/profile"
                  className={`
                    ml-1
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-2.5
                    rounded-full
                    text-sm
                    font-semibold
                    transition-all duration-200

                    ${
                      cleanPath.startsWith('/account')
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <UserIcon className="w-4 h-4" />
                  Account
                </Link>

                <button
                  onClick={() => signOut()}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    w-9 h-9
                    rounded-full
                    text-white/65
                    hover:text-white
                    hover:bg-white/10
                    active:scale-90
                    transition-all
                  "
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </>

            ) : (

              <Link
                to="/account"
                className="
                  ml-1
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-2.5
                  rounded-full
                  text-sm
                  font-semibold
                  text-white/80
                  hover:text-white
                  hover:bg-white/10
                  transition-all
                "
              >
                <UserIcon className="w-4 h-4" />
                Sign in
              </Link>

            )}

          </nav>


          {/* =================================================
              CART
          ================================================= */}

          <Link
            to="/cart"
            className="
              relative
              flex items-center
              justify-center
              gap-1.5

              bg-cream-300
              hover:bg-cream-400

              text-maroon-900

              px-3
              sm:px-3.5
              py-2

              rounded-full

              font-semibold
              text-sm

              shadow-sm

              hover:shadow-md
              active:scale-95

              transition-all duration-200

              shrink-0
            "
            aria-label="Cart"
          >

            <ShoppingCart className="w-4 h-4" />

            <span className="hidden sm:inline">
              Cart
            </span>

            <span
              className="
                bg-maroon-900
                text-white
                text-[10px]
                font-bold

                rounded-full

                min-w-[19px]
                h-[19px]

                flex
                items-center
                justify-center

                px-1

                shadow-sm
              "
            >
              {count}
            </span>

          </Link>


          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            onClick={() => setOpen((v) => !v)}
            className="
              md:hidden

              w-10 h-10

              flex
              items-center
              justify-center

              text-white

              rounded-full

              hover:bg-white/10
              active:bg-white/20
              active:scale-90

              transition-all
            "
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

        </div>

      </div>


      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {open && (

        <div
          className="
            md:hidden

            bg-maroon-900

            border-t
            border-white/10

            shadow-xl

            animate-in
          "
        >

          <div className="px-4 py-4 space-y-2">

            {/* MOBILE SEARCH */}

            <form
              onSubmit={submitSearch}
              className="relative mb-4"
            >

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="
                  w-full

                  px-4
                  py-3
                  pr-12

                  rounded-2xl

                  bg-white/10

                  text-white
                  placeholder-white/50

                  border
                  border-white/20

                  focus:border-white/60
                  focus:bg-white/15
                  focus:outline-none

                  text-sm

                  transition-all
                "
              />

              <button
                type="submit"
                className="
                  absolute
                  right-1.5
                  top-1/2
                  -translate-y-1/2

                  w-9 h-9

                  flex
                  items-center
                  justify-center

                  rounded-full

                  text-white/70
                  hover:text-white
                  hover:bg-white/10

                  active:scale-90

                  transition-all
                "
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

            </form>


            {/* MOBILE NAV */}

            <div className="space-y-1">

              {NAV.map((n) => {

                const active = cleanPath === n.to;

                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={`
                      flex
                      items-center

                      min-h-[46px]

                      px-4
                      py-2.5

                      rounded-xl

                      text-sm
                      font-semibold

                      transition-all

                      ${
                        active
                          ? 'text-white bg-white/15'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {n.label}
                  </Link>
                );
              })}

            </div>


            <div className="h-px bg-white/10 my-3" />


            {/* MOBILE ACCOUNT */}

            {user ? (
              <>

                <Link
                  to="/account/profile"
                  onClick={() => setOpen(false)}
                  className="
                    flex
                    items-center
                    gap-2.5

                    min-h-[46px]

                    px-4
                    py-2.5

                    rounded-xl

                    text-sm
                    font-semibold
                    text-white

                    hover:bg-white/10

                    transition-all
                  "
                >
                  <UserIcon className="w-4 h-4" />
                  My Account
                </Link>

                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="
                    w-full

                    flex
                    items-center
                    gap-2.5

                    min-h-[46px]

                    px-4
                    py-2.5

                    rounded-xl

                    text-sm
                    font-semibold
                    text-white/80

                    hover:bg-white/10

                    text-left

                    transition-all
                  "
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>

              </>

            ) : (

              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="
                  flex
                  items-center
                  gap-2.5

                  min-h-[46px]

                  px-4
                  py-2.5

                  rounded-xl

                  text-sm
                  font-semibold
                  text-white

                  hover:bg-white/10

                  transition-all
                "
              >
                <UserIcon className="w-4 h-4" />
                Sign in
              </Link>

            )}

          </div>

        </div>

      )}

    </header>
  );
}