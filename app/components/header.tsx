'use client';

import Link from 'next/link';
import ThemeToggle from './theme-toggle';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { useEffect, useState } from 'react';

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
};

const iconBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded-xl ' +
  'border border-emerald-800/10 dark:border-emerald-300/10 ' +
  'bg-white/80 dark:bg-white/5 backdrop-blur ' +
  'shadow-sm hover:shadow-md hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40 ' +
  'transition-all active:scale-95 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50';

export default function Header({ isSidebarOpen, onToggleSidebar, onCloseSidebar }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); // initial
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        // Immer sticky – kein snapping
        'sticky top-0 z-50 w-full',
        // Konstante Border-Breite; nur Farbe/Deckkraft ändert sich
        'border-b',
        scrolled
          ? 'border-emerald-800/15 dark:border-emerald-300/15'
          : 'border-transparent',
        // Konstante Höhe innen -> kein Zucken
        'bg-white/70 dark:bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/40',
        // Nur visuelle Transition (kein Layout)
        'transition-colors'
      ].join(' ')}
      style={{ willChange: 'box-shadow, background-color' }}
    >
      {/* feste Höhe = kein Layout-Shift */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 h-14">
        {/* Sidebar Toggle (mobil) */}
        <button
          type="button"
          aria-label={isSidebarOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={isSidebarOpen}
          onClick={onToggleSidebar}
          className={`${iconBtn} md:hidden relative`}
        >
          <FaBars
            className={`text-[18px] transition-opacity ${isSidebarOpen ? 'opacity-0 absolute' : 'opacity-100'}`}
            aria-hidden
          />
          <FaXmark
            className={`text-[18px] transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 absolute'}`}
            aria-hidden
          />
        </button>

        {/* Titel – neutraler, maximaler Kontrast */}
        <div className="flex min-w-0 flex-1 items-center justify-center md:justify-start">
          <Link
            href="/"
            onClick={() => { if (isSidebarOpen) onCloseSidebar(); }}
            className="block rounded px-2 py-1 font-semibold tracking-tight
                       text-zinc-900 dark:text-zinc-50
                       hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors"
          >
            Backschmiede Kölker
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Schatten nur als optische Tiefe, ohne Höhe zu ändern */}
      <div
        className={[
          'pointer-events-none h-0',
          scrolled ? 'shadow-[0_1px_12px_rgb(0_0_0/0.08)]' : 'shadow-none',
          'transition-shadow'
        ].join(' ')}
      />
    </header>
  );
}
