import { useEffect, useState } from 'react';
import { CheckCircle2, Package, Phone, MapPin, ArrowRight } from 'lucide-react';
import { supabase, BRAND } from '../lib/supabase';
import { formatINR } from '../lib/format';
import { Link, useRouter } from '../lib/router';
import type { Order, OrderItem } from '../lib/types';

export default function Success() {
  const { path } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const orderNumber = (() => {
    const qs = path.split('?')[1] ?? '';
    return new URLSearchParams(qs).get('order') ?? '';
  })();

  useEffect(() => {
    (async () => {
      if (!orderNumber) { setLoading(false); return; }
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();
      setOrder(data);
      if (data) {
        const { data: oi } = await supabase.from('order_items').select('*').eq('order_id', data.id);
        setItems(oi ?? []);
      }
      setLoading(false);
    })();
  }, [orderNumber]);

  if (loading) return <div className="bg-cream-50 min-h-screen flex items-center justify-center text-stone-500">Loading order...</div>;

  if (!order) {
    return (
      <div className="bg-cream-50 min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900">Order not found</h1>
          <Link to="/shop" className="text-maroon-700 font-semibold mt-3 inline-block hover:underline">Back to shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-lg">
          {/* Success header */}
          <div className="bg-maroon-800 text-white p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-white/80 mt-2">Thank you! We'll prepare your order right away.</p>
          </div>

          <div className="p-6 md:p-8">
            {/* Order ID */}
            <div className="flex items-center justify-between bg-cream-100 rounded-2xl p-4 mb-6 border border-cream-200">
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider">Order ID</div>
                <div className="font-bold text-maroon-900 text-xl">{order.order_number}</div>
              </div>
              <Package className="w-10 h-10 text-maroon-700" />
            </div>

            {/* Address + Contact */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-stone-50 rounded-xl p-4">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Delivery to</div>
                <div className="font-semibold text-stone-900">{order.customer_name}</div>
                <div className="text-sm text-stone-600 mt-1">{order.address}</div>
                <div className="text-sm text-stone-600">{order.city} {order.pincode}</div>
              </div>
              <div className="bg-stone-50 rounded-xl p-4">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Contact</div>
                <div className="flex items-center gap-2 text-sm text-stone-700">
                  <Phone className="w-4 h-4 text-maroon-700" /> {order.phone}
                </div>
                <div className="text-xs text-stone-500 mt-2">Payment: {order.payment_method} · <span className="text-green-600 font-semibold">{order.payment_status}</span></div>
                <div className="text-xs text-stone-500">Status: <span className="font-semibold text-stone-700">{order.status}</span></div>
              </div>
            </div>

            {/* Items */}
            <h2 className="font-bold text-stone-900 mb-3">Items ordered</h2>
            <div className="space-y-2 mb-6">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                  <div>
                    <div className="font-medium text-stone-900">{it.product_name}</div>
                    <div className="text-xs text-stone-500">Qty {it.quantity} · {formatINR(it.price)}</div>
                  </div>
                  <div className="font-semibold text-stone-900">{formatINR(it.line_total)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-sm mb-6">
              <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatINR(order.items_total)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Shipping</span><span>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span></div>
              <div className="flex justify-between font-bold text-maroon-900 text-base pt-2 border-t border-stone-100">
                <span>Total Paid</span><span>{formatINR(order.grand_total)}</span>
              </div>
            </div>

            {/* Support */}
            <div className="flex items-center gap-2 text-sm text-stone-600 bg-cream-100 rounded-xl p-3 mb-6">
              <MapPin className="w-4 h-4 text-maroon-700" />
              <span>For queries, call <a href={`tel:${BRAND.phone}`} className="font-semibold text-maroon-800">{BRAND.phone}</a> / <a href={`tel:${BRAND.phone2}`} className="font-semibold text-maroon-800">{BRAND.phone2}</a></span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/shop" className="flex-1 inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-white font-semibold px-6 py-3 rounded-full transition">
                Continue shopping <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/" className="flex-1 inline-flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold px-6 py-3 rounded-full transition">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
