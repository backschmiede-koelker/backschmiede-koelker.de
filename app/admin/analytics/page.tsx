import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AnalyticsFilters from "./filters";
import LineChart from "./line-chart";
import AdminPageHeaderServer from "../components/admin-page-header-server";
import { PERF_BUCKETS_MS, analyticsKeys, getAnalyticsConfig, listDays, parseRange } from "@/lib/analytics";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin - Analytics | Backschmiede Kölker",
  description: "Cookieless Analytics für die Backschmiede Kölker einsehen.",
  alternates: { canonical: "/admin/analytics" },
  openGraph: {
    title: "Admin - Analytics | Backschmiede Kölker",
    description: "Cookieless Analytics für die Backschmiede Kölker einsehen.",
    url: "/admin/analytics",
    type: "website",
  },
};

type Search = Record<string, string | string[] | undefined>;

type CountRow = { key: string; count: number };

type DailyRow = { day: string; pv: number; uv: number };

type PerfSummary = {
  totalCount: number;
  totalSumMs: number;
  avgMs: number;
  p50Ms: number | null;
  p95Ms: number | null;
};

function Card({ title, help, children, className }: { title: string; help: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={["relative rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-4 shadow-sm", className].join(" ")}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{help}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="text-sm whitespace-normal break-words">{label}</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 overflow-hidden">
          <div className="h-2 bg-emerald-500/80 dark:bg-emerald-400/80" style={{ width: `${pct}%` }} />
        </div>
        <div className="w-16 text-right tabular-nums text-sm shrink-0">{value}</div>
      </div>
    </div>
  );
}

async function fetchDailySeries(prefix: string, days: string[]) {
  const redis = await getRedis();
  const multi = redis.multi();
  for (const day of days) {
    const keys = analyticsKeys(prefix, day);
    multi.get(keys.pv);
    multi.pfCount(keys.uv);
  }
  const res = (await multi.exec()) ?? [];
  const out: DailyRow[] = [];
  let i = 0;
  for (const day of days) {
    const pvRaw = res[i++] ?? 0;
    const uvRaw = res[i++] ?? 0;
    const pv = typeof pvRaw === "string" ? Number(pvRaw) : Number(pvRaw ?? 0);
    const uv = typeof uvRaw === "string" ? Number(uvRaw) : Number(uvRaw ?? 0);
    out.push({ day, pv: Number.isFinite(pv) ? pv : 0, uv: Number.isFinite(uv) ? uv : 0 });
  }
  return out;
}

async function aggregateHashCounts(prefixKey: string, days: string[], limit = 10) {
  const redis = await getRedis();
  const multi = redis.multi();
  for (const day of days) multi.hGetAll(`${prefixKey}${day}`);
  const res = (await multi.exec()) ?? [];

  const totals = new Map<string, number>();
  for (const raw of res) {
    const obj = (raw || {}) as Record<string, string>;
    for (const [k, v] of Object.entries(obj)) {
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      totals.set(k, (totals.get(k) || 0) + n);
    }
  }

  const rows: CountRow[] = Array.from(totals, ([key, count]) => ({ key, count }));
  rows.sort((a, b) => b.count - a.count);
  return rows.slice(0, limit);
}

function parseBucketToUpper(label: string): number | null {
  // "0-25" -> 25; "26-50" -> 50; "6001+" -> null
  if (label.endsWith("+")) return null;
  const parts = label.split("-");
  if (parts.length !== 2) return null;
  const upper = Number(parts[1]);
  return Number.isFinite(upper) ? upper : null;
}

function percentileFromHistogram(hist: Map<string, number>, p: number): number | null {
  const entries = Array.from(hist.entries())
    .map(([label, count]) => ({ label, count, upper: parseBucketToUpper(label) }))
    .filter((e) => e.count > 0);

  if (!entries.length) return null;

  // Sort by upper bound; open-ended "+" comes last
  entries.sort((a, b) => {
    if (a.upper === null && b.upper === null) return 0;
    if (a.upper === null) return 1;
    if (b.upper === null) return -1;
    return a.upper - b.upper;
  });

  const total = entries.reduce((s, e) => s + e.count, 0);
  if (total <= 0) return null;

  const target = Math.ceil(total * p);
  let acc = 0;
  for (const e of entries) {
    acc += e.count;
    if (acc >= target) {
      // wir geben die Bucket-Obergrenze als konservative Schätzung zurück
      if (e.upper !== null) return e.upper;
      // open-ended: als grobe Obergrenze -> letztes PERF_BUCKETS_MS + 1
      return PERF_BUCKETS_MS[PERF_BUCKETS_MS.length - 1] + 1;
    }
  }
  return null;
}

async function fetchPerfSummary(prefix: string, days: string[]): Promise<PerfSummary> {
  const redis = await getRedis();
  const multi = redis.multi();

  for (const day of days) {
    const keys = analyticsKeys(prefix, day);
    multi.hGetAll(keys.perfHist);
    multi.get(keys.perfSumMs);
    multi.get(keys.perfCount);
  }

  const res = (await multi.exec()) ?? [];

  const hist = new Map<string, number>();
  let totalSumMs = 0;
  let totalCount = 0;

  let i = 0;
  for (let idx = 0; idx < days.length; idx++) {
    const rawHist = (res[i++] || {}) as Record<string, string>;
    const rawSum = res[i++] ?? "0";
    const rawCount = res[i++] ?? "0";

    for (const [k, v] of Object.entries(rawHist)) {
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      hist.set(k, (hist.get(k) || 0) + n);
    }

    const sum = typeof rawSum === "string" ? Number(rawSum) : Number(rawSum ?? 0);
    const cnt = typeof rawCount === "string" ? Number(rawCount) : Number(rawCount ?? 0);
    if (Number.isFinite(sum)) totalSumMs += sum;
    if (Number.isFinite(cnt)) totalCount += cnt;
  }

  const avgMs = totalCount ? Math.round(totalSumMs / totalCount) : 0;
  const p50Ms = percentileFromHistogram(hist, 0.5);
  const p95Ms = percentileFromHistogram(hist, 0.95);

  return { totalCount, totalSumMs, avgMs, p50Ms, p95Ms };
}

async function fetchSlowPaths(prefix: string, days: string[], limit = 10) {
  const redis = await getRedis();
  const multi = redis.multi();
  for (const day of days) {
    const keys = analyticsKeys(prefix, day);
    multi.hGetAll(keys.perfPathSumMs);
    multi.hGetAll(keys.perfPathCount);
  }
  const res = (await multi.exec()) ?? [];

  const sumTotals = new Map<string, number>();
  const cntTotals = new Map<string, number>();

  let i = 0;
  for (let idx = 0; idx < days.length; idx++) {
    const rawSum = (res[i++] || {}) as Record<string, string>;
    const rawCnt = (res[i++] || {}) as Record<string, string>;

    for (const [path, v] of Object.entries(rawSum)) {
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      sumTotals.set(path, (sumTotals.get(path) || 0) + n);
    }
    for (const [path, v] of Object.entries(rawCnt)) {
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      cntTotals.set(path, (cntTotals.get(path) || 0) + n);
    }
  }

  const rows = Array.from(cntTotals.entries()).map(([path, cnt]) => {
    const sum = sumTotals.get(path) || 0;
    const avg = cnt ? sum / cnt : 0;
    return { path, avgMs: Math.round(avg), count: cnt };
  });

  rows.sort((a, b) => b.avgMs - a.avgMs);
  return rows.slice(0, limit);
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const sp = await searchParams;
  const { range, days } = parseRange(sp.range as string | undefined);

  const { prefix } = getAnalyticsConfig();
  const dayList = listDays(new Date(), days);

  const daily = await fetchDailySeries(prefix, dayList);
  const pvData = daily.map((d) => ({ x: d.day, y: d.pv }));
  const uData = daily.map((d) => ({ x: d.day, y: d.uv }));

  const totalPV = daily.reduce((sum, d) => sum + d.pv, 0);
  const totalU = daily.reduce((sum, d) => sum + d.uv, 0);
  const avgPV = daily.length ? Math.round(totalPV / daily.length) : 0;
  const avgU = daily.length ? Math.round(totalU / daily.length) : 0;

  const [
    topPages,
    topRefs,
    utmSources,
    utmMediums,
    utmCampaigns,
    deviceDist,
    langDist,
    browserDist,
    osDist,
    perf,
    slowPaths,
  ] = await Promise.all([
    aggregateHashCounts(`${prefix}pv:path:`, dayList, 10),
    aggregateHashCounts(`${prefix}pv:ref:`, dayList, 10),
    aggregateHashCounts(`${prefix}pv:utm_source:`, dayList, 10),
    aggregateHashCounts(`${prefix}pv:utm_medium:`, dayList, 10),
    aggregateHashCounts(`${prefix}pv:utm_campaign:`, dayList, 10),
    aggregateHashCounts(`${prefix}pv:device:`, dayList, 10),
    aggregateHashCounts(`${prefix}pv:lang:`, dayList, 12),
    aggregateHashCounts(`${prefix}pv:browser:`, dayList, 10),
    aggregateHashCounts(`${prefix}pv:os:`, dayList, 10),
    fetchPerfSummary(prefix, dayList),
    fetchSlowPaths(prefix, dayList, 10),
  ]);

  const maxPage = topPages[0]?.count ?? 0;
  const maxRef = topRefs[0]?.count ?? 0;
  const maxUtmSource = utmSources[0]?.count ?? 0;
  const maxUtmMedium = utmMediums[0]?.count ?? 0;
  const maxUtmCampaign = utmCampaigns[0]?.count ?? 0;
  const maxDev = deviceDist[0]?.count ?? 0;
  const maxLang = langDist[0]?.count ?? 0;
  const maxBrowser = browserDist[0]?.count ?? 0;
  const maxOs = osDist[0]?.count ?? 0;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-hidden">
      <AdminPageHeaderServer title="Analytics" subtitle="Übersichtliche, cookieless Zahlen ohne Cookies oder Identifier." />

      <section className="mb-5">
        <AnalyticsFilters initial={{ range }} />
      </section>

      <Card title="Seitenaufrufe (alle Aufrufe)" help="Zählt jeden Seitenaufruf - auch wenn dieselbe Person mehrere Seiten anschaut oder neu lädt.">
        <LineChart data={pvData} yLabel="Anzahl Aufrufe" xLabel="Datum" className="w-full" />
        <div className="mt-3 text-sm opacity-80">
          Summe im Zeitraum: <span className="font-semibold">{totalPV}</span>
        </div>
        <div className="text-sm opacity-80">
          Durchschnitt pro Tag: <span className="font-semibold">{avgPV}</span>
        </div>
      </Card>

      <Card
        title="Unique Users pro Tag (Schätzung)"
        help="Basiert auf einem täglich wechselnden, nicht rückrechenbaren HMAC-Zähler (HLL). Keine Cookies, keine IP-Speicherung."
        className="mt-5"
      >
        <LineChart data={uData} yLabel="Unique Users" xLabel="Datum" className="w-full" />
        <div className="mt-3 text-sm opacity-80">
          Summe pro Tag im Zeitraum: <span className="font-semibold">{totalU}</span>
        </div>
        <div className="text-sm opacity-80">
          Durchschnitt pro Tag: <span className="font-semibold">{avgU}</span>
        </div>
      </Card>

      <Card title="Woher kamen die Besucher?" help="Referrer-Hosts zeigen, von welchen Domains die Besucher kommen." className="mt-5">
        <div className="space-y-2">
          {topRefs.map((r, i) => (
            <BarRow key={`${r.key}-${i}`} label={r.key} value={r.count} max={maxRef} />
          ))}
          {!topRefs.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
        </div>
      </Card>

      <Card title="UTM-Kennzeichnungen" help="Wenn UTM-Parameter gesetzt sind, werden sie hier aggregiert angezeigt." className="mt-5">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-medium mb-2">UTM Quelle</div>
            <div className="space-y-2">
              {utmSources.map((r, i) => (
                <BarRow key={`${r.key}-${i}`} label={r.key} value={r.count} max={maxUtmSource} />
              ))}
              {!utmSources.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">UTM Medium</div>
            <div className="space-y-2">
              {utmMediums.map((r, i) => (
                <BarRow key={`${r.key}-${i}`} label={r.key} value={r.count} max={maxUtmMedium} />
              ))}
              {!utmMediums.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">UTM Kampagne</div>
            <div className="space-y-2">
              {utmCampaigns.map((r, i) => (
                <BarRow key={`${r.key}-${i}`} label={r.key} value={r.count} max={maxUtmCampaign} />
              ))}
              {!utmCampaigns.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card title="Beliebte Seiten" help="Welche Seiten im Zeitraum am häufigsten besucht wurden.">
          <div className="space-y-2">
            {topPages.map((r, i) => (
              <BarRow key={`${r.key}-${i}`} label={r.key} value={r.count} max={maxPage} />
            ))}
            {!topPages.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
          </div>
        </Card>

        <Card title="Geräte & Sprachen" help="Geräteklasse (mobile/desktop) und Sprachen (2-stellig) im Zeitraum.">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium mb-1 opacity-75">Geräte</div>
              <div className="space-y-3">
                {deviceDist.map((d, i) => (
                  <BarRow key={`${d.key}-${i}`} label={d.key} value={d.count} max={maxDev} />
                ))}
                {!deviceDist.length && <div className="text-sm opacity-70">Keine Daten</div>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium mb-1 opacity-75">Sprachen</div>
              <div className="space-y-3">
                {langDist.map((l, i) => (
                  <BarRow key={`${l.key}-${i}`} label={l.key} value={l.count} max={maxLang} />
                ))}
                {!langDist.length && <div className="text-sm opacity-70">Keine Daten</div>}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card title="Browser-Familien" help="Grobe Klassifizierung ohne Versionsnummern (aggregiert).">
          <div className="space-y-2">
            {browserDist.map((r, i) => (
              <BarRow key={`${r.key}-${i}`} label={r.key} value={r.count} max={maxBrowser} />
            ))}
            {!browserDist.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
          </div>
        </Card>

        <Card title="Betriebssystem-Familien" help="Grobe Klassifizierung ohne Versionsnummern (aggregiert).">
          <div className="space-y-2">
            {osDist.map((r, i) => (
              <BarRow key={`${r.key}-${i}`} label={r.key} value={r.count} max={maxOs} />
            ))}
            {!osDist.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
          </div>
        </Card>
      </div>

      <Card
        title="Collector-Performance (aggregiert)"
        help="Gemessen wird die serverseitige Verarbeitungsdauer des Analytics-Collectors. Gespeichert werden nur aggregierte Kennzahlen (p50/p95/Ø)."
        className="mt-5"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-3">
            <div className="text-xs opacity-75">Ø (Durchschnitt)</div>
            <div className="text-lg font-semibold tabular-nums">{perf.avgMs} ms</div>
          </div>
          <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-3">
            <div className="text-xs opacity-75">p50</div>
            <div className="text-lg font-semibold tabular-nums">{perf.p50Ms ?? "—"}{perf.p50Ms ? " ms" : ""}</div>
          </div>
          <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-3">
            <div className="text-xs opacity-75">p95</div>
            <div className="text-lg font-semibold tabular-nums">{perf.p95Ms ?? "—"}{perf.p95Ms ? " ms" : ""}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Langsamste Pfade (Ø)</div>
          <div className="space-y-2">
            {slowPaths.map((r) => (
              <div key={r.path} className="flex items-center justify-between gap-3">
                <div className="text-sm break-words">{r.path}</div>
                <div className="text-sm tabular-nums shrink-0">
                  {r.avgMs} ms <span className="opacity-60">({r.count} Hits)</span>
                </div>
              </div>
            ))}
            {!slowPaths.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
          </div>
        </div>
      </Card>

      <Card title="Aufbewahrung der Daten" help="Aggregierte Analytics-Statistiken werden maximal 12 Monate vorgehalten (TTL 365 Tage)." className="mt-5">
        <p className="text-sm opacity-90">Ältere Daten werden automatisch aus Redis entfernt.</p>
      </Card>
    </main>
  );
}
