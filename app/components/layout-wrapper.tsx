// app/components/layout-wrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './header';
import Sidebar from './sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-w-0">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* min-w-0 wichtig, damit der Inhalt in flex sauber schrumpft */}
      <div className="flex flex-col min-h-screen w-full ml-0 md:ml-72 min-w-0">
        <Header
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onCloseSidebar={() => setSidebarOpen(false)}
        />

        {/* Auch hier min-w-0, damit Kinder nicht überlaufen */}
        <main className={isHome ? 'flex-1 min-w-0' : 'flex-1 p-6 min-w-0'}>
          {isHome ? (
            children
          ) : isAdmin ? (
            // Admin-Seiten bekommen KEINEN zusätzlichen max-width-Wrapper,
            // die Seiten selbst regeln die Breite/Abstände.
            <>{children}</>
          ) : (
            <div className="w-full max-w-4xl mx-auto min-w-0">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
