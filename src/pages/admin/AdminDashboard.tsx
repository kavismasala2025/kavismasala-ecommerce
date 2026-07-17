import { useEffect, useState } from 'react';
import {
  ShoppingCart, IndianRupee, Clock, CheckCircle2, Package, AlertTriangle,
  ArrowUpRight, TrendingUp, Download, Lightbulb, BarChart3, Calendar,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/format';
import AdminLayout from './AdminLayout';
import { Link } from '../../lib/router';
import type { Order, Product } from '../../lib/types';

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  total_qty: number;
  total_revenue: number;
}

const SUGGESTIONS = [
  { icon: '🌶️', title: 'Expand Podi range', desc: 'Customers love Idli Podi — consider adding Tomato Podi or Coriander Podi as seasonal variants.' },
  { icon: '🥭', title: 'More pickle flavours', desc: 'Mango Pickle sells well. Add Lemon Pickle and Mixed Veg Pickle to grow the Pickles category.' },
  { icon: '🌾', title: 'Gift combo packs', desc: 'Bundle Idli Podi + Andhra Kaara Paruppu Podi as a "Podi Combo" at a slight discount to boost AOV.' },
  { icon: '📦', title: 'Trial / Mini packs', desc: 'Offer 50g trial packs at ₹80–90 to reduce first-purchase hesitation and acquire new customers.' },
  { icon: '📱', title: 'WhatsApp ordering', desc: 'Add a WhatsApp button for bulk orders — many customers in Tamil Nadu prefer ordering via WhatsApp.' },
  { icon: '🎁', title: 'Festival bundles', desc: 'Create Diwali / Pongal gift hampers with 4–5 products in branded packaging for seasonal revenue spikes.' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, pending: 0,
    completed: 0, totalProducts: 0, lowStock: 0,
  });
  const [recent, setRecent] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    (async () => {
      const [{ data: orders }, { data: products }, { data: orderItems }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('order_items').select('*'),
      ]);

      const allOrders = orders ?? [];
      const allProducts = products ?? [];
      const allItems = orderItems ?? [];

      const revenue = allOrders.filter((o) => o.payment_status === 'Paid').reduce((s, o) => s + Number(o.grand_total), 0);
      const pending = allOrders.filter((o) => ['Pending','Confirmed','Preparing'].includes(o.status)).length;
      const completed = allOrders.filter((o) => o.status === 'Delivered').length;
      const low = allProducts.filter((p) => p.stock <= 10);

      setStats({ totalOrders: allOrders.length, totalRevenue: revenue, pending, completed, totalProducts: allProducts.length, lowStock: low.length });
      setRecent(allOrders.slice(0, 5));
      setLowStockItems(low);

      // Monthly revenue for selected year
      const monthMap: Record<number, MonthlyData> = {};
      for (let m = 0; m < 12; m++) {
        monthMap[m] = { month: MONTHS[m], revenue: 0, orders: 0 };
      }
      allOrders.forEach((o) => {
        const d = new Date(o.created_at);
        if (d.getFullYear() === selectedYear && o.payment_status === 'Paid') {
          const m = d.getMonth();
          monthMap[m].revenue += Number(o.grand_total);
          monthMap[m].orders += 1;
        }
      });
      setMonthly(Object.values(monthMap));

      // Top selling products
      const productTotals: Record<string, { name: string; qty: number; rev: number }> = {};
      allItems.forEach((it) => {
        const key = it.product_name;
        if (!productTotals[key]) productTotals[key] = { name: it.product_name, qty: 0, rev: 0 };
        productTotals[key].qty += it.quantity;
        productTotals[key].rev += Number(it.line_total);
      });
      const top = Object.values(productTotals)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)
        .map((t) => ({ name: t.name, total_qty: t.qty, total_revenue: t.rev }));
      setTopProducts(top);

      setLoading(false);
    })();
  }, [selectedYear]);

  const exportCSV = async () => {
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: items } = await supabase.from('order_items').select('*');
    if (!orders) return;

    const itemMap: Record<string, string[]> = {};
    (items ?? []).forEach((it) => {
      if (!itemMap[it.order_id]) itemMap[it.order_id] = [];
      itemMap[it.order_id].push(`${it.product_name} x${it.quantity}`);
    });

    const rows = [
      ['Order ID','Customer','Phone','Address','City','Pincode','Items','Total','Payment','Status','Date'],
      ...orders.map((o) => [
        o.order_number, o.customer_name, o.phone, o.address,
        o.city ?? '', o.pincode ?? '',
        (itemMap[o.id] ?? []).join(' | '),
        o.grand_total, o.payment_status, o.status,
        new Date(o.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kavis-masala-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxRev = Math.max(...monthly.map((m) => m.revenue), 1);
  const years = [selectedYear - 1, selectedYear];
  if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear());
  const yearOptions = [...new Set(years)].sort();

  if (loading) {
    return <AdminLayout active="Dashboard"><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="h-28 bg-white rounded-2xl animate-pulse"/>)}</div></AdminLayout>;
  }

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-500', sub: 'All time' },
    { label: 'Total Revenue', value: formatINR(stats.totalRevenue), icon: IndianRupee, color: 'bg-green-600', sub: 'Paid orders' },
    { label: 'Active Orders', value: stats.pending, icon: Clock, color: 'bg-amber-500', sub: 'Pending/Preparing' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-600', sub: 'Delivered' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'bg-maroon-700', sub: 'In catalog' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? 'bg-red-600' : 'bg-stone-400', sub: '≤10 units left' },
  ];

  return (
    <AdminLayout active="Dashboard">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm">Store overview & business insights</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <Download className="w-4 h-4" /> Export to CSV
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-stone-100">
              <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-stone-900">{c.value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{c.label}</div>
              <div className="text-[10px] text-stone-400">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-maroon-700" />
            <h2 className="font-bold text-stone-900">Monthly Revenue</h2>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:border-maroon-400"
            >
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {monthly.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '100px' }}>
                <div
                  className="w-full bg-maroon-700 hover:bg-maroon-800 rounded-t transition cursor-default group relative"
                  style={{ height: `${Math.max((m.revenue / maxRev) * 100, m.revenue > 0 ? 4 : 0)}%`, minHeight: m.revenue > 0 ? '4px' : '0' }}
                  title={`${m.month}: ${formatINR(m.revenue)} (${m.orders} orders)`}
                >
                  {m.revenue > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10">
                      {formatINR(m.revenue)}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-stone-500 font-medium">{m.month}</div>
              <div className="text-[10px] text-stone-400">{m.orders > 0 ? `${m.orders}` : ''}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-stone-400 text-center">
          Hover bars to see revenue · Numbers below bar = order count
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-maroon-700 text-sm font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-stone-500 text-sm py-8 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((o) => (
                <Link key={o.id} to="/admin/orders" className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition">
                  <div>
                    <div className="font-semibold text-stone-900 text-sm">{o.order_number}</div>
                    <div className="text-xs text-stone-500">{o.customer_name} · {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-stone-900 text-sm">{formatINR(o.grand_total)}</div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-maroon-700" />
            <h2 className="font-bold text-stone-900">Top Selling Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-stone-500 text-sm py-8 text-center">No order data yet. Products will appear here after first sale.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-maroon-100 text-maroon-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-900 text-sm truncate">{p.name}</div>
                    <div className="text-xs text-stone-500">{p.total_qty} units sold</div>
                  </div>
                  <div className="text-sm font-bold text-maroon-800">{formatINR(p.total_revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-stone-900">Low Stock Alerts</h2>
            </div>
            <Link to="/admin/products" className="text-maroon-700 text-sm font-semibold flex items-center gap-1 hover:underline">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {lowStockItems.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-stone-900 text-sm truncate">{p.name}</div>
                  <div className="text-xs text-stone-500">{p.category}</div>
                </div>
                <span className="text-sm font-bold text-red-600 shrink-0">{p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Suggestions */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-stone-900">Growth Suggestions</h2>
          <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">AI Insights</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUGGESTIONS.map((s) => (
            <div key={s.title} className="p-4 rounded-xl bg-cream-50 border border-cream-200 hover:border-maroon-200 transition">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-semibold text-stone-900 text-sm mb-1">{s.title}</div>
              <div className="text-xs text-stone-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
          <strong>Google Sheets Tip:</strong> Click <em>Export to CSV</em> above → open in Google Sheets → share with your team. Schedule a weekly export every Monday to maintain a running order log accessible from any device.
        </div>
      </div>
    </AdminLayout>
  );
}

function statusColor(s: string) {
  switch (s) {
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Confirmed': return 'bg-blue-100 text-blue-700';
    case 'Preparing': return 'bg-purple-100 text-purple-700';
    case 'Shipped': return 'bg-indigo-100 text-indigo-700';
    case 'Delivered': return 'bg-green-100 text-green-700';
    default: return 'bg-stone-100 text-stone-700';
  }
}
