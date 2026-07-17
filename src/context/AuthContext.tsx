import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Customer } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  customer: Customer | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCustomer = async (uid: string) => {
    const { data } = await supabase
      .from('customers')
      .select('id, full_name, phone, created_at')
      .eq('id', uid)
      .maybeSingle();
    setCustomer((data as Customer | null) ?? null);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadCustomer(data.session.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadCustomer(newSession.user.id);
        } else {
          setCustomer(null);
        }
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) return { error: error.message };

    // Create the customer row. If the session is immediately available
    // (email confirmation off), this inserts as the new user. If not, the
    // row will be created on first sign-in instead — see signIn below.
    if (data.user) {
      await supabase.from('customers').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone || null,
      }, { onConflict: 'id' });
    }
    return { error: null };
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Ensure customer row exists (covers users who signed up but the
    // insert didn't take, or who were created before this feature).
    if (data.user) {
      const meta = data.user.user_metadata ?? {};
      await supabase.from('customers').upsert({
        id: data.user.id,
        full_name: (meta.full_name as string) || data.user.email || 'Customer',
        phone: (meta.phone as string) || null,
      }, { onConflict: 'id' });
      await loadCustomer(data.user.id);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, customer, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
