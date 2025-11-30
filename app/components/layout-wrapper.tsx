// app/components/layout-wrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from './header';
import Sidebar from './sidebar';

// Snowfall nur im Browser laden
const Snowfall = dynamic(
  () => import('react-snowfall').then((m) => m.default || m),
  { ssr: false }
);

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [snowEnabled, setSnowEnabled] = useState(true);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');

  const snowColor =
    resolvedTheme === "dark"
      ? "#e5f9ff" 
      : "#9bbcf0";

  const [snowflakeCount, setSnowflakeCount] = useState(160);

  useEffect(() => {
    const calcSnowflakes = () => {
      const w = window.innerWidth;

      if (w < 480) return 40;
      if (w < 768) return 80;   
      if (w < 1024) return 120;   
      return 160;  
    };

    const update = () => setSnowflakeCount(calcSnowflakes());

    update(); 
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-w-0">
      {/* Schnee-Overlay – z-40, Header hat z-50 */}
      {snowEnabled && (
        <div className="pointer-events-none fixed inset-0 z-40">
          <Snowfall
            snowflakeCount={snowflakeCount}
            color={resolvedTheme === "dark" ? "#e5f9ff" : "#cde7ff"}
            style={{
              width: "100%",
              height: "100%",
              // im Light Mode leichter Schatten, im Dark Mode kein zusätzlicher Kontrast nötig
              filter:
                resolvedTheme === "light"
                  ? "drop-shadow(0 0 2px rgba(0,0,0,0.18))"
                  : "none",
            }}
          />
        </div>
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col min-h-screen w-full ml-0 md:ml-72 min-w-0">
        <Header
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onCloseSidebar={() => setSidebarOpen(false)}
          isSnowing={snowEnabled}
          onToggleSnow={() => setSnowEnabled((v) => !v)}
        />

        <main className={isHome ? 'flex-1 min-w-0' : 'flex-1 p-6 min-w-0'}>
          {isHome ? (
            children
          ) : isAdmin ? (
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
