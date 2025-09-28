// app/components/news/end-of-feed-card.tsx
"use client";

import { CheckCircle2, ArrowLeft } from "lucide-react";

type Props = { onBackToStart: () => void };

export function EndOfFeedCard({ onBackToStart }: Props) {
  return (
    <div
      className="relative grid h-[600px] sm:h-[660px] lg:h-[740px] place-items-center
                 overflow-hidden rounded-3xl
                 ring-1 ring-black/5 dark:ring-white/10
                 bg-gradient-to-br from-white to-emerald-50
                 dark:from-zinc-900/60 dark:to-emerald-900/20"
    >
      <div className="text-center px-4 sm:px-6">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        <div className="text-lg font-semibold">Alles geladen</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Du bist am Ende angekommen.</div>

        <button
          type="button"
          onClick={onBackToStart}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-300/70
                     bg-white/80 px-3.5 py-2 text-sm font-medium shadow-sm
                     transition-colors hover:bg-emerald-50
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
                     dark:border-zinc-700/60 dark:bg-zinc-900/40"
        >
          <ArrowLeft className="h-4 w-4" /> Zum Anfang
        </button>
      </div>
    </div>
  );
}
