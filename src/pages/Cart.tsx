import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/format';
import { SHIPPING_RATES, BRAND } from '../lib/supabase';
import { waLink, buildCartWhatsAppMessage } from '../lib/whatsapp';
import { Link } from '../lib/router';

export default function Cart() {
  const { items, total, setQty, remove, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-cream-50 min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-maroon-100 flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-maroon-700" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Your cart is empty</h1>
          <p className="text-stone-500 mt-2">Discover our authentic South Indian podis, pickles, and health mixes.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Start shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Shipping is location-based; calculated during checkout

  return (
    <div className="bg-cream-50 min-h-screen">
      <div className="bg-maroon-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl md:text-3xl font-bold">Your Cart ({count})</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((line) => (
            <div key={line.product.id} className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4">
              <Link to={`/product/${line.product.slug}`} className="shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-cream-100">
                  {line.product.image_url ? (
                    <img src={line.product.image_url} alt={line.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-maroon-300 text-2xl font-bold">
                      {line.product.name.charAt(0)}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${line.product.slug}`} className="font-semibold text-stone-900 hover:text-maroon-800 line-clamp-1">
                  {line.product.name}
                </Link>
                <div className="text-xs text-stone-500">{line.product.category}{line.product.weight ? ` · ${line.product.weight}` : ''}</div>
                <div className="text-maroon-800 font-bold mt-1">{formatINR(line.product.price)}</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-stone-200 rounded-full">
                    <button
                      onClick={() => setQty(line.product.id, line.quantity - 1)}
                      className="p-1.5 text-stone-600 hover:text-maroon-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                    <button
                      onClick={() => setQty(line.product.id, line.quantity + 1)}
                      className="p-1.5 text-stone-600 hover:text-maroon-700"
                      disabled={line.quantity >= line.product.stock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(line.product.id)}
                    className="text-stone-400 hover:text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-bold text-stone-900 hidden sm:block">
                {formatINR(line.product.price * line.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-20">
            <h2 className="font-bold text-stone-900 text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span className="font-medium">{formatINR(total)}</span></div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-stone-500">Courier</span>
                <span className="text-right text-maroon-700 font-medium text-xs">calculated at checkout</span>
              </div>
            </div>
            {/* Shipping rate table */}
            <div className="mt-3 rounded-xl bg-cream-50 border border-cream-200 p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1 text-stone-600 font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-maroon-700" /> Courier charges by location
              </div>
              {Object.values(SHIPPING_RATES).map((r) => (
                <div key={r.label} className="flex justify-between text-stone-500">
                  <span>{r.label}</span>
                  <span className="font-semibold text-maroon-800">{formatINR(r.rate)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-900">Subtotal</span>
                <span className="text-2xl font-bold text-maroon-900">{formatINR(total)}</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">+ courier charge added at checkout</p>
            </div>
            <Link
              to="/checkout"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-white font-semibold px-6 py-3.5 rounded-full transition"
            >
              Proceed to checkout <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Order via WhatsApp */}
            <a
              href={waLink(BRAND.phone, buildCartWhatsAppMessage(
                items.map((l) => ({ name: l.product.name, qty: l.quantity, price: l.product.price, total: l.product.price * l.quantity }))
              ))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3.5 rounded-full transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order via WhatsApp
            </a>
            <Link to="/shop" className="mt-3 w-full inline-flex items-center justify-center text-stone-600 hover:text-maroon-700 text-sm font-medium">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
