import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface AdminContextValue {
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);
const SESSION_KEY = 'kavis_admin_session';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return false;
  }

  setIsAuthed(true);
  sessionStorage.setItem(SESSION_KEY, '1');

  return true;
};
  const logout = () => {
    setIsAuthed(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return <AdminContext.Provider value={{ isAuthed, login, logout }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
