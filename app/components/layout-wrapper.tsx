// app/components/layout-wrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import Header from './header';
import Sidebar from './sidebar';

const Snowfall = dynamic(
  () => import('react-snowfall').then((m) => m.default || m),
  { ssr: false }
);

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const DEFAULT_SNOW_ENABLED = true;
  const [snowEnabled, setSnowEnabled] = useState(DEFAULT_SNOW_ENABLED);
  const [snowflakeCount, setSnowflakeCount] = useState(160);

  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('bk_snow_enabled');
    if (stored === 'on') setSnowEnabled(true);
    if (stored === 'off') setSnowEnabled(false);
  }, []);

  const handleToggleSnow = () => {
    setSnowEnabled((prev) => {
      const next = !prev;
      try {
        if (next === DEFAULT_SNOW_ENABLED) {
          window.localStorage.removeItem('bk_snow_enabled');
        } else {
          window.localStorage.setItem('bk_snow_enabled', next ? 'on' : 'off');
        }
      } catch {}
      return next;
    });
  };

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
    return () => window.removeEventListener('resize', update);
  }, []);

  const snowColor = resolvedTheme === 'dark' ? '#e5f9ff' : '#cde7ff';

  const isHome = pathname === '/';
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <div className="flex min-w-0">
      {snowEnabled && (
        <div className="pointer-events-none fixed inset-0 z-40">
          <Snowfall
            snowflakeCount={snowflakeCount}
            color={snowColor}
            style={{
              width: '100%',
              height: '100%',
              filter:
                resolvedTheme === 'light'
                  ? 'drop-shadow(0 0 4px rgba(0,0,0,0.18))'
                  : 'none',
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
          onToggleSnow={handleToggleSnow}
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
