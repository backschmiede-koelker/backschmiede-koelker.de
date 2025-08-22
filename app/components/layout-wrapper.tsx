'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import Sidebar from './sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

        <main className="flex-1 p-6">
          <div className="w-full max-w-4xl mx-auto">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
