import { useEffect, useState } from 'react';
import { BarChart3, Loader2, TrendingUp, IndianRupee, ShoppingCart, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/format';
import AdminLayout from './AdminLayout';
import type { Order } from '../../lib/types';

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: true });
      setOrders((data as Order[] | null) ?? []);
      setBusy(false);
    })();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.grand_total, 0);
  const avgOrder = orders.length ? totalRevenue / orders.length : 0;

  // Group by day for last 14 days
  const byDay = new Map<string, { revenue: number; count: number }>();
  orders.forEach((o) => {
    const d = new Date(o.created_at).toISOString().slice(0, 10);
    const cur = byDay.get(d) ?? { revenue: 0, count: 0 };
    cur.revenue += o.grand_total;
    cur.count += 1;
    byDay.set(d, cur);
  });
  const days = Array.from(byDay.entries()).slice(-14);
  const maxRev = Math.max(1, ...days.map((d) => d[1].revenue));

  // Top cities
  const cityMap = new Map<string, number>();
  orders.forEach((o) => {
    const c = o.city || 'Unknown';
    cityMap.set(c, (cityMap.get(c) ?? 0) + 1);
  });
  const topCities = Array.from(cityMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AdminLayout active="Analytics">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-maroon-700" /> Analytics
        </h1>
        <p className="text-stone-500 text-sm mt-1">Sales performance and order trends.</p>
      </div>

      {busy ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-maroon-700 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat icon={IndianRupee} label="Total revenue" value={formatINR(totalRevenue)} />
            <Stat icon={ShoppingCart} label="Total orders" value={String(orders.length)} />
            <Stat icon={TrendingUp} label="Avg. order value" value={formatINR(avgOrder)} />
            <Stat icon={Users} label="Unique customers" value={String(new Set(orders.map((o) => o.phone)).size)} />
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-bold text-stone-900 mb-4">Revenue — last 14 days</h2>
            {days.length === 0 ? (
              <p className="text-sm text-stone-400 py-10 text-center">No orders in this period.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-48">
                {days.map(([day, val]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition">
                      {formatINR(val.revenue)}
                    </div>
                    <div
                      className="w-full bg-maroon-700 hover:bg-maroon-900 rounded-t transition-all"
                      style={{ height: `${(val.revenue / maxRev) * 100}%`, minHeight: '4px' }}
                      title={`${day}: ${formatINR(val.revenue)} (${val.count} orders)`}
                    />
                    <div className="text-[9px] text-stone-400 -rotate-45 origin-top whitespace-nowrap">
                      {day.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h2 className="font-bold text-stone-900 mb-4">Top cities by orders</h2>
            {topCities.length === 0 ? (
              <p className="text-sm text-stone-400">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {topCities.map(([city, count], i) => {
                  const pct = (count / topCities[0][1]) * 100;
                  return (
                    <div key={city} className="flex items-center gap-3">
                      <div className="w-6 text-stone-400 text-sm font-semibold">{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-stone-700 font-medium">{city}</span>
                          <span className="text-stone-500">{count} orders</span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-maroon-700 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4">
      <div className="flex items-center gap-2 text-stone-400 text-xs">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-lg font-bold text-stone-900 mt-1">{value}</div>
    </div>
  );
}
