import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface RouterValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

function currentPath() {
  const { pathname, search } = window.location;
  return (pathname || '/') + search;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(currentPath());

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    if (to === currentPath()) return;
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        // Allow modifier-clicks to open in a new tab normally
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
