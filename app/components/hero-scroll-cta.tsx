'use client';

type Props = {
  angebotId: string;
  zeitenId: string;
  className?: string;
};

export default function HeroScrollCta({
  angebotId,
  zeitenId,
  className,
}: Props) {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const btnPrimary =
    "inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50";
  const btnSecondary =
    "inline-flex items-center gap-2 rounded-xl border border-emerald-800/10 bg-white/80 px-4 py-2.5 text-sm font-semibold text-zinc-900 backdrop-blur transition-all hover:bg-emerald-50 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:border-emerald-300/15 dark:bg-white/10 dark:text-white dark:hover:bg-emerald-900/40";

  return (
    <div className={className ?? ''}>
      {/* 1) Öffnungszeiten */}
      <button
        onClick={() => scrollToId(zeitenId)}
        className={btnSecondary}
      >
        Öffnungszeiten
      </button>

      {/* 2) Angebote - jetzt immer sichtbar */}
      <button
        onClick={() => scrollToId(angebotId)}
        className={btnPrimary + " ml-3"}
      >
        Angebote
      </button>
    </div>
  );
}
