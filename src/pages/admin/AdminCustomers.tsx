import { useEffect, useState } from 'react';
import { Users, Loader2, Mail, Phone, MapPin, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from './AdminLayout';
import type { Customer, CustomerAddress, Order } from '../../lib/types';

interface CustomerRow {
  customer: Customer;
  email: string;
  addressCount: number;
  defaultAddress: CustomerAddress | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export default function AdminCustomers() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      // customers table doesn't store email; pull from auth via the orders table
      // as a proxy (orders store customer_name + phone). We join in JS.
      const [{ data: customers }, { data: addresses }, { data: orders }] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('customer_addresses').select('*'),
        supabase.from('orders').select('id, customer_name, phone, grand_total, created_at'),
      ]);

      const custList = (customers as Customer[] | null) ?? [];
      const addrList = (addresses as CustomerAddress[] | null) ?? [];
      const orderList = (orders as Order[] | null) ?? [];

      const built: CustomerRow[] = custList.map((c) => {
        const myAddrs = addrList.filter((a) => a.customer_id === c.id);
        const myOrders = orderList.filter((o) => o.phone === c.phone);
        return {
          customer: c,
          email: '',
          addressCount: myAddrs.length,
          defaultAddress: myAddrs.find((a) => a.is_default) ?? myAddrs[0] ?? null,
          orderCount: myOrders.length,
          totalSpent: myOrders.reduce((s, o) => s + o.grand_total, 0),
          lastOrderAt: myOrders.length ? myOrders[myOrders.length - 1].created_at : null,
        };
      });

      setRows(built);
      setBusy(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      r.customer.full_name.toLowerCase().includes(s) ||
      (r.customer.phone ?? '').includes(s)
    );
  });

  return (
    <AdminLayout active="Customers">
      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-maroon-700" /> Customers
          </h1>
          <p className="text-stone-500 text-sm mt-1">Registered accounts and their saved addresses.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      {busy ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-maroon-700 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-500">
          <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          No registered customers yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">Addresses</th>
                  <th className="text-left px-4 py-3 font-semibold">Orders</th>
                  <th className="text-left px-4 py-3 font-semibold">Total spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((r) => (
                  <tr key={r.customer.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{r.customer.full_name}</div>
                      <div className="text-xs text-stone-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {r.email || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" /> {r.customer.phone || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-stone-700">{r.addressCount} saved</div>
                      {r.defaultAddress && (
                        <div className="text-xs text-stone-400 flex items-start gap-1 mt-0.5 max-w-[220px]">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">
                            {r.defaultAddress.door_no}, {r.defaultAddress.street_name}, {r.defaultAddress.city} — {r.defaultAddress.pincode}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-700">{r.orderCount}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">
                      ₹{r.totalSpent.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
