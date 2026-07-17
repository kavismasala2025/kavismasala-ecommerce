import { createContext, useContext, useState, type ReactNode } from 'react';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../lib/supabase';

interface AdminContextValue {
  isAuthed: boolean;
  login: (username: string, password: string) => boolean;
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

  const login = (username: string, password: string) => {
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthed(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
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
