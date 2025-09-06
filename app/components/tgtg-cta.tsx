// /app/components/tgtg-cta.tsx
'use client';
import * as React from 'react';

type PickupWindow = { day: string; time: string };
type LocationInfo = {
  key: 'RECKE' | 'METTINGEN';
  label: string;
  mapsUrl: string;
  windows: PickupWindow[];
};

type Props = {
  locations?: LocationInfo[];
};

const DEFAULT_LOCATIONS: LocationInfo[] = [
  {
    key: 'RECKE',
    label: 'Recke',
    mapsUrl: 'https://maps.app.goo.gl/v7fAobfiUPDe8xTV6',
    windows: [
      { day: 'Mo-Fr', time: '17:00-18:00' },
      { day: 'Sa',    time: '16:30-17:30' },
      { day: 'So',    time: '—' },
    ],
  },
  {
    key: 'METTINGEN',
    label: 'Mettingen',
    mapsUrl: 'https://maps.app.goo.gl/gyHqK9nJXGHv4oxX6',
    windows: [
      { day: 'Mo-Fr', time: '17:00-18:00' },
      { day: 'Sa',    time: '12:00-12:30' },
      { day: 'So',    time: '—' },
    ],
  },
];

export default function TgtgCta({ locations = DEFAULT_LOCATIONS }: Props) {
  return (
    <section
      aria-labelledby="tgtg-title"
      className={[
        'relative overflow-hidden rounded-3xl p-5 sm:p-6',
        'ring-1 ring-emerald-600/25',
        'bg-gradient-to-br from-emerald-50/85 via-emerald-100/60 to-amber-50/60',
        'dark:from-green-950/60 dark:via-zinc-900/80 dark:to-emerald-900/40',
        'shadow-sm'
      ].join(' ')}
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
      <header className="relative z-10 mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/15 bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 backdrop-blur dark:bg-white/10 dark:text-emerald-200">
            {/* Leaf icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
              <path d="M3 21s6-1 10-5 5-10 5-10-6 1-10 5-5 10-5 10Z" fill="currentColor" />
            </svg>
            Lebensmittel retten
          </div>
          <h3 id="tgtg-title" className="mt-2 text-2xl font-semibold leading-tight">
            Too&nbsp;Good&nbsp;To&nbsp;Go - Überraschungstüten
          </h3>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            Spare und rette frische Backwaren vom Tag. Abholung zu festen Zeitfenstern - schnell sein lohnt sich!
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
          <a
            href="https://www.toogoodtogo.com/"
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            App öffnen
          </a>
          <a
            href="https://store.toogoodtogo.com/"
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-800/15 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-900 backdrop-blur hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-emerald-300/20 dark:bg-white/10 dark:text-white dark:hover:bg-emerald-900/40"
          >
            Für Partner
          </a>
        </div>
      </header>

      {/* Grid: Locations + Steps */}
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        {/* Locations */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
            Abholfenster & Standorte
          </h4>

          <ul className="grid gap-3 sm:grid-cols-2">
            {locations.map((loc) => (
              <li
                key={loc.key}
                className="group overflow-hidden rounded-2xl bg-white/85 ring-1 ring-black/5 transition-shadow hover:shadow-md dark:bg-zinc-900/70 dark:ring-white/10"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {/* Pin icon */}
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                          <path
                            d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      <a
                        className="font-semibold hover:underline"
                        href={loc.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {loc.label}
                      </a>
                    </div>
                    <div className="mt-2 grid gap-1 text-sm">
                      {loc.windows.map((w, i) => (
                        <div key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <span className="w-14 shrink-0 tabular-nums">{w.day}</span>
                          <span className="font-medium">{w.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* arrow */}
                  <span
                    className="mt-1 translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  >
                    ›
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
            Hinweis: Mengen sind begrenzt & variieren je Tag. Verfügbarkeiten bitte in der App prüfen.
          </p>
        </div>

        {/* Steps / FAQ */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
            So funktioniert’s
          </h4>

          <ol className="space-y-3">
            {[
              { t: 'In der App suchen', d: '„Backschmiede Kölker“ auswählen und Verfügbarkeit checken.' },
              { t: 'Tüte reservieren',   d: 'Direkt in der App bezahlen - du erhältst eine Bestätigung.' },
              { t: 'Zur Zeit abholen',   d: 'Zum angegebenen Abholfenster erscheinen und Bestätigung zeigen.' },
              { t: 'Genießen & sparen',  d: 'Frische Backwaren zu kleinem Preis - und Lebensmittel gerettet!' },
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

          <div className="rounded-xl border border-emerald-800/10 bg-white/80 p-3 dark:border-emerald-300/15 dark:bg-white/5">
            <details>
              <summary className="cursor-pointer select-none text-sm font-medium">
                Was steckt in der Überraschungstüte?
              </summary>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Eine gemischte Auswahl vom Tag (z.&nbsp;B. Brötchen, Brote, süßes Gebäck) - abhängig davon, was übrig ist.
              </p>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer select-none text-sm font-medium">
                Kann ich mehrere Tüten reservieren?
              </summary>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Wenn genug verfügbar ist: ja. Die App zeigt die aktuelle Anzahl je Standort.
              </p>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer select-none text-sm font-medium">
                Was, wenn ich es nicht rechtzeitig schaffe?
              </summary>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Bitte plane genug Zeit ein - Abholung ist nur im angegebenen Fenster möglich.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
