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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={iconBtn}
    >
      {/* sanfter Icon-Wechsel */}
      <IoSunny
        className={`text-[18px] transition-all duration-200 ${
          isDark ? 'scale-0 opacity-0 absolute rotate-90' : 'scale-100 opacity-100 rotate-0'
        }`}
        aria-hidden
      />
      <IoMoon
        className={`text-[18px] transition-all duration-200 ${
          isDark ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 absolute -rotate-90'
        }`}
        aria-hidden
      />
    </button>
  );
}
