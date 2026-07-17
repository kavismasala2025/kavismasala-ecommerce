import { useState } from 'react';
import { ArrowLeft, Lock, Mail, Phone, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import { BRAND } from '../lib/supabase';

export default function Account() {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name'); return; }
        if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) { setError('Enter a valid 10-digit phone'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
        const { error: err } = await signUp(email.trim(), password, name.trim(), phone.trim());
        if (err) { setError(err); return; }
        navigate('/account/profile');
      } else {
        const { error: err } = await signIn(email.trim(), password);
        if (err) { setError(err); return; }
        navigate('/account/profile');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-cream-50 min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="text-stone-500 hover:text-maroon-700 text-sm flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="bg-maroon-800 text-white p-6 text-center">
            <img
              src={BRAND.logo}
              alt="Logo"
              className="h-16 w-16 rounded-full object-cover border-2 border-cream-300 shadow-lg mx-auto mb-3"
            />
            <h1 className="text-xl font-bold">{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
            <p className="text-white/70 text-sm mt-1">
              {mode === 'signin' ? 'Sign in to use your saved addresses' : 'Save your details for faster checkout'}
            </p>
          </div>

          <form onSubmit={submit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-stone-700">Full name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none"
                    placeholder="e.g. Kavitha Ramesh"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-stone-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-stone-700">Phone</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-stone-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-2.5">{error}</div>}

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>

            <p className="text-sm text-stone-500 text-center">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                className="text-maroon-700 font-semibold hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
