import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, MapPin, User, Package, Phone, Bookmark } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, generateOrderNumber } from '../lib/format';
import { supabase, SHIPPING_RATES, DELIVERY_LOCATIONS } from '../lib/supabase';
import { Link, useRouter } from '../lib/router';
import { adminOrderAlert, SAVED_CUSTOMER_KEY } from '../lib/whatsapp';
import type { CustomerAddress, OrderItem } from '../lib/types';

interface SavedCustomer {
  name: string;
  phone: string;
  phone2: string;
  whatsappNumber: string;
  whatsAppSameAsPhone1: boolean;
  doorNo: string;
  streetName: string;
  area: string;
  city: string;
  pincode: string;
  deliveryLocation: string;
}

const BLANK: SavedCustomer = {
  name: '',
  phone: '',
  phone2: '',
  whatsappNumber: '',
  whatsAppSameAsPhone1: true,
  doorNo: '',
  streetName: '',
  area: '',
  city: '',
  pincode: '',
  deliveryLocation: 'Tamil Nadu',
};

// ── Small reusable field ──────────────────────────────────────────────────────
function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-stone-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Input({
  value, onChange, placeholder, maxLength, readOnly, error, type = 'text',
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  readOnly?: boolean;
  error?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`w-full px-3 py-3 rounded-xl border text-sm focus:outline-none transition
        ${error ? 'border-red-400 bg-red-50 focus:border-red-500' : readOnly ? 'border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed' : 'border-stone-200 bg-white focus:border-maroon-500'}`}
    />
  );
}

// ── Summary card (used in both mobile and desktop) ────────────────────────────
function SummaryCard({
  items, total, shipping, shippingLabel, grand, waNumber,
}: {
  items: ReturnType<typeof useCart>['items'];
  total: number;
  shipping: number;
  shippingLabel: string;
  grand: number;
  waNumber: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-5">
      <h2 className="font-bold text-stone-900 text-base sm:text-lg mb-3">Order Summary</h2>
      <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3">
        {items.map((l) => (
          <div key={l.product.id} className="flex gap-3 items-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
              {l.product.image_url && (
                <img src={l.product.image_url} alt={l.product.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-stone-900 line-clamp-2 leading-tight">{l.product.name}</div>
              <div className="text-xs text-stone-500 mt-0.5">Qty {l.quantity} · {formatINR(l.product.price)}</div>
            </div>
            <div className="text-sm font-semibold text-stone-900 shrink-0">{formatINR(l.product.price * l.quantity)}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-100 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span><span>{formatINR(total)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Courier <span className="text-xs text-stone-400">({shippingLabel})</span></span>
          <span className="font-medium text-maroon-700">{formatINR(shipping)}</span>
        </div>
        <div className="flex justify-between font-bold text-maroon-900 text-base pt-2 border-t border-stone-100">
          <span>Total</span><span>{formatINR(grand)}</span>
        </div>
      </div>
      <div className="mt-3 bg-stone-50 rounded-xl p-2.5 text-xs text-stone-500">
        Our team will contact you at <strong className="text-stone-700">{waNumber || 'your WhatsApp'}</strong> for payment and dispatch updates.
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [step, setStep] = useState<'details' | 'processing'>('details');
  const [isReturning, setIsReturning] = useState(false);
  const [form, setForm] = useState<SavedCustomer>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const shippingInfo = SHIPPING_RATES[form.deliveryLocation] ?? SHIPPING_RATES['Other'];
  const shipping = shippingInfo.rate;
  const grand = total + shipping;
  const effectiveWhatsApp = form.whatsAppSameAsPhone1 ? form.phone : form.whatsappNumber;

  // Load saved addresses for signed-in customers; pre-fill from the default.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('customer_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      const list = (data as CustomerAddress[] | null) ?? [];
      setSavedAddresses(list);
      const def = list.find((a) => a.is_default) ?? list[0];
      if (def) {
        setSelectedAddressId(def.id);
        setForm((prev) => ({
          ...prev,
          name: def.full_name,
          phone: def.phone ?? '',
          doorNo: def.door_no,
          streetName: def.street_name,
          area: def.area ?? '',
          city: def.city,
          pincode: def.pincode,
          deliveryLocation: def.delivery_location,
        }));
        setIsReturning(true);
      }
    })();
  }, [user]);

  // For guests, fall back to localStorage-saved details.
  useEffect(() => {
    if (user) return;
    try {
      const raw = localStorage.getItem(SAVED_CUSTOMER_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedCustomer>;
        setForm((prev) => ({ ...prev, ...saved }));
        setIsReturning(true);
      }
    } catch {}
  }, [user]);

  const applyAddress = (a: CustomerAddress) => {
    setSelectedAddressId(a.id);
    setForm((prev) => ({
      ...prev,
      name: a.full_name,
      phone: a.phone ?? '',
      doorNo: a.door_no,
      streetName: a.street_name,
      area: a.area ?? '',
      city: a.city,
      pincode: a.pincode,
      deliveryLocation: a.delivery_location,
    }));
  };

  const clearSaved = () => {
    localStorage.removeItem(SAVED_CUSTOMER_KEY);
    setSelectedAddressId(null);
    setForm(BLANK);
    setIsReturning(false);
  };

  const set = <K extends keyof SavedCustomer>(key: K, val: SavedCustomer[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit number';
    if (form.phone2.trim() && !/^\d{10}$/.test(form.phone2.replace(/\D/g, ''))) {
      e.phone2 = 'Enter a valid 10-digit number or leave blank';
    }
    if (!form.whatsAppSameAsPhone1 && !/^\d{10}$/.test(form.whatsappNumber.replace(/\D/g, ''))) {
      e.whatsappNumber = 'Enter a valid 10-digit WhatsApp number';
    }
    if (!form.doorNo.trim()) e.doorNo = 'Door / Shop No. is required';
    if (!form.streetName.trim()) e.streetName = 'Street name is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      const el = document.querySelector('[data-error]');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setStep('processing');

    try {
      const fullAddress = [form.doorNo.trim(), form.streetName.trim(), form.area.trim()]
        .filter(Boolean)
        .join(', ');

      const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const orderNumber = generateOrderNumber(count ?? 0);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          phone2: form.phone2.trim() || null,
          whatsapp_number: effectiveWhatsApp.trim() || null,
          address: fullAddress,
          city: form.city.trim(),
          pincode: form.pincode.trim(),
          items_total: total,
          shipping,
          grand_total: grand,
          payment_method: 'Pending',
          payment_status: 'Pending',
          status: 'Pending',
          notes: null,
          utr_number: null,
          delivery_location: form.deliveryLocation,
        })
        .select()
        .single();

      if (error || !order) {
        setStep('details');
        alert('Could not place order. Please try again.');
        return;
      }

      const orderItems: OrderItem[] = items.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        product_name: l.product.name,
        price: l.product.price,
        quantity: l.quantity,
        line_total: l.product.price * l.quantity,
      }));

      await supabase.from('order_items').insert(orderItems);
      for (const l of items) {
        await supabase.rpc('decrement_stock', { p_id: l.product.id, qty: l.quantity }).then(() => {});
      }

      // Persist the used address back to the signed-in customer's saved list
      // so it's available next time. If they edited a saved address inline,
      // update that row; otherwise create a new one.
      if (user) {
        try {
          const match = savedAddresses.find((a) => a.id === selectedAddressId);
          const usedPayload = {
            label: match?.label ?? 'Last Order',
            full_name: form.name.trim(),
            phone: form.phone.trim(),
            door_no: form.doorNo.trim(),
            street_name: form.streetName.trim(),
            area: form.area.trim() || null,
            city: form.city.trim(),
            pincode: form.pincode.trim(),
            delivery_location: form.deliveryLocation,
          };
          const changed = match && (
            match.full_name !== usedPayload.full_name ||
            match.phone !== usedPayload.phone ||
            match.door_no !== usedPayload.door_no ||
            match.street_name !== usedPayload.street_name ||
            (match.area ?? '') !== (usedPayload.area ?? '') ||
            match.city !== usedPayload.city ||
            match.pincode !== usedPayload.pincode ||
            match.delivery_location !== usedPayload.delivery_location
          );
          if (match && changed) {
            await supabase.from('customer_addresses').update(usedPayload).eq('id', match.id);
          } else if (!match) {
            // First-time address for this customer — save it as default if they have none
            const willBeDefault = savedAddresses.length === 0;
            await supabase.from('customer_addresses').insert({ ...usedPayload, is_default: willBeDefault });
          }
        } catch {}
      } else {
        // Guest: persist to localStorage as before
        localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(form));
      }

      const whatsappUrl = adminOrderAlert(order as any, orderItems);
      setTimeout(() => window.open(whatsappUrl, '_blank'), 600);

      clear();
      navigate(`/success?order=${orderNumber}`);
    } catch {
      setStep('details');
      alert('Something went wrong. Please try again.');
    }
  };

  if (items.length === 0 && step !== 'processing') {
    return (
      <div className="bg-cream-50 min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center py-16 max-w-xs mx-auto">
          <h1 className="text-2xl font-bold text-stone-900">Nothing to checkout</h1>
          <p className="text-stone-500 mt-2">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="mt-5 text-maroon-700 font-semibold hover:underline">
            Go to shop
          </button>
        </div>
      </div>
    );
  }

  const summaryProps = {
    items, total, shipping, shippingLabel: shippingInfo.label, grand,
    waNumber: effectiveWhatsApp,
  };

  return (
    <div className="bg-cream-50 min-h-screen">
      {/* Header bar */}
      <div className="bg-maroon-800 text-white py-4 sm:py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate('/cart')}
            className="text-white/70 hover:text-white text-sm flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to cart
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Processing overlay */}
        {step === 'processing' && (
          <div className="bg-white rounded-2xl border border-stone-100 p-10 sm:p-16 text-center">
            <Loader2 className="w-12 h-12 text-maroon-700 animate-spin mx-auto mb-4" />
            <h2 className="font-bold text-stone-900 text-lg">Placing your order...</h2>
            <p className="text-stone-500 text-sm mt-1 max-w-xs mx-auto">
              Notifying admin via WhatsApp. Please don't close this window.
            </p>
          </div>
        )}

        {step === 'details' && (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* ── Summary: TOP on mobile, right column on desktop ── */}
            <div className="lg:col-span-1 lg:col-start-3 lg:row-start-1">
              <div className="lg:sticky lg:top-20">
                <SummaryCard {...summaryProps} />
              </div>
            </div>

            {/* ── Form: below summary on mobile, left 2-cols on desktop ── */}
            <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
              <form onSubmit={placeOrder} className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6 space-y-5 sm:space-y-6">

                {/* ── Saved address picker (signed-in only) ── */}
                {user && savedAddresses.length > 0 && (
                  <section className="bg-cream-50/60 border border-cream-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-maroon-700" /> Saved addresses
                      </h3>
                      <Link to="/account/profile" className="text-xs text-maroon-700 font-semibold hover:underline">
                        Manage
                      </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {savedAddresses.map((a) => {
                        const selected = selectedAddressId === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => applyAddress(a)}
                            className={`text-left p-3 rounded-lg border-2 transition active:scale-[0.98] ${
                              selected ? 'border-maroon-700 bg-white' : 'border-stone-200 bg-white hover:border-maroon-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-stone-900 text-sm">{a.label}</span>
                              {a.is_default && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-maroon-700 bg-maroon-100 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                              {selected && <Check className="w-4 h-4 text-maroon-700 ml-auto" />}
                            </div>
                            <div className="text-xs text-stone-600 mt-1 leading-snug">
                              {a.full_name} · {a.phone}
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">
                              {a.door_no}, {a.street_name}{a.area ? `, ${a.area}` : ''}, {a.city} — {a.pincode}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-stone-400 mt-2">
                      Selected address is pre-filled below — edit inline if needed.
                    </p>
                  </section>
                )}

                {/* ── Sign-in prompt for guests ── */}
                {!user && (
                  <section className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-sm text-blue-800">
                      <Bookmark className="w-4 h-4 inline -mt-0.5 mr-1" />
                      Sign in to use saved addresses for faster checkout.
                    </p>
                    <Link to="/account" className="text-sm font-semibold text-blue-700 hover:underline whitespace-nowrap">
                      Sign in
                    </Link>
                  </section>
                )}

                {/* ── Section: Personal details ── */}
                <section>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <h2 className="font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-maroon-700 shrink-0" /> Your details
                    </h2>
                    {isReturning && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 font-medium whitespace-nowrap">
                          Details pre-filled
                        </span>
                        <button
                          type="button"
                          onClick={clearSaved}
                          className="text-xs text-stone-400 hover:text-red-600 underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {isReturning && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 mb-3">
                      Welcome back! Your saved details are pre-filled. Edit if anything has changed.
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Name - full width */}
                    <Field label="Full name" required error={errors.name}>
                      {errors.name && <span data-error />}
                      <Input
                        value={form.name}
                        onChange={(v) => set('name', v)}
                        placeholder="e.g. Kavitha Ramesh"
                        error={!!errors.name}
                      />
                    </Field>

                    {/* Phone 1 + Phone 2 */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Phone Number 1" required error={errors.phone}>
                        {errors.phone && <span data-error />}
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))}
                            placeholder="Primary contact"
                            maxLength={10}
                            className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:outline-none transition
                              ${errors.phone ? 'border-red-400 bg-red-50' : 'border-stone-200 focus:border-maroon-500'}`}
                          />
                        </div>
                      </Field>

                      <Field label="Phone Number 2" error={errors.phone2}>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input
                            type="tel"
                            value={form.phone2}
                            onChange={(e) => set('phone2', e.target.value.replace(/\D/g, ''))}
                            placeholder="Alternative (optional)"
                            maxLength={10}
                            className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:outline-none transition
                              ${errors.phone2 ? 'border-red-400 bg-red-50' : 'border-stone-200 focus:border-maroon-500'}`}
                          />
                        </div>
                      </Field>
                    </div>

                    {/* WhatsApp number */}
                    <Field label="WhatsApp Number" required error={errors.whatsappNumber}>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.whatsAppSameAsPhone1}
                            onChange={(e) => set('whatsAppSameAsPhone1', e.target.checked)}
                            className="w-3.5 h-3.5 accent-maroon-700"
                          />
                          Same as Phone Number 1
                        </label>
                        {form.whatsAppSameAsPhone1 && form.phone && (
                          <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                            {form.phone}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <svg viewBox="0 0 24 24" className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-current ${form.whatsAppSameAsPhone1 ? 'text-stone-300' : 'text-green-500'}`}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <input
                          type="tel"
                          value={form.whatsAppSameAsPhone1 ? form.phone : form.whatsappNumber}
                          onChange={form.whatsAppSameAsPhone1 ? undefined : (e) => set('whatsappNumber', e.target.value.replace(/\D/g, ''))}
                          readOnly={form.whatsAppSameAsPhone1}
                          placeholder={form.whatsAppSameAsPhone1 ? 'Auto-filled from Phone 1' : 'WhatsApp number'}
                          maxLength={10}
                          className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:outline-none transition
                            ${errors.whatsappNumber ? 'border-red-400 bg-red-50' :
                              form.whatsAppSameAsPhone1 ? 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed' :
                              'border-green-300 focus:border-green-500 bg-white'}`}
                        />
                      </div>
                      {!errors.whatsappNumber && (
                        <p className="text-xs text-stone-400 mt-1">Order updates will be sent to this WhatsApp number</p>
                      )}
                    </Field>
                  </div>
                </section>

                <hr className="border-stone-100" />

                {/* ── Section: Delivery address ── */}
                <section>
                  <h3 className="font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2 mb-3 sm:mb-4">
                    <MapPin className="w-5 h-5 text-maroon-700 shrink-0" /> Delivery address
                  </h3>

                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Door No / Shop No" required error={errors.doorNo}>
                        {errors.doorNo && <span data-error />}
                        <Input
                          value={form.doorNo}
                          onChange={(v) => set('doorNo', v)}
                          placeholder="e.g. 12A or Shop 5"
                          error={!!errors.doorNo}
                        />
                      </Field>

                      <Field label="Street Name" required error={errors.streetName}>
                        {errors.streetName && <span data-error />}
                        <Input
                          value={form.streetName}
                          onChange={(v) => set('streetName', v)}
                          placeholder="e.g. Gandhi Road"
                          error={!!errors.streetName}
                        />
                      </Field>
                    </div>

                    <Field label="Area / Landmark">
                      <Input
                        value={form.area}
                        onChange={(v) => set('area', v)}
                        placeholder="e.g. Near Pillaiyar Kovil, Kanchipuram (optional)"
                      />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="City" required error={errors.city}>
                        {errors.city && <span data-error />}
                        <Input
                          value={form.city}
                          onChange={(v) => set('city', v)}
                          placeholder="e.g. Kanchipuram"
                          error={!!errors.city}
                        />
                      </Field>

                      <Field label="Pincode" required error={errors.pincode}>
                        {errors.pincode && <span data-error />}
                        <Input
                          value={form.pincode}
                          onChange={(v) => set('pincode', v.replace(/\D/g, ''))}
                          placeholder="6-digit pincode"
                          maxLength={6}
                          error={!!errors.pincode}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                <hr className="border-stone-100" />

                {/* ── Section: Delivery location ── */}
                <section>
                  <h3 className="font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-maroon-700 shrink-0" /> Courier charge
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DELIVERY_LOCATIONS.map((loc) => {
                      const info = SHIPPING_RATES[loc];
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => set('deliveryLocation', loc)}
                          className={`flex flex-col text-left p-3 rounded-xl border-2 transition active:scale-[0.98] ${
                            form.deliveryLocation === loc
                              ? 'border-maroon-700 bg-maroon-50'
                              : 'border-stone-200 bg-white hover:border-maroon-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-stone-900 text-sm">{info.label}</span>
                            {form.deliveryLocation === loc && (
                              <Check className="w-4 h-4 text-maroon-700 shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-maroon-700 font-bold mt-1">{formatINR(info.rate)}</span>
                          <span className="text-[11px] text-stone-500 mt-0.5 leading-tight">{info.note}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* ── Submit ── */}
                <div className="pt-1">
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600 shrink-0 mt-0.5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <p className="text-sm text-amber-800">
                      Payment will be collected separately. Our team will contact you at <strong>{effectiveWhatsApp || 'your WhatsApp'}</strong> after your order is placed.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 active:bg-maroon-950 text-white font-bold px-6 py-4 rounded-full transition text-base shadow-md"
                  >
                    <Check className="w-5 h-5" /> Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
