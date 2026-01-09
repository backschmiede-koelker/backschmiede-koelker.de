// /app/components/tgtg-cta.tsx
'use client';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';

type LocationInfo = {
  key: 'RECKE' | 'METTINGEN';
  label: string;
  tgtgShareUrl: string; // mobile -> App, desktop -> Installationsseite
};

type Props = {
  locations?: LocationInfo[];
};

const DEFAULT_LOCATIONS: LocationInfo[] = [
  {
    key: 'RECKE',
    label: 'Recke',
    tgtgShareUrl: 'https://share.toogoodtogo.com/item/142593183634493376/',
  },
  {
    key: 'METTINGEN',
    label: 'Mettingen',
    tgtgShareUrl: 'https://share.toogoodtogo.com/item/146056137368565632/',
  },
];

// Einzelnes FAQ-Item mit Animation
function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = React.useState(0);

  React.useEffect(() => {
    if (open && contentRef.current) setMaxHeight(contentRef.current.scrollHeight);
    else setMaxHeight(0);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (contentRef.current) setMaxHeight(contentRef.current.scrollHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  return (
    <div className="border-t border-emerald-800/10 first:border-t-0 dark:border-emerald-300/15">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-2 py-2 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{question}</span>
        <span
          className={`inline-flex h-5 w-5 items-center justify-center text-xs transition-transform duration-200 ${
            open ? 'rotate-90' : ''
          }`}
          aria-hidden
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>
      <div
        style={{ maxHeight }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div ref={contentRef} className="pb-2 text-sm text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TgtgCta({ locations = DEFAULT_LOCATIONS }: Props) {
  return (
    <section
      aria-labelledby="tgtg-title"
      className={`
        relative overflow-hidden rounded-3xl p-5 sm:p-6
        ring-1 ring-emerald-600/25
        bg-gradient-to-br from-emerald-50/85 via-emerald-100/60 to-amber-50/60
        dark:from-green-950/60 dark:via-zinc-900/80 dark:to-emerald-900/40
        shadow-sm
      `}
    >
      {/* Soft blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-300/25 blur-[70px] dark:bg-emerald-700/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-amber-300/25 blur-[80px] dark:bg-amber-400/20"
      />

      {/* Header */}
      <header className="relative z-10 mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 backdrop-blur dark:border-emerald-300/15 dark:bg-white/10 dark:text-emerald-200">
          <svg width="12" height="12" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
            <path d="M3 21s6-1 10-5 5-10 5-10-6 1-10 5-5 10-5 10Z" fill="currentColor" />
          </svg>
          Lebensmittel retten
        </div>

        <h3 id="tgtg-title" className="mt-2 text-2xl font-semibold leading-tight">
          Too&nbsp;Good&nbsp;To&nbsp;Go - Überraschungstüten
        </h3>

        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
          Spare und rette frische Backwaren vom Tag. Verfügbarkeit &amp; Abholfenster findest du immer aktuell in der
          Too&nbsp;Good&nbsp;To&nbsp;Go App.
        </p>
      </header>

      {/* Desktop: Buttons + Anleitung nebeneinander, FAQ darunter (full width) */}
      <div className="relative z-10 grid gap-6 lg:grid-cols-2">
        {/* Buttons */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
            Direkt in der App öffnen
          </h4>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {locations.map((loc) => (
              <div
                key={loc.key}
                className="group overflow-hidden rounded-2xl bg-white/85 ring-1 ring-black/5 p-4 transition-shadow hover:shadow-md dark:bg-zinc-900/70 dark:ring-white/10"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                      <path
                        d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight">{loc.label}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">
                      Überraschungstüte reservieren
                    </div>
                  </div>
                  <span
                    className="ml-auto translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  >
                    ›
                  </span>
                </div>

                {/* Tipp: bei Universal-/App-Links ist same-tab oft zuverlässiger als _blank */}
                <a
                  href={loc.tgtgShareUrl}
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label={`Too Good To Go öffnen - ${loc.label}`}
                >
                  In Too Good To Go öffnen
                </a>

                <p className="mt-2 text-[11px] text-amber-900/80 dark:text-amber-200/80">
                  Abholfenster &amp; Verfügbarkeit: bitte in der App prüfen.
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Hinweis: Mengen sind begrenzt und variieren je Tag - in der App siehst du immer den aktuellen Stand.
          </p>
        </div>

        {/* Anleitung */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
            So funktioniert’s
          </h4>

          <ol className="space-y-3">
            {[
              {
                t: 'Standort öffnen',
                d: 'Auf Recke oder Mettingen klicken - du landest direkt beim passenden Eintrag in Too Good To Go.',
              },
              {
                t: 'Tüte reservieren',
                d: 'In der App auswählen & bezahlen - du erhältst eine Bestätigung.',
              },
              {
                t: 'Zur Zeit abholen',
                d: 'Abholfenster steht in der App - bitte rechtzeitig erscheinen und Bestätigung zeigen.',
              },
              {
                t: 'Genießen & sparen',
                d: 'Frische Backwaren zum kleinen Preis - und Lebensmittel gerettet!',
              },
            ].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[12px] font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <div className="font-medium">{s.t}</div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ full width (unter Buttons + Anleitung) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-emerald-800/10 bg-white/80 p-3 dark:border-emerald-300/15 dark:bg-white/5">
            <FAQItem question="Wo sehe ich Abholzeiten und Verfügbarkeit?">
              Direkt in der Too&nbsp;Good&nbsp;To&nbsp;Go App beim jeweiligen Standort - dort sind die Abholfenster und
              die Verfügbarkeit immer aktuell.
            </FAQItem>

            <FAQItem question="Was steckt in der Überraschungstüte?">
              Eine gemischte Auswahl vom Tag (z.&nbsp;B. Brötchen, Brote, süßes Gebäck) - abhängig davon, was übrig ist.
            </FAQItem>

            <FAQItem question="Kann ich mehrere Tüten reservieren?">
              Wenn genug verfügbar ist: ja. Die App zeigt die aktuelle Anzahl beim jeweiligen Standort.
            </FAQItem>

            <FAQItem question="Was, wenn ich es nicht rechtzeitig schaffe?">
              Bitte plane genug Zeit ein - Abholung ist nur im in der App angegebenen Zeitfenster möglich.
            </FAQItem>
          </div>
        </div>
      </div>
    </section>
  );
}
