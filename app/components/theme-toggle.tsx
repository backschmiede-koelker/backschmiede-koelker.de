'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm dark:text-white text-black transition-all"
    >
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
