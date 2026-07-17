import { Ticket, Plus, Info } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function AdminCoupons() {
  return (
    <AdminLayout active="Coupons">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-maroon-700" /> Coupons
        </h1>
        <p className="text-stone-500 text-sm mt-1">Discount codes for checkout and promotions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-maroon-50 text-maroon-700 flex items-center justify-center mx-auto mb-3">
          <Ticket className="w-7 h-7" />
        </div>
        <h2 className="font-bold text-stone-900 text-lg">No coupons yet</h2>
        <p className="text-stone-500 text-sm mt-1 max-w-sm mx-auto">
          Create discount codes for festive sales, bulk orders, or first-time customers.
          Coupons will apply automatically at checkout once configured.
        </p>
        <button
          disabled
          className="mt-5 inline-flex items-center gap-1.5 bg-maroon-800 text-white text-sm font-semibold px-4 py-2 rounded-full opacity-50 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Create coupon
        </button>
        <p className="text-xs text-stone-400 mt-3 flex items-center justify-center gap-1">
          <Info className="w-3.5 h-3.5" /> Coupon creation is coming soon.
        </p>
      </div>
    </AdminLayout>
  );
}
