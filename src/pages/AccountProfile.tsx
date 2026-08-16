import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check,
  Loader2,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import {
  supabase,
  SHIPPING_RATES,
  DELIVERY_LOCATIONS,
} from '../lib/supabase';

import type { CustomerAddress } from '../lib/types';

type AddressForm = {
  label: string;
  full_name: string;
  phone: string;
  door_no: string;
  street_name: string;
  area: string;
  city: string;
  pincode: string;
  delivery_location: string;
};

const EMPTY_FORM: AddressForm = {
  label: 'Home',
  full_name: '',
  phone: '',
  door_no: '',
  street_name: '',
  area: '',
  city: '',
  pincode: '',
  delivery_location: 'Tamil Nadu',
};

export default function AccountProfile() {
  const { user, customer, signOut, loading } = useAuth();
  const { navigate } = useRouter();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD ADDRESSES
  // =========================

  const loadAddresses = async () => {
    if (!user) return;

    setBusy(true);

    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[ADDRESS] LOAD ERROR:', error);
    }

    setAddresses((data as CustomerAddress[] | null) ?? []);
    setBusy(false);
  };

  // =========================
  // AUTH / INITIAL LOAD
  // =========================

  useEffect(() => {
    if (!loading && !user) {
      navigate('/account');
      return;
    }

    if (user) {
      loadAddresses();
    }
  }, [user, loading]);

  // =========================
  // FORM HELPER
  // =========================

  const set = <K extends keyof AddressForm>(
    key: K,
    value: AddressForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // =========================
  // VALIDATION
  // =========================

  const validate = () => {
    const errorsFound: Record<string, string> = {};

    if (!form.full_name.trim()) {
      errorsFound.full_name = 'Recipient name is required';
    }

    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      errorsFound.phone = 'Enter a valid 10-digit number';
    }

    if (!form.door_no.trim()) {
      errorsFound.door_no = 'Door / Shop No. is required';
    }

    if (!form.street_name.trim()) {
      errorsFound.street_name = 'Street name is required';
    }

    if (!form.city.trim()) {
      errorsFound.city = 'City is required';
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      errorsFound.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(errorsFound);

    return Object.keys(errorsFound).length === 0;
  };

  // =========================
  // ADD ADDRESS
  // =========================

  const openAdd = () => {
    setEditing(null);

    setForm({
      ...EMPTY_FORM,
      full_name: customer?.full_name ?? '',
      phone: customer?.phone ?? '',
    });

    setErrors({});
    setShowForm(true);
  };

  // =========================
  // EDIT ADDRESS
  // =========================

  const openEdit = (address: CustomerAddress) => {
    setEditing(address);

    setForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone ?? '',
      door_no: address.door_no,
      street_name: address.street_name,
      area: address.area ?? '',
      city: address.city,
      pincode: address.pincode,
      delivery_location: address.delivery_location,
    });

    setErrors({});
    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setErrors({});
    setForm(EMPTY_FORM);
  };

  // =========================
  // SAVE ADDRESS
  // =========================

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!validate()) return;

    setSaving(true);

    try {
      const payload = {
        label: form.label.trim() || 'Home',
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        door_no: form.door_no.trim(),
        street_name: form.street_name.trim(),
        area: form.area.trim() || null,
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        delivery_location: form.delivery_location,
      };

      // =========================
      // UPDATE EXISTING ADDRESS
      // =========================

      if (editing) {
        const { error } = await supabase
          .from('customer_addresses')
          .update(payload)
          .eq('id', editing.id)
          .eq('customer_id', user.id);

        if (error) {
          console.error('[ADDRESS] UPDATE ERROR:', error);
          alert(`Failed to update address: ${error.message}`);
          return;
        }
      }

      // =========================
      // INSERT NEW ADDRESS
      // =========================

      else {
        const willBeDefault = addresses.length === 0;

        const { error } = await supabase
          .from('customer_addresses')
          .insert({
            ...payload,
            customer_id: user.id,
            is_default: willBeDefault,
          });

        if (error) {
          console.error('[ADDRESS] INSERT ERROR:', error);
          alert(`Failed to save address: ${error.message}`);
          return;
        }
      }

      closeForm();
      await loadAddresses();

    } catch (error) {
      console.error('[ADDRESS] SAVE ERROR:', error);
      alert('Something went wrong while saving the address.');

    } finally {
      setSaving(false);
    }
  };

  // =========================
  // SET DEFAULT ADDRESS
  // =========================

  const setDefault = async (address: CustomerAddress) => {
    if (!user) return;

    const { error: resetError } = await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', user.id);

    if (resetError) {
      console.error('[ADDRESS] RESET DEFAULT ERROR:', resetError);
      alert(`Failed to change default address: ${resetError.message}`);
      return;
    }

    const { error: setError } = await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', address.id)
      .eq('customer_id', user.id);

    if (setError) {
      console.error('[ADDRESS] SET DEFAULT ERROR:', setError);
      alert(`Failed to set default address: ${setError.message}`);
      return;
    }

    await loadAddresses();
  };

  // =========================
  // DELETE ADDRESS
  // =========================

  const remove = async (address: CustomerAddress) => {
    if (!user) return;

    if (!confirm(`Delete "${address.label}" address?`)) {
      return;
    }

    const wasDefault = address.is_default;

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', address.id)
      .eq('customer_id', user.id);

    if (error) {
      console.error('[ADDRESS] DELETE ERROR:', error);
      alert(`Failed to delete address: ${error.message}`);
      return;
    }

    await loadAddresses();

    // If default address was deleted,
    // make the oldest remaining address default.
    if (wasDefault) {
      const { data, error: findError } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error(
          '[ADDRESS] FIND NEW DEFAULT ERROR:',
          findError
        );
        return;
      }

      if (data) {
        const { error: defaultError } = await supabase
          .from('customer_addresses')
          .update({ is_default: true })
          .eq('id', data.id)
          .eq('customer_id', user.id);

        if (defaultError) {
          console.error(
            '[ADDRESS] NEW DEFAULT ERROR:',
            defaultError
          );
          return;
        }

        await loadAddresses();
      }
    }
  };

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <div className="bg-cream-50 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-maroon-700 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="bg-cream-50 min-h-screen pb-16">

      {/* Header */}
      <div className="bg-maroon-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <Link
            to="/"
            className="text-white/70 hover:text-white text-sm flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold">
            My Account
          </h1>

          <p className="text-white/70 text-sm mt-1">
            {user.email}
          </p>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* =========================
            PROFILE
        ========================= */}

        <section className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">

          <div className="flex items-start justify-between gap-3 flex-wrap">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-full bg-maroon-50 text-maroon-700 flex items-center justify-center">
                <UserIcon className="w-6 h-6" />
              </div>

              <div>
                <div className="font-bold text-stone-900">
                  {customer?.full_name ?? 'Customer'}
                </div>

                <div className="text-sm text-stone-500">
                  {customer?.phone ?? ''}
                </div>
              </div>

            </div>

            <button
              onClick={() => {
                signOut().then(() => navigate('/'));
              }}
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-600 border border-stone-200 hover:border-red-200 rounded-full px-3 py-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>

          </div>

        </section>

        {/* =========================
            ADDRESSES
        ========================= */}

        <section className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">

          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">

            <h2 className="font-bold text-stone-900 text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-maroon-700" />
              Saved Addresses
            </h2>

            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 text-white text-sm font-semibold px-3 py-2 rounded-full transition"
            >
              <Plus className="w-4 h-4" />
              Add new
            </button>

          </div>

          {/* Loading */}
          {busy ? (

            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 text-maroon-700 animate-spin" />
            </div>

          ) : addresses.length === 0 ? (

            /* No addresses */
            <div className="text-center py-10 px-4">

              <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-2" />

              <p className="text-stone-500 text-sm">
                No saved addresses yet.
              </p>

              <button
                onClick={openAdd}
                className="mt-3 text-maroon-700 font-semibold text-sm hover:underline"
              >
                Add your first address
              </button>

            </div>

          ) : (

            /* Address cards */
            <div className="grid sm:grid-cols-2 gap-3">

              {addresses.map((address) => (

                <div
                  key={address.id}
                  className={`rounded-xl border-2 p-4 transition ${
                    address.is_default
                      ? 'border-maroon-700 bg-maroon-50'
                      : 'border-stone-200 bg-white'
                  }`}
                >

                  <div className="flex items-start justify-between gap-2 mb-2">

                    <div className="flex items-center gap-2 flex-wrap">

                      <span className="font-semibold text-stone-900 text-sm">
                        {address.label}
                      </span>

                      {address.is_default && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-maroon-700 bg-maroon-100 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}

                    </div>

                    <div className="flex items-center gap-1">

                      <button
                        onClick={() => openEdit(address)}
                        className="p-1.5 text-stone-400 hover:text-maroon-700 rounded-md hover:bg-maroon-50"
                        aria-label="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => remove(address)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>

                  <div className="text-sm text-stone-700 font-medium">
                    {address.full_name}
                  </div>

                  <div className="text-sm text-stone-500 mt-0.5">
                    {address.phone}
                  </div>

                  <div className="text-sm text-stone-600 mt-1.5 leading-snug">
                    {address.door_no}, {address.street_name}
                    {address.area ? `, ${address.area}` : ''}
                    , {address.city} — {address.pincode}
                  </div>

                  <div className="text-xs text-stone-400 mt-1">
                    {SHIPPING_RATES[address.delivery_location]?.label ??
                      address.delivery_location}
                  </div>

                  {!address.is_default && (
                    <button
                      onClick={() => setDefault(address)}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-maroon-700 font-semibold hover:underline"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Set as default
                    </button>
                  )}

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

      {/* =========================
          ADDRESS MODAL
      ========================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeForm}
          />

          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-stone-100 px-5 py-4 flex items-center justify-between">

              <h3 className="font-bold text-stone-900 text-lg">
                {editing ? 'Edit address' : 'Add new address'}
              </h3>

              <button
                onClick={closeForm}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={save}
              className="p-5 space-y-3"
            >

              {/* Label + Name */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Label
                  </label>

                  <input
                    value={form.label}
                    onChange={(e) =>
                      set('label', e.target.value)
                    }
                    placeholder="Home, Office…"
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700">
                    Recipient name *
                  </label>

                  <input
                    value={form.full_name}
                    onChange={(e) =>
                      set('full_name', e.target.value)
                    }
                    className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                      errors.full_name
                        ? 'border-red-400 bg-red-50'
                        : 'border-stone-200 focus:border-maroon-500'
                    }`}
                  />

                  {errors.full_name && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.full_name}
                    </p>
                  )}
                </div>

              </div>

              {/* Phone */}
              <div>

                <label className="text-sm font-medium text-stone-700">
                  Phone *
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    set(
                      'phone',
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  maxLength={10}
                  className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                    errors.phone
                      ? 'border-red-400 bg-red-50'
                      : 'border-stone-200 focus:border-maroon-500'
                  }`}
                />

                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.phone}
                  </p>
                )}

              </div>

              {/* Door + Street */}
              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="text-sm font-medium text-stone-700">
                    Door / Shop No. *
                  </label>

                  <input
                    value={form.door_no}
                    onChange={(e) =>
                      set('door_no', e.target.value)
                    }
                    className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                      errors.door_no
                        ? 'border-red-400 bg-red-50'
                        : 'border-stone-200 focus:border-maroon-500'
                    }`}
                  />

                  {errors.door_no && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.door_no}
                    </p>
                  )}

                </div>

                <div>

                  <label className="text-sm font-medium text-stone-700">
                    Street *
                  </label>

                  <input
                    value={form.street_name}
                    onChange={(e) =>
                      set('street_name', e.target.value)
                    }
                    className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                      errors.street_name
                        ? 'border-red-400 bg-red-50'
                        : 'border-stone-200 focus:border-maroon-500'
                    }`}
                  />

                  {errors.street_name && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.street_name}
                    </p>
                  )}

                </div>

              </div>

              {/* Area */}
              <div>

                <label className="text-sm font-medium text-stone-700">
                  Area / Landmark
                </label>

                <input
                  value={form.area}
                  onChange={(e) =>
                    set('area', e.target.value)
                  }
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm"
                />

              </div>

              {/* City + Pincode */}
              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="text-sm font-medium text-stone-700">
                    City *
                  </label>

                  <input
                    value={form.city}
                    onChange={(e) =>
                      set('city', e.target.value)
                    }
                    className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                      errors.city
                        ? 'border-red-400 bg-red-50'
                        : 'border-stone-200 focus:border-maroon-500'
                    }`}
                  />

                  {errors.city && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.city}
                    </p>
                  )}

                </div>

                <div>

                  <label className="text-sm font-medium text-stone-700">
                    Pincode *
                  </label>

                  <input
                    value={form.pincode}
                    onChange={(e) =>
                      set(
                        'pincode',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    maxLength={6}
                    className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                      errors.pincode
                        ? 'border-red-400 bg-red-50'
                        : 'border-stone-200 focus:border-maroon-500'
                    }`}
                  />

                  {errors.pincode && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.pincode}
                    </p>
                  )}

                </div>

              </div>

              {/* Delivery location */}
              <div>

                <label className="text-sm font-medium text-stone-700">
                  Delivery location
                </label>

                <div className="grid grid-cols-3 gap-2 mt-1">

                  {DELIVERY_LOCATIONS.map((location) => (

                    <button
                      key={location}
                      type="button"
                      onClick={() =>
                        set('delivery_location', location)
                      }
                      className={`p-2 rounded-lg border-2 text-left transition ${
                        form.delivery_location === location
                          ? 'border-maroon-700 bg-maroon-50'
                          : 'border-stone-200 hover:border-maroon-300'
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <span className="text-xs font-semibold text-stone-900">
                          {SHIPPING_RATES[location].label}
                        </span>

                        {form.delivery_location === location && (
                          <Check className="w-3.5 h-3.5 text-maroon-700" />
                        )}

                      </div>

                    </button>

                  ))}

                </div>

              </div>

              {/* Buttons */}
              <div className="pt-2 flex gap-2">

                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-stone-200 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition"
                >

                  {saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}

                  {editing
                    ? 'Save changes'
                    : 'Save address'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}