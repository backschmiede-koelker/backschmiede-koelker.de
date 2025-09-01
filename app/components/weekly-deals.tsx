import { headers } from 'next/headers';
import { formatEUR } from '../lib/offers';

async function fetchOffers() {
  const h = await headers() as unknown as Headers;
  
  const host =
    h.get('x-forwarded-host') ??
    h.get('host') ??
    process.env.VERCEL_URL ??
    'localhost:3000';

  const proto =
    h.get('x-forwarded-proto') ??
    (process.env.VERCEL_URL ? 'https' : 'http');

  const url = `${proto}://${host}/api/offers`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json() as Promise<{ from: string; to: string; items: any[] }>;
}

function rangeLabel(fromISO: string, toISO: string) {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  const f = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(from);
  const t = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(to);
  return `${f} – ${t}`;
}

export default async function WeeklyDeals() {
  const data = await fetchOffers();

  return (
    <section className="relative rounded-3xl p-6 md:p-7 ring-1 ring-amber-500/25 bg-gradient-to-br from-amber-50/70 to-amber-100/40 dark:from-amber-900/10 dark:to-amber-800/10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold leading-tight">Wöchentlich wechselndes Brot</h3>
          <p className="text-xs opacity-70">Gültig {rangeLabel(data.from, data.to)}</p>
        </div>
      </header>

      {(!data || data.items.length === 0) ? (
        <div className="rounded-xl border border-amber-500/20 bg-white/70 dark:bg-zinc-900/60 p-5 text-sm shadow-sm">
          Diese Woche sind gerade keine speziellen Brote eingetragen.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((it) => (
            <li key={it.id} className="group overflow-hidden rounded-2xl bg-white/90 dark:bg-zinc-900/70 ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
              {it.image && (
                <div className="aspect-[5/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt={it.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-lg font-semibold leading-tight">{it.title}</h4>
                  {'price' in it && it.price != null && (
                    <div className="shrink-0 text-base font-bold tabular-nums">
                      {typeof it.price === 'number' ? formatEUR(it.price) : it.price}
                    </div>
                  )}
                </div>
                {it.unit && <div className="text-xs opacity-70 mt-0.5">{it.unit}</div>}
                {it.description && <p className="mt-2 text-sm opacity-90">{it.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {it.badge && (
                    <span className="inline-flex items-center rounded-full bg-amber-600/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 ring-1 ring-amber-600/20">
                      {it.badge}
                    </span>
                  )}
                  {Array.isArray(it.tags) &&
                    it.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide opacity-70">
                        {t}
                      </span>
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
