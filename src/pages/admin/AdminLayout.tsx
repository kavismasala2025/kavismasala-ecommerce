import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X, Store,
  Tags, Users, Boxes, Ticket, BarChart3, Settings,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Link, useRouter } from '../../lib/router';
import { BRAND } from '../../lib/supabase';

const NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: Tags },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
  { label: 'Coupons', to: '/admin/coupons', icon: Ticket },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ active, children }: { active: string; children: ReactNode }) {
  const { logout } = useAdmin();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-maroon-900 text-white/80 flex flex-col transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-white/10 flex items-center gap-2.5">
          <img
            src={BRAND.logo}
            alt="Logo"
            className="h-9 w-9 rounded-full object-cover border border-cream-300"
          />
          <div>
            <div className="font-bold text-white text-sm">{BRAND.name}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">Admin Panel</div>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-white/60">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.label;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-cream-300 text-maroon-900' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white">
            <Store className="w-4 h-4" /> View store
          </Link>
          <button onClick={doLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-red-900/40 hover:text-red-300">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden bg-maroon-800 border-b border-white/10 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="text-white"><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-white">{BRAND.name} Admin</span>
          <button onClick={doLogout} className="text-white/70"><LogOut className="w-5 h-5" /></button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
