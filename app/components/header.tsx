'use client';

import ThemeToggle from "./theme-toggle";

type HeaderProps = {
  onToggleSidebar: () => void;
};

export default function Header({ onToggleSidebar}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-40 w-full">
      <div className="flex justify-between items-center px-4 py-3 max-w-4xl mx-auto w-full">
        <button
          className="md:hidden bg-green-700 text-white px-3 py-1 rounded transition-transform duration-300 active:scale-90 hover:brightness-110 focus:outline-none"
          onClick={onToggleSidebar}
        >
          ☰
        </button>
        <h1 className="text-xl font-bold">Backschmiede Kölker</h1>
        <div>
          { /* delete for auto theme */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
