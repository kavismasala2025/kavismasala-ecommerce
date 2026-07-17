import { useEffect, useState } from 'react';
import { Search, X, Eye, Phone, MapPin, CreditCard } from 'lucide-react';
import { supabase, ORDER_STATUSES } from '../../lib/supabase';
import { formatINR } from '../../lib/format';
import { waLink, customerStatusMessage } from '../../lib/whatsapp';
import AdminLayout from './AdminLayout';
import type { Order, OrderItem } from '../../lib/types';

const WA_STATUSES = ['Confirmed', 'Preparing', 'Shipped', 'Delivered'];

const WA_STATUS_LABEL: Record<string, string> = {
  Confirmed: '✅ Notify: Confirmed',
  Preparing: '📦 Notify: Packing',
  Shipped:   '🚚 Notify: Shipped',
  Delivered: '🎉 Notify: Delivered',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<(Order & { items: OrderItem[] }) | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected && selected.id === id) setSelected({ ...selected, status });
  };

  const updateAndNotify = async (order: Order, status: string) => {
    await updateStatus(order.id, status);
    const msg = customerStatusMessage({ ...order, status }, status);
    const notifyPhone = order.whatsapp_number || order.phone;
    window.open(waLink(notifyPhone, msg), '_blank');
  };

  const viewOrder = async (o: Order) => {
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
    setSelected({ ...o, items: items ?? [] });
  };

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return o.order_number.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.phone.includes(q);
    }
    return true;
  });

  return (
    <AdminLayout active="Orders">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-500 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, or phone..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-stone-200 focus:border-maroon-400 focus:outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 focus:border-maroon-400 focus:outline-none text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-500">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 uppercase text-xs">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Payment</th>
                  <th className="text-left px-4 py-3 font-semibold">Total</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-semibold text-stone-900">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900">{o.customer_name}</div>
                      <div className="text-xs text-stone-500">{o.phone}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-stone-600">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.payment_status}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{formatINR(o.grand_total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-full border-0 cursor-pointer ${statusColor(o.status)}`}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => viewOrder(o)} className="text-stone-500 hover:text-maroon-700" aria-label="View">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-stone-100 p-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-stone-900">{selected.order_number}</h2>
                <p className="text-xs text-stone-500">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">

              {/* Customer */}
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Customer</div>
                <div className="font-semibold text-stone-900">{selected.customer_name}</div>
                <div className="flex items-center gap-2 text-sm text-stone-600 mt-1">
                  <Phone className="w-4 h-4 text-maroon-600 shrink-0" />
                  <span>
                    <span className="text-xs text-stone-400 mr-1">Ph 1:</span>{selected.phone}
                  </span>
                </div>
                {selected.phone2 && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 mt-1">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>
                      <span className="text-xs text-stone-400 mr-1">Ph 2:</span>{selected.phone2}
                    </span>
                  </div>
                )}
                {selected.whatsapp_number && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 mt-1">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600 shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>
                      <span className="text-xs text-stone-400 mr-1">WhatsApp:</span>{selected.whatsapp_number}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-stone-600 mt-1">
                  <MapPin className="w-4 h-4 text-maroon-600 mt-0.5 shrink-0" />
                  <span>{selected.address}, {selected.city} {selected.pincode}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-stone-50 rounded-xl p-3 space-y-1.5">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Payment</div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-maroon-600" />
                  {selected.payment_method} ·{' '}
                  <span className={`font-semibold ${selected.payment_status === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                    {selected.payment_status}
                  </span>
                </div>
                {(selected as any).delivery_location && (
                  <div className="text-xs text-stone-600">
                    <span className="font-semibold">Delivery region:</span> {(selected as any).delivery_location}
                  </div>
                )}
                {(selected as any).utr_number ? (
                  <div className="mt-1.5 bg-white border border-green-200 rounded-lg p-2.5">
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider">UPI Transaction ID / UTR</div>
                    <div className="font-mono font-semibold text-sm text-green-700 mt-0.5 break-all">{(selected as any).utr_number}</div>
                    <div className="text-[10px] text-stone-400 mt-1">Verify this in your GPay / bank statement</div>
                  </div>
                ) : (
                  <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700">
                    No UTR number provided — follow up with customer.
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Items</div>
                <div className="space-y-2">
                  {selected.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm border-b border-stone-100 pb-2">
                      <div>
                        <div className="font-medium text-stone-900">{it.product_name}</div>
                        <div className="text-xs text-stone-500">Qty {it.quantity} · {formatINR(it.price)}</div>
                      </div>
                      <div className="font-semibold text-stone-900">{formatINR(it.line_total)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatINR(selected.items_total)}</span></div>
                  <div className="flex justify-between"><span className="text-stone-500">Courier</span><span>{formatINR(selected.shipping)}</span></div>
                  <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
                    <span>Total</span><span>{formatINR(selected.grand_total)}</span>
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Notes</div>
                  <div className="text-sm text-stone-700">{selected.notes}</div>
                </div>
              )}

              {/* Status update */}
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Update status</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${selected.status === s ? statusColor(s) + ' ring-2 ring-offset-1 ring-maroon-400' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* WhatsApp notification buttons */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                    Notify customer via WhatsApp
                  </div>
                  <div className="space-y-2">
                    {WA_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateAndNotify(selected, s)}
                        className="w-full flex items-center gap-2.5 bg-white hover:bg-green-100 border border-green-200 text-stone-800 text-xs font-semibold px-3 py-2.5 rounded-lg transition text-left"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600 shrink-0">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {WA_STATUS_LABEL[s]} — updates status & notifies customer
                      </button>
                    ))}
                    <div className="text-[11px] text-stone-400 mt-1">
                      Clicking these buttons updates the order status AND opens WhatsApp with a pre-written message to the customer.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function statusColor(s: string) {
  switch (s) {
    case 'Pending':   return 'bg-amber-100 text-amber-700';
    case 'Confirmed': return 'bg-blue-100 text-blue-700';
    case 'Preparing': return 'bg-purple-100 text-purple-700';
    case 'Shipped':   return 'bg-indigo-100 text-indigo-700';
    case 'Delivered': return 'bg-green-100 text-green-700';
    default:          return 'bg-stone-100 text-stone-700';
  }
}
