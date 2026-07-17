import { useState } from 'react';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Link, useRouter } from '../../lib/router';
import { BRAND } from '../../lib/supabase';

export default function AdminLogin() {
  const { login } = useAdmin();
  const { navigate } = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-cream-50">
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
            <h1 className="text-xl font-bold">{BRAND.name} Admin</h1>
            <p className="text-white/70 text-sm mt-1">Sign in to manage your store</p>
          </div>
          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700">Username</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none"
                  placeholder="admin"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-2.5">{error}</div>}
            <button
              type="submit"
              className="w-full bg-maroon-800 hover:bg-maroon-900 text-white font-semibold py-3 rounded-lg transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
