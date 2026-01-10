"use client";

type Props = {
  onClick: () => void;
  loading?: boolean;
  reachedEnd?: boolean;
  onBackToStart?: () => void;
};

export function LoadMoreCard({
  onClick,
  loading,
  reachedEnd,
  onBackToStart,
}: Props) {
  const disabled = !!loading || !!reachedEnd;

  return (
    <div
      className="
        h-[520px] sm:h-[560px] w-full
        relative flex flex-col items-center justify-center
        overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10
        bg-gradient-to-br from-amber-200/70 via-white/90 to-emerald-200/60
        dark:from-amber-900/20 dark:via-zinc-900/70 dark:to-emerald-900/25
        p-4
      "
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-amber-400/30 blur-[70px] dark:bg-amber-400/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-emerald-400/20 blur-[70px] dark:bg-emerald-500/15"
      />

      <div className="relative z-10 w-full max-w-sm text-center">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="
            w-full rounded-2xl
            border border-amber-700/30 bg-white/95
            px-5 py-3 text-base font-semibold text-amber-900 shadow-sm
            transition-colors hover:bg-amber-200/70 hover:shadow-md
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40
            disabled:opacity-55 disabled:hover:bg-white
            dark:bg-zinc-900/55 dark:text-amber-200 dark:border-amber-300/25
            dark:hover:bg-amber-900/25 dark:disabled:hover:bg-zinc-900/55
          "
        >
          {loading
            ? "Lade weitere News …"
            : reachedEnd
            ? "Alles geladen"
            : "Mehr laden"}
        </button>

        {reachedEnd && onBackToStart && (
          <button
            type="button"
            onClick={onBackToStart}
            className="
              mt-3 inline-flex w-full items-center justify-center rounded-xl
              border border-zinc-300/70 bg-white/85 px-3.5 py-2
              text-sm font-medium shadow-sm
              hover:bg-amber-200/60
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40
              dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:hover:bg-amber-900/20
            "
          >
            Zum Anfang
          </button>
        )}
      </div>
    </div>
  );
}
