'use client';

/**
 * Call-to-Action Buttons im Hero:
 * - Öffnungszeiten (immer sichtbar)
 * - Angebote (optional; wenn keine Angebote: unsichtbarer Platzhalter gleicher Größe → kein Layoutshift/Flackern)
 */
type Props = {
  angebotId: string;
  zeitenId: string;
  className?: string;
  /** Steuert Sichtbarkeit der Angebote-Schaltfläche; bei false wird ein identischer, unsichtbarer Platzhalter gerendert. */
  showAngebote?: boolean;
};

export default function HeroScrollCta({
  angebotId,
  zeitenId,
  className,
  showAngebote = false,
}: Props) {
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Styles zentral, damit Platzhalter exakt gleich aussieht
  const btnPrimary =
    "inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50";
  const btnSecondary =
    "inline-flex items-center gap-2 rounded-xl border border-emerald-800/10 bg-white/80 px-4 py-2.5 text-sm font-semibold text-zinc-900 backdrop-blur transition-all hover:bg-emerald-50 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:border-emerald-300/15 dark:bg-white/10 dark:text-white dark:hover:bg-emerald-900/40";

  return (
    <div className={className ?? ''}>
      {/* 1) Öffnungszeiten zuerst */}
      <button
        onClick={() => scrollToId(zeitenId)}
        className={btnSecondary}
      >
        Öffnungszeiten
      </button>

      {/* 2) Angebote oder gleich großer unsichtbarer Platzhalter */}
      {showAngebote ? (
        <button
          onClick={() => scrollToId(angebotId)}
          className={btnPrimary + " ml-3"}
        >
          Angebote
        </button>
      ) : (
        <button
          aria-hidden
          tabIndex={-1}
          className={btnPrimary + " ml-3 invisible pointer-events-none"}
        >
          Angebote
        </button>
      )}
    </div>
  );
}
