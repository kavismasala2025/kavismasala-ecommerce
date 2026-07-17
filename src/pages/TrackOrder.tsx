import { useState } from 'react';
import { Search, Package, Check, Truck, MapPin, Clock, CheckCircle2, Phone } from 'lucide-react';
import { supabase, BRAND } from '../lib/supabase';
import { formatINR } from '../lib/format';
import { waLink } from '../lib/whatsapp';
import type { Order, OrderItem } from '../lib/types';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered'] as const;

const STATUS_META: Record<string, { icon: React.ElementType; label: string; desc: string; color: string }> = {
  Pending:   { icon: Clock,          label: 'Order Placed',    desc: 'Your order is received and awaiting confirmation.',  color: 'text-amber-600' },
  Confirmed: { icon: Check,          label: 'Confirmed',       desc: 'Your order has been confirmed.',                    color: 'text-blue-600'  },
  Preparing: { icon: Package,        label: 'Being Prepared',  desc: 'Your masalas are being freshly prepared and packed.',color: 'text-purple-600'},
  Shipped:   { icon: Truck,          label: 'Shipped',         desc: 'Your order is on its way!',                         color: 'text-indigo-600'},
  Delivered: { icon: CheckCircle2,   label: 'Delivered',       desc: 'Your order has been delivered. Enjoy! 🌶️',          color: 'text-green-600' },
};

type FoundOrder = Order & { items: OrderItem[] };

export default function TrackOrder() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FoundOrder[] | null>(null);
  const [error, setError] = useState('');

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResults(null);

    let { data: orders } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.ilike.%${q}%,phone.eq.${q}`)
      .order('created_at', { ascending: false });

    if (!orders || orders.length === 0) {
      setError('No orders found. Please check the Order ID or phone number and try again.');
      setLoading(false);
      return;
    }

    const full: FoundOrder[] = await Promise.all(
      orders.map(async (o) => {
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
        return { ...o, items: items ?? [] };
      }),
    );
    setResults(full);
    setLoading(false);
  };

  const currentStep = (status: string) => STATUS_STEPS.indexOf(status as any);

  return (
    <div className="bg-cream-50 min-h-screen">
      <div className="bg-maroon-800 text-white py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold">Track Your Order</h1>
          <p className="text-white/70 mt-2">Enter your Order ID or registered phone number</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={search} className="bg-white rounded-2xl border border-stone-100 p-5 flex gap-3 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order ID (e.g. KM20260001) or phone number"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-maroon-800 hover:bg-maroon-900 text-white font-semibold px-5 py-3 rounded-xl transition disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Track
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {results && results.map((order) => {
          const step = currentStep(order.status);

          return (
            <div key={order.id} className="mt-6 bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
              {/* Order header */}
              <div className="bg-maroon-50 border-b border-maroon-100 p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-bold text-maroon-900 text-lg">{order.order_number}</div>
                  <div className="text-xs text-stone-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Shipped'   ? 'bg-indigo-100 text-indigo-700' :
                    order.status === 'Preparing' ? 'bg-purple-100 text-purple-700' :
                    order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{order.status}</span>
                  <div className="text-xs text-stone-500">Total: {formatINR(order.grand_total)}</div>
                </div>
              </div>

              {/* Status timeline */}
              <div className="p-5">
                <div className="relative">
                  {/* Line */}
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-stone-100" />
                  <div
                    className="absolute left-5 top-5 w-0.5 bg-maroon-600 transition-all duration-500"
                    style={{ height: step > 0 ? `${(step / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                  />
                  <div className="space-y-6">
                    {STATUS_STEPS.map((s, i) => {
                      const meta = STATUS_META[s];
                      const Icon = meta.icon;
                      const done = i <= step;
                      const active = i === step;
                      return (
                        <div key={s} className="flex items-start gap-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            done
                              ? 'bg-maroon-800 border-maroon-800 text-white'
                              : 'bg-white border-stone-200 text-stone-300'
                          } ${active ? 'ring-4 ring-maroon-200' : ''}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 pt-1.5">
                            <div className={`font-semibold text-sm ${done ? 'text-stone-900' : 'text-stone-400'}`}>{meta.label}</div>
                            <div className={`text-xs mt-0.5 ${active ? 'text-maroon-700' : 'text-stone-400'}`}>{active ? meta.desc : ''}</div>
                          </div>
                          {active && (
                            <span className="text-[10px] font-bold bg-maroon-100 text-maroon-700 px-2 py-1 rounded-full animate-pulse">Current</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Delivery info */}
              <div className="border-t border-stone-100 p-4 grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-stone-400 uppercase tracking-wider mb-1">Delivering to</div>
                  <div className="font-semibold text-stone-900">{order.customer_name}</div>
                  <div className="text-sm text-stone-600 flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-maroon-600 mt-0.5 shrink-0" />
                    {order.address}, {order.city} {order.pincode}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 uppercase tracking-wider mb-1">Items ordered</div>
                  {order.items.map((it) => (
                    <div key={it.id} className="text-sm text-stone-600 flex justify-between">
                      <span>{it.product_name} ×{it.quantity}</span>
                      <span className="font-medium">{formatINR(it.line_total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help */}
              <div className="border-t border-stone-100 p-4 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-stone-500 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-maroon-700" />
                  Need help? Call <a href={`tel:${BRAND.phone}`} className="text-maroon-700 font-semibold">{BRAND.phone}</a>
                </div>
                <a
                  href={waLink(BRAND.phone, `Hi! I need help with my order ${order.order_number}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Support
                </a>
              </div>
            </div>
          );
        })}

        {!results && !loading && !error && (
          <div className="mt-8 text-center text-stone-500 text-sm">
            <Package className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p>Enter your Order ID or phone number above to track your order.</p>
            <p className="mt-1">Your Order ID looks like <strong>KM20260001</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
