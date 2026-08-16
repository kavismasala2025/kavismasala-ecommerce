import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Customer } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  customer: Customer | null;
  loading: boolean;

  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ error: string | null }>;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // LOAD CUSTOMER
  // --------------------------------------------------

  const loadCustomer = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, created_at')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        console.error('[AUTH] LOAD CUSTOMER ERROR:', error);
        setCustomer(null);
        return;
      }

      setCustomer((data as Customer | null) ?? null);
    } catch (error) {
      console.error('[AUTH] LOAD CUSTOMER UNEXPECTED ERROR:', error);
      setCustomer(null);
    }
  };

  // --------------------------------------------------
  // INITIAL SESSION
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Checking existing Supabase session...');

        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('[AUTH] GET SESSION ERROR:', error);
        }

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        console.log(
          '[AUTH] INITIAL USER:',
          currentSession?.user ?? null
        );

        console.log(
          '[AUTH] INITIAL SESSION:',
          currentSession ?? null
        );

        if (currentSession?.user) {
          await loadCustomer(currentSession.user.id);
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('[AUTH] INITIALIZATION ERROR:', error);

        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // --------------------------------------------------
    // AUTH STATE LISTENER
    // --------------------------------------------------

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[AUTH] STATE CHANGE:', event);
        console.log('[AUTH] NEW SESSION:', newSession);
        console.log('[AUTH] NEW USER:', newSession?.user ?? null);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          loadCustomer(newSession.user.id);
        } else {
          setCustomer(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------

  const signUp: AuthContextValue['signUp'] = async (
    email,
    password,
    fullName,
    phone
  ) => {
    console.log('[SIGNUP] Starting signup...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    console.log('[SIGNUP] USER:', data?.user);
    console.log('[SIGNUP] SESSION:', data?.session);
    console.log('[SIGNUP] ERROR:', error);

    if (error) {
      console.error('[SIGNUP] FAILED:', error.message);
      return {
        error: error.message,
      };
    }

    if (data.user) {
      const { error: customerError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            full_name: fullName,
            phone: phone || null,
          },
          {
            onConflict: 'id',
          }
        );

      if (customerError) {
        console.error(
          '[SIGNUP] CUSTOMER INSERT ERROR:',
          customerError
        );
      }
    }

    return {
      error: null,
    };
  };

  // --------------------------------------------------
  // SIGN IN
  // --------------------------------------------------

  const signIn: AuthContextValue['signIn'] = async (
    email,
    password
  ) => {
    console.log('[LOGIN] Attempting login...');
    console.log('[LOGIN] Email:', email);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    console.log('[LOGIN] USER:', data?.user);
    console.log('[LOGIN] SESSION:', data?.session);
    console.log('[LOGIN] ERROR:', error);

    if (error) {
      console.error(
        '[LOGIN] FAILED:',
        error.message
      );

      return {
        error: error.message,
      };
    }

    if (!data.user || !data.session) {
      console.error(
        '[LOGIN] No user/session returned'
      );

      return {
        error:
          'Login succeeded but no Supabase session was created.',
      };
    }

    console.log(
      '[LOGIN] SUCCESS - User ID:',
      data.user.id
    );

    // --------------------------------------------------
    // ENSURE CUSTOMER ROW EXISTS
    // --------------------------------------------------

    const meta = data.user.user_metadata ?? {};

    const { error: customerError } =
      await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            full_name:
              (meta.full_name as string) ||
              data.user.email ||
              'Customer',
            phone:
              (meta.phone as string) || null,
          },
          {
            onConflict: 'id',
          }
        );

    if (customerError) {
      console.error(
        '[LOGIN] CUSTOMER UPSERT ERROR:',
        customerError
      );
    }

    await loadCustomer(data.user.id);

    return {
      error: null,
    };
  };

  // --------------------------------------------------
  // SIGN OUT
  // --------------------------------------------------

  const signOut = async () => {
    console.log('[AUTH] Signing out...');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(
        '[AUTH] SIGNOUT ERROR:',
        error
      );
    }

    setUser(null);
    setSession(null);
    setCustomer(null);
  };

  // --------------------------------------------------
  // PROVIDER
  // --------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        customer,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// USE AUTH HOOK
// --------------------------------------------------

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}