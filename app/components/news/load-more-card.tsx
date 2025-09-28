// app/components/news/load-more-card.tsx
"use client";

type Props = { onClick: () => void; loading?: boolean };

export function LoadMoreCard({ onClick, loading }: Props) {
  return (
    <div
      className="relative grid h-[600px] sm:h-[660px] lg:h-[740px] place-items-center
                 overflow-hidden rounded-3xl ring-1 ring-black/5 dark:ring-white/10
                 bg-gradient-to-br from-emerald-50 to-emerald-100/60
                 dark:from-emerald-900/20 dark:to-emerald-800/10"
    >
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-[94%] sm:w-[88%] lg:w-[70%] rounded-2xl border border-emerald-300/60 bg-white/90
                   px-5 py-4 text-base font-semibold text-emerald-800 shadow-sm
                   transition-colors hover:bg-emerald-50 hover:shadow-md
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
                   disabled:opacity-50 dark:bg-zinc-900/60 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
      >
        {loading ? "Lade weitere News …" : "Mehr laden"}
      </button>
    </div>
  );
}
