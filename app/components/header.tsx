// /app/components/header.tsx
'use client';

import Link from 'next/link';
import ThemeToggle from './theme-toggle';
import { FaBars, FaXmark, FaRegSnowflake } from 'react-icons/fa6';
import { LuPartyPopper } from 'react-icons/lu';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  isSnowing: boolean;
  onToggleSnow: () => void;
  showSnowToggle: boolean;
};

const COOLDOWN_MS = 500; // 0.5s

const iconBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded-xl ' +
  'border border-emerald-800/10 dark:border-emerald-300/10 ' +
  'bg-white/80 dark:bg-white/5 backdrop-blur ' +
  'shadow-sm hover:shadow-md hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40 ' +
  'transition-all active:scale-95 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50';

const partyBtn = (isCoolingDown: boolean) =>
  [
    iconBtn,
    "border-amber-500/70 dark:border-amber-400/80",
    "text-amber-600 dark:text-amber-300",
    "hover:text-amber-500 dark:hover:text-amber-200",
    "shadow-[0_0_10px_rgba(245,158,11,0.35)] hover:shadow-[0_0_16px_rgba(245,158,11,0.5)]",
    isCoolingDown && "opacity-60 cursor-not-allowed",
  ]
    .filter(Boolean)
    .join(" ");

const snowBtn = (isSnowing: boolean) =>
  iconBtn +
  " " +
  (isSnowing
    ? // ❄ AN: Leuchten & Glow
      "border-emerald-500/60 dark:border-emerald-400/60 " +
      "text-emerald-600 dark:text-emerald-300 " +
      "shadow-[0_0_10px_rgba(16,185,129,0.35)]"
    : // ❄ AUS: einfach normaler Button, NICHT ausgegraut
      "text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-300"
  );

const throwConfetti = async () => {
  const { default: confetti } = await import('canvas-confetti');
  const defaults = {
    zIndex: 2147483647,
    spread: 120,
    startVelocity: 45,
    ticks: 200,
    gravity: 0.9,
    scalar: 1,
    disableForReducedMotion: true,
  } as const;

  const bursts = 7;
  for (let i = 0; i < bursts; i++) {
    const x = i / (bursts - 1);
    const y = Math.random() * 0.3 + 0.1;
    confetti({ ...defaults, particleCount: 80, origin: { x, y } });
  }

  confetti({
    ...defaults,
    particleCount: 150,
    spread: 360,
    origin: { x: 0.5, y: 0.3 },
    decay: 0.92,
  });
};

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
  isSnowing,
  onToggleSnow,
  showSnowToggle,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const cooldownTimer = useRef<number | null>(null);
  const lastFireRef = useRef<number>(0);

  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (cooldownTimer.current) window.clearTimeout(cooldownTimer.current);
    };
  }, []);

  const handleConfettiClick = async () => {
    const now = Date.now();
    if (isCoolingDown || now - lastFireRef.current < COOLDOWN_MS) return;

    lastFireRef.current = now;
    setIsCoolingDown(true);
    try {
      await throwConfetti();
    } finally {
      if (cooldownTimer.current) window.clearTimeout(cooldownTimer.current);
      cooldownTimer.current = window.setTimeout(() => setIsCoolingDown(false), COOLDOWN_MS);
    }
  };

  const solidHeader =
    'border-b border-emerald-800/15 dark:border-emerald-300/15 ' +
    'bg-white/70 dark:bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/40 ' +
    'shadow-[0_1px_12px_rgb(0_0_0/0.08)]';

  const transparentHeader = 'border-b-0 bg-transparent shadow-none';

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full transition-colors transform-gpu',
        isHome && !scrolled ? transparentHeader : solidHeader,
      ].join(' ')}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 h-14">
        {/* Mobile: Sidebar Toggle */}
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

        {/* Logo / Titel */}
        <div className="flex min-w-0 flex-1 items-center justify-center md:justify-start">
          <Link
            href="/"
            onClick={() => {
              if (isSidebarOpen) onCloseSidebar();
            }}
            className="block rounded px-2 py-1 font-semibold tracking-tight
                       text-zinc-900 dark:text-zinc-50
                       hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors"
          >
            Backschmiede Kölker
          </Link>
        </div>

        {/* Actions rechts */}
        <div className="flex items-center gap-2">
          {/* 🎉 CTA: mobil quadratisch, ab sm pill */}
          <button
            type="button"
            onClick={handleConfettiClick}
            disabled={isCoolingDown}
            aria-disabled={isCoolingDown}
            className={partyBtn(isCoolingDown)}
            aria-label="Konfetti"
            title="Konfetti"
          >
            <LuPartyPopper className="text-[18px]" aria-hidden />
          </button>

          {/* ❄ Schnee-Toggle - direkt neben Konfetti */}
          {showSnowToggle && (
            <button
              type="button"
              onClick={onToggleSnow}
              aria-pressed={isSnowing}
              aria-label={isSnowing ? "Schnee ausschalten" : "Schnee einschalten"}
              title={isSnowing ? "Schnee ausschalten" : "Schnee einschalten"}
              className={snowBtn(isSnowing)}
            >
              {isSnowing ? (
                <FaRegSnowflake className="text-[17px]" />
              ) : (
                <FaRegSnowflake className="text-[17px]" />
              )}
            </button>
          )}

          {/* Fester Platz für den Toggle verhindert jeglichen Shift */}
          <div className="h-10 w-10">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
