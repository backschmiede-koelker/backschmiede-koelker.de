'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './header';
import Sidebar from './sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col min-h-screen w-full ml-0 md:ml-72">
        <Header
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onCloseSidebar={() => setSidebarOpen(false)}
        />

        {/* Auf der Startseite KEIN zentrierender Max-Width-Wrapper,
           damit Hero & Header-Gradient vollflächig funktionieren */}
        <main className={isHome ? 'flex-1' : 'flex-1 p-6'}>
          {isHome ? (
            children
          ) : (
            <div className="w-full max-w-4xl mx-auto">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
