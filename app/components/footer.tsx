'use client';
import Link from "next/link";
import { FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  // Hilfs-Komponente für eine Standort-Karte
  function LocationCard({
    title,
    street,
    city,
    phoneHref,
    phoneLabel,
  }: {
    title: string;
    street: React.ReactNode;
    city: string;
    phoneHref: string;
    phoneLabel: string;
  }) {
    return (
      <div
        className="h-full rounded-2xl border border-emerald-800/10 dark:border-emerald-300/10
                   bg-white/70 dark:bg-white/5 p-4 shadow-sm"
      >
        <div className="text-sm opacity-80">Standort</div>
        <h3 className="mt-1 text-base font-semibold">{title}</h3>
        <div className="mt-2 text-sm leading-6">
          <div className="whitespace-pre-line">{street}</div>
          <div>{city}</div>
        </div>
        <div className="mt-3 text-sm">
          Telefon:{' '}
          <a href={phoneHref} className="underline underline-offset-2 hover:opacity-80">
            {phoneLabel}
          </a>
        </div>
      </div>
    );
  }

  return (
    <footer
      className="mt-16 border-t border-emerald-800/10 dark:border-emerald-300/10
                 bg-white/70 dark:bg-zinc-900/60 backdrop-blur
                 text-zinc-800 dark:text-zinc-200"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* Brand-Block immer oben, kurz & knapp */}
        <div>
          <h2 className="text-base font-semibold">Backschmiede Kölker</h2>
          <p className="mt-1 text-sm opacity-80">
            Handwerkliche Backwaren aus Mettingen &amp; Recke - täglich frisch, mit Zeit, Herz und guten Zutaten.
          </p>
        </div>

        <div
          className="mt-6 rounded-2xl border border-emerald-800/10 dark:border-emerald-300/10
                    bg-white/70 dark:bg-white/5 p-4 shadow-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
            E-Mail
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center 
                            rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <FaEnvelope className="text-lg" />
            </span>
            <a
              href="mailto:info@backschmiede-koelker.de"
              className="text-sm font-medium hover:underline"
            >
              info@backschmiede-koelker.de
            </a>
          </div>
        </div>

        {/* Zwei gleich hohe Karten: Recke & Mettingen */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2 items-stretch">
          <LocationCard
            title="Recke"
            street={
              <>
                {/* geschützter Bindestrich \u2011 und geschütztes Leerzeichen &nbsp; */}
                <span className="whitespace-nowrap">{'Hauptstraße\u00A010'}</span>
              </>
            }
            city="49509 Recke"
            phoneHref="tel: +49 1575 5353999"
            phoneLabel="+49 1575 5353999"
          />

          <LocationCard
            title="Mettingen"
            street={
              <>
                <span className="whitespace-nowrap">{'Landrat\u2011Schultz\u2011Straße\u00A01'}</span>
              </>
            }
            city="49497 Mettingen"
            phoneHref="tel: +49 5452 919611"
            phoneLabel="+49 5452 919611"
          />
        </div>
      </div>

      <div className="border-t border-emerald-800/10 dark:border-emerald-300/10">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 text-xs flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between opacity-80">
          <div>© {year} Backschmiede Kölker</div>
          <div className="space-x-4">
            <a href="/imprint" className="hover:opacity-80">Impressum</a>
            <a href="/privacy" className="hover:opacity-80">Datenschutz</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
