// /app/components/theme-toggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { IoMoon, IoSunny } from 'react-icons/io5';

const iconBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded-xl ' +
  'border border-emerald-800/10 dark:border-emerald-300/10 ' +
  'bg-white/80 dark:bg-white/5 backdrop-blur ' +
  'shadow-sm hover:shadow-md hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40 ' +
  'transition-all active:scale-95 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Bis zum Mount keine theme-abhängigen Attribute rendern.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === 'dark' : undefined;

  // Vor Mount neutrales Label, danach korrektes Label
  const ariaLabel =
    mounted && typeof isDark === 'boolean'
      ? isDark
        ? 'Zum hellen Design wechseln'
        : 'Zum dunklen Design wechseln'
      : 'Theme umschalten';

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={iconBtn}
      // Notwendig nicht, aber falls ein Addon HTML ändert:
      // suppressHydrationWarning
    >
      {/* Fester Icon-Container: keine Layout-Verschiebung */}
      <span className="relative block h-5 w-5" aria-hidden>
        {mounted ? (
          <>
            <IoSunny
              className={`absolute inset-0 text-[18px] transition-all duration-200 ${
                isDark ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'
              }`}
            />
            <IoMoon
              className={`absolute inset-0 text-[18px] transition-all duration-200 ${
                isDark ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-90'
              }`}
            />
          </>
        ) : (
          // Vor Mount nur ein leerer Platzhalter in der richtigen Größe
          <span className="block h-full w-full" />
        )}
      </span>
      <span className="sr-only">Theme umschalten</span>
    </button>
  );
}
