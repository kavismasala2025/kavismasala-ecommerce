import { Settings, Save, Store, Phone, Mail, CreditCard } from 'lucide-react';
import { BRAND } from '../../lib/supabase';
import AdminLayout from './AdminLayout';

export default function AdminSettings() {
  return (
    <AdminLayout active="Settings">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-maroon-700" /> Settings
        </h1>
        <p className="text-stone-500 text-sm mt-1">Store configuration and contact details.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card icon={Store} title="Store identity">
          <Row label="Store name" value={BRAND.name} />
          <Row label="Tagline" value={BRAND.tagline} />
        </Card>

        <Card icon={Phone} title="Contact">
          <Row label="Primary phone" value={BRAND.phone} />
          <Row label="Secondary phone" value={BRAND.phone2} />
          <Row label="Email" value={BRAND.email} />
        </Card>

        <Card icon={CreditCard} title="Payment">
          <Row label="UPI ID" value={BRAND.upiId} />
          <Row label="UPI name" value={BRAND.upiName} />
        </Card>

        <Card icon={Mail} title="Social">
          <Row label="Instagram" value={`@${BRAND.instagramHandle}`} />
          <Row label="URL" value={BRAND.instagram} />
        </Card>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Settings className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Settings are read-only in this view.</p>
          <p className="mt-0.5">To update store details, shipping rates, or admin credentials, edit the constants in <code className="bg-amber-100 px-1 rounded text-xs">src/lib/supabase.ts</code> and redeploy.</p>
        </div>
      </div>

      <button
        disabled
        className="mt-4 inline-flex items-center gap-2 bg-maroon-800 text-white font-semibold px-5 py-2.5 rounded-full opacity-50 cursor-not-allowed"
      >
        <Save className="w-4 h-4" /> Save changes
      </button>
    </AdminLayout>
  );
}

function Card({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <h2 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-maroon-700" /> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm border-b border-stone-50 last:border-0 pb-2 last:pb-0">
      <span className="text-stone-400">{label}</span>
      <span className="text-stone-900 font-medium text-right">{value}</span>
    </div>
  );
}
