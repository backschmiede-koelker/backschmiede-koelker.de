import Image from 'next/image';
import DailyDeal from './components/daily-deal';
import WeeklyDeals from './components/weekly-deals';
import Hours from './components/hours';
import TgtgCta from './components/tgtg-cta';

export default function Home() {
  return (
    <div className="space-y-20">
      {/* HERO – links sauber am Seitenraster ausgerichtet */}
      <section className="relative isolate h-[66svh] md:h-[72vh] w-full overflow-hidden rounded-3xl">
        <Image
          src="/mettingen-und-recke.png"
          alt="Backschmiede Kölker – Standorte Mettingen & Recke"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* dezente Lesbarkeits-Scrims, nur am linken unteren Bereich */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />

        {/* Inhalt strikt im gleichen Content-Frame wie die Sections */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-4 pb-6 md:pb-8">
            {/* Headline + Sub */}
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Backschmiede Kölker
              </h1>
              <p className="mt-1 text-white/85 text-sm md:text-base">
                Handwerkliche Backwaren aus&nbsp;Mettingen&nbsp;&amp;&nbsp;Recke – täglich frisch.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/30 backdrop-blur">
                  Mettingen
                </span>
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/30 backdrop-blur">
                  Recke
                </span>
              </div>
            </div>

            {/* Tagesangebot – kompakte, ruhige Karte; bleibt im Raster */}
            <div className="max-w-lg">
              <div className="rounded-2xl bg-white/85 p-4 shadow-md ring-1 ring-black/10 backdrop-blur-sm dark:bg-zinc-900/75 dark:ring-white/10">
                <DailyDeal />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aktuelles & Angebote */}
      <section className="mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-3xl font-bold">Aktuelles &amp; Angebote</h2>
        <WeeklyDeals />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <TgtgCta />
          {/* evtl. weitere Cards */}
        </div>
      </section>

      {/* Öffnungszeiten */}
      <section className="mx-auto max-w-5xl px-4" id="oeffnungszeiten">
        <h2 className="mb-4 text-center text-3xl font-bold">Öffnungszeiten</h2>
        <Hours />
      </section>
    </div>
  );
}
