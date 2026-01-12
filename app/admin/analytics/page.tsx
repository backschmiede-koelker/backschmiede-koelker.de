// /app/admin/analytics/page.tsx
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import AnalyticsFilters from "./filters";
import LineChart from "./line-chart";
import AdminPageHeaderServer from "../components/admin-page-header-server";

export const metadata: Metadata = {
  title: "Admin - Analytics | Backschmiede Kölker",
  description: "Cookieless Analytics, Trafficquellen und Kampagnen für die Backschmiede Kölker einsehen.",
  alternates: { canonical: "/admin/analytics" },
  openGraph: {
    title: "Admin - Analytics | Backschmiede Kölker",
    description: "Cookieless Analytics, Trafficquellen und Kampagnen für die Backschmiede Kölker einsehen.",
    url: "/admin/analytics",
    type: "website",
  },
};

type Search = Record<string, string | string[] | undefined>;

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
      {/* Label: mehrere Zeilen erlaubt, bricht bei Bedarf */}
      <div className="text-sm whitespace-normal break-words">{label}</div>

      {/* Balken + Zahl in eigener Zeile */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 overflow-hidden">
          <div
            className="h-2 bg-emerald-500/80 dark:bg-emerald-400/80"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="w-16 text-right tabular-nums text-sm shrink-0">{value}</div>
      </div>
    </div>
  );
}

// --- Zeitraum ---
function parseDateRange(sp: Search) {
  const r = (sp.range as string) || "30d";
  const now = new Date();
  const end = new Date(now);
  let start = new Date();
  if (r === "7d") start.setDate(end.getDate() - 7);
  else if (r === "30d") start.setDate(end.getDate() - 30);
  else if (r === "90d") start.setDate(end.getDate() - 90);
  else if (r === "365d") start.setDate(end.getDate() - 365);
  else if (r === "all") start = new Date(0);
  else start.setDate(end.getDate() - 30);
  return { range: r, start, end };
}
// --- WHERE aus Filtern ---
function condsFromSearch(sp: Search, start: Date, end: Date) {
  const c: Prisma.Sql[] = [
    Prisma.sql`"createdAt" >= ${start}`,
    Prisma.sql`"createdAt" < ${end}`,
  ];
  const includeBots = sp.bots === "1";
  const includeAdmin = sp.admin === "1";
  if (!includeBots) c.push(Prisma.sql`"isBot" = false`);
  if (!includeAdmin) c.push(Prisma.sql`COALESCE("isAdmin", false) = false`);

  const device = (sp.device as string) || "";
  const browser = (sp.browser as string) || "";
  const lang = (sp.lang as string) || "";
  const country = (sp.country as string) || "";
  const path = (sp.path as string) || "";
  const ref = (sp.ref as string) || "";
  const utmSource = (sp.utm_source as string) || "";
  const utmMedium = (sp.utm_medium as string) || "";
  const utmCampaign = (sp.utm_campaign as string) || "";

  if (device) c.push(Prisma.sql`"device" = ${device}`);
  if (browser) c.push(Prisma.sql`"browser" = ${browser}`);
  if (lang) c.push(Prisma.sql`"lang" = ${lang}`);
  if (country) c.push(Prisma.sql`"country" = ${country}`);
  if (path) c.push(Prisma.sql`"path" ILIKE ${path + "%"}`);
  if (ref) {
    if (ref === "(direct)") c.push(Prisma.sql`"referrerHost" IS NULL`);
    else c.push(Prisma.sql`"referrerHost" = ${ref}`);
  }
  if (utmSource) c.push(Prisma.sql`"utmSource" = ${utmSource}`);
  if (utmMedium) c.push(Prisma.sql`"utmMedium" = ${utmMedium}`);
  if (utmCampaign) c.push(Prisma.sql`"utmCampaign" = ${utmCampaign}`);

  return Prisma.sql`${Prisma.join(c, " AND ")}`;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  // Next.js v14: searchParams ist async
  const sp = await searchParams;

  // Zeitraum
  const { range, end, start: initialStart } = parseDateRange(sp);
  let start = initialStart;
  if (range === "all") {
    const first = await getPrisma().pageview.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } });
    start = first?.createdAt ?? new Date();
  }

  // Optionen für SelectBoxen (distinct)
  const [devs, langs, countries, browsers, paths, refs, utmS, utmM, utmC] = await Promise.all([
    getPrisma().$queryRaw<{ device: string | null; c: bigint }[]>`SELECT "device", COUNT(*) AS c FROM "Pageview" GROUP BY "device" ORDER BY c DESC`,
    getPrisma().$queryRaw<{ lang: string | null; c: bigint }[]>`SELECT "lang", COUNT(*) AS c FROM "Pageview" GROUP BY "lang" ORDER BY c DESC`,
    getPrisma().$queryRaw<{ country: string | null; c: bigint }[]>`SELECT "country", COUNT(*) AS c FROM "Pageview" GROUP BY "country" ORDER BY c DESC`,
    getPrisma().$queryRaw<{ browser: string | null; c: bigint }[]>`SELECT "browser", COUNT(*) AS c FROM "Pageview" GROUP BY "browser" ORDER BY c DESC`,
    getPrisma().$queryRaw<{ path: string; c: bigint }[]>`SELECT "path", COUNT(*) AS c FROM "Pageview" GROUP BY "path" ORDER BY c DESC LIMIT 200`,
    getPrisma().$queryRaw<{ host: string | null; c: bigint }[]>`SELECT "referrerHost" AS host, COUNT(*) AS c FROM "Pageview" GROUP BY host ORDER BY c DESC LIMIT 200`,
    getPrisma().$queryRaw<{ v: string | null; c: bigint }[]>`SELECT "utmSource" AS v, COUNT(*) AS c FROM "Pageview" GROUP BY v ORDER BY c DESC`,
    getPrisma().$queryRaw<{ v: string | null; c: bigint }[]>`SELECT "utmMedium" AS v, COUNT(*) AS c FROM "Pageview" GROUP BY v ORDER BY c DESC`,
    getPrisma().$queryRaw<{ v: string | null; c: bigint }[]>`SELECT "utmCampaign" AS v, COUNT(*) AS c FROM "Pageview" GROUP BY v ORDER BY c DESC`,
  ]);

  const deviceOptions = devs.map(d => d.device).filter((v): v is string => !!v);
  const langOptions = langs.map(l => l.lang).filter((v): v is string => !!v);
  const countryOptions = countries.map(c => c.country).filter((v): v is string => !!v);
  const browserOptions = browsers.map(b => b.browser).filter((v): v is string => !!v);
  const pathOptions = paths.map(p => p.path).filter(Boolean);
  const refOptions = refs.map(r => r.host).filter((v): v is string => !!v);
  const utmSourceOptions = utmS.map(x => x.v).filter((v): v is string => !!v);
  const utmMediumOptions = utmM.map(x => x.v).filter((v): v is string => !!v);
  const utmCampaignOptions = utmC.map(x => x.v).filter((v): v is string => !!v);

  // WHERE
  const where = condsFromSearch(sp, start, end);

  // Timeseries (volle Datenmenge - Summen/Ø korrekt)
  const ts = await getPrisma().$queryRaw<{ day: string; pv: bigint; uniques: bigint }[]>`
    SELECT
      (date_trunc('day', "createdAt" AT TIME ZONE 'Europe/Berlin'))::date AS day,
      COUNT(*) AS pv,
      COUNT(DISTINCT "ipHash") AS uniques
    FROM "Pageview"
    WHERE ${where}
    GROUP BY day
    ORDER BY day ASC
  `;
  const pvData = ts.map(d => ({ x: d.day, y: Number(d.pv) }));
  const uData  = ts.map(d => ({ x: d.day, y: Number(d.uniques) }));

  const [sum] = await getPrisma().$queryRaw<{ pv: bigint; uniques: bigint }[]>`
    SELECT COUNT(*) AS pv, COUNT(DISTINCT "ipHash") AS uniques
    FROM "Pageview" WHERE ${where}
  `;
  const totalPV = Number(sum?.pv || 0);
  const totalU  = Number(sum?.uniques || 0);
  const avgPV   = pvData.length ? Math.round(pvData.reduce((a,b)=>a+b.y,0) / pvData.length) : 0;
  const avgU    = uData.length ? Math.round(uData.reduce((a,b)=>a+b.y,0) / uData.length) : 0;

  // Top-Listen (mit Filtern)
  const [topPages, topRefs, campaigns, deviceDist, langDist, browserDist, countryDist] = await Promise.all([
    getPrisma().$queryRaw<{ path: string; c: bigint }[]>`SELECT "path", COUNT(*) AS c FROM "Pageview" WHERE ${where} GROUP BY "path" ORDER BY c DESC LIMIT 10`,
    getPrisma().$queryRaw<{ host: string | null; c: bigint }[]>`SELECT COALESCE("referrerHost",'(direct)') AS host, COUNT(*) AS c FROM "Pageview" WHERE ${where} GROUP BY host ORDER BY c DESC LIMIT 10`,
    getPrisma().$queryRaw<{ src: string | null; med: string | null; camp: string | null; c: bigint }[]>`
      SELECT COALESCE("utmSource",'(ohne)') AS src, COALESCE("utmMedium",'(ohne)') AS med, COALESCE("utmCampaign",'(ohne)') AS camp, COUNT(*) AS c
      FROM "Pageview" WHERE ${where} GROUP BY src, med, camp ORDER BY c DESC LIMIT 10`,
    getPrisma().$queryRaw<{ device: string | null; c: bigint }[]>`SELECT COALESCE("device",'unknown') AS device, COUNT(*) AS c FROM "Pageview" WHERE ${where} GROUP BY device ORDER BY c DESC`,
    getPrisma().$queryRaw<{ lang: string | null; c: bigint }[]>`SELECT COALESCE("lang",'unknown') AS lang, COUNT(*) AS c FROM "Pageview" WHERE ${where} GROUP BY lang ORDER BY c DESC LIMIT 12`,
    getPrisma().$queryRaw<{ browser: string | null; c: bigint }[]>`SELECT COALESCE("browser",'other') AS browser, COUNT(*) AS c FROM "Pageview" WHERE ${where} GROUP BY browser ORDER BY c DESC LIMIT 12`,
    getPrisma().$queryRaw<{ country: string | null; c: bigint }[]>`SELECT COALESCE("country",'unknown') AS country, COUNT(*) AS c FROM "Pageview" WHERE ${where} GROUP BY country ORDER BY c DESC LIMIT 12`,
  ]);

  const maxPage = topPages[0]?.c ? Number(topPages[0].c) : 0;
  const maxRef  = topRefs[0]?.c ? Number(topRefs[0].c) : 0;
  const maxDev  = deviceDist[0]?.c ? Number(deviceDist[0].c) : 0;
  const maxLang = langDist[0]?.c ? Number(langDist[0].c) : 0;
  const maxBr   = browserDist[0]?.c ? Number(browserDist[0].c) : 0;
  const maxCtry = countryDist[0]?.c ? Number(countryDist[0].c) : 0;

  const capDevice = (d: string | null) => (d ? d[0].toUpperCase() + d.slice(1) : "unknown");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-hidden">
      <AdminPageHeaderServer
        title="Analytics"
        subtitle="Übersichtliche, cookieless Zahlen ohne Cookies oder Identifier."
      />

      {/* Filter */}
      <section className="mb-5">
        <AnalyticsFilters
          initial={{
            range,
            device: (sp.device as string) || "",
            browser: (sp.browser as string) || "",
            lang: (sp.lang as string) || "",
            country: (sp.country as string) || "",
            path: (sp.path as string) || "",
            ref: (sp.ref as string) || "",
            utmSource: (sp.utm_source as string) || "",
            utmMedium: (sp.utm_medium as string) || "",
            utmCampaign: (sp.utm_campaign as string) || "",
            bots: sp.bots === "1",
            admin: sp.admin === "1",
          }}
          options={{
            devices: deviceOptions,
            langs: langOptions,
            countries: countryOptions,
            browsers: browserOptions,
            paths: pathOptions,
            referrers: refOptions,
            utmSources: utmSourceOptions,
            utmMediums: utmMediumOptions,
            utmCampaigns: utmCampaignOptions,
          }}
        />
      </section>

      {/* Seitenaufrufe */}
      <Card
        title="Seitenaufrufe (alle Aufrufe)"
        help="Zählt jeden Seitenaufruf - auch wenn dieselbe Person mehrere Seiten anschaut oder neu lädt. Jeder Aufruf zählt."
      >
        <LineChart data={pvData} yLabel="Anzahl Aufrufe" xLabel="Datum" className="w-full" />
        <div className="mt-3 text-sm opacity-80">Summe im Zeitraum: <span className="font-semibold">{totalPV}</span></div>
        <div className="text-sm opacity-80">Durchschnitt pro Tag: <span className="font-semibold">{avgPV}</span></div>
      </Card>

      {/* Besucher pro Tag */}
      <Card
        title="Besucher pro Tag"
        help="Schätzung: zählt unterschiedliche Besuche pro Tag anhand eines täglich rotierenden, gekürzten IP-Hashs. Keine Cookies; mehrere Personen hinter einem Anschluss können als 1 gezählt werden."
        className="mt-5"
      >
        <LineChart data={uData} yLabel="Besucher" xLabel="Datum" className="w-full" />
        <div className="mt-3 text-sm opacity-80">Summe Besucher pro Tag im Zeitraum: <span className="font-semibold">{totalU}</span></div>
        <div className="text-sm opacity-80">Durchschnitt pro Tag: <span className="font-semibold">{avgU}</span></div>
      </Card>

      {/* Quellen */}
      <Card
        title="Woher kamen die Besucher?"
        help="Wie kamen Menschen auf die Website: direkt, über Suchmaschinen oder über Links (z. B. soziale Medien, E-Mails). „UTM“ sind freiwillige Zusatzangaben in Links, um eigene Aktionen zu benennen."
        className="mt-5"
      >
        {/* Referrer oben */}
        <div>
          <div className="text-sm font-medium mb-2">Quellen (Referrer-Domain)</div>
          <div className="space-y-2">
            {topRefs.map((r, i) => (
              <BarRow key={`${r.host}-${i}`} label={r.host ?? "(direct)"} value={Number(r.c)} max={maxRef} />
            ))}
            {!topRefs.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
          </div>
          <p className="mt-2 text-xs opacity-70">„(direct)“ bedeutet: Adresse eingegeben oder Lesezeichen genutzt.</p>
        </div>

        {/* UTMs darunter */}
        <div className="mt-6">
          <div className="text-sm font-medium mb-2">Eigene Aktionen (UTM)</div>

          {/* Mobile: Kartenliste (kein horizontaler Scroll) */}
          <div className="sm:hidden space-y-2">
            {campaigns.length ? campaigns.map((c, i) => (
              <div key={`${c.src}-${c.med}-${c.camp}-${i}`} className="rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 p-2">
                <div className="text-xs opacity-70">UTM - Quelle</div>
                <div className="text-sm">{c.src}</div>
                <div className="mt-1 text-xs opacity-70">UTM - Medium</div>
                <div className="text-sm">{c.med}</div>
                <div className="mt-1 text-xs opacity-70">UTM - Kampagne</div>
                <div className="text-sm">{c.camp}</div>
                <div className="mt-1 text-xs opacity-70 text-right">Aufrufe: <span className="font-medium">{Number(c.c)}</span></div>
              </div>
            )) : <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
          </div>

          {/* Ab sm: Tabelle */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase opacity-70">
                <tr>
                  <th className="py-2 pr-3">UTM - Quelle</th>
                  <th className="py-2 pr-3">UTM - Medium</th>
                  <th className="py-2 pr-3">UTM - Kampagne</th>
                  <th className="py-2 text-right">Aufrufe</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {campaigns.map((c, i) => (
                  <tr key={`${c.src}-${c.med}-${c.camp}-${i}`} className="border-t border-zinc-200/50 dark:border-zinc-800/60">
                    <td className="py-2 pr-3">{c.src}</td>
                    <td className="py-2 pr-3">{c.med}</td>
                    <td className="py-2 pr-3">{c.camp}</td>
                    <td className="py-2 text-right tabular-nums">{Number(c.c)}</td>
                  </tr>
                ))}
                {!campaigns.length && (
                  <tr><td className="py-2" colSpan={4}>Keine Daten vorhanden</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Inhalte & Technik */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card title="Beliebte Seiten" help="Welche Seiten im Zeitraum am häufigsten besucht wurden.">
          <div className="space-y-2">
            {topPages.map((r) => (
              <BarRow key={r.path} label={r.path} value={Number(r.c)} max={maxPage} />
            ))}
            {!topPages.length && <div className="text-sm opacity-70">Keine Daten vorhanden</div>}
          </div>
        </Card>

        <Card
          title="Geräte, Browser, Sprachen & Länder"
          help="Mit welchen Geräten und Browsern wird die Seite genutzt? In welcher Sprache und aus welchen Ländern kommen die Aufrufe?"
        >
          {/* Kategorie 1: Geräte & Browser */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium mb-1 opacity-75">Geräte</div>
              <div className="space-y-3">
                {deviceDist.map((d, i) => (
                  <BarRow key={`${d.device}-${i}`} label={capDevice(d.device)} value={Number(d.c)} max={maxDev} />
                ))}
                {!deviceDist.length && <div className="text-sm opacity-70">Keine Daten</div>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium mb-1 opacity-75">Browser</div>
              <div className="space-y-3">
                {browserDist.map((b, i) => (
                  <BarRow key={`${b.browser}-${i}`} label={b.browser ?? "other"} value={Number(b.c)} max={maxBr} />
                ))}
                {!browserDist.length && <div className="text-sm opacity-70">Keine Daten</div>}
              </div>
            </div>
          </div>

          {/* Horizontaler Trenner zwischen den zwei Kategorien */}
          <div className="my-6 border-t border-zinc-200/60 dark:border-zinc-800/60" />

          {/* Kategorie 2: Sprachen & Länder */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium mb-1 opacity-75">Sprachen</div>
              <div className="space-y-3">
                {langDist.map((l, i) => (
                  <BarRow key={`${l.lang}-${i}`} label={l.lang ?? "unknown"} value={Number(l.c)} max={maxLang} />
                ))}
                {!langDist.length && <div className="text-sm opacity-70">Keine Daten</div>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium mb-1 opacity-75">Länder</div>
              <div className="space-y-3">
                {countryDist.map((c, i) => (
                  <BarRow key={`${c.country}-${i}`} label={c.country ?? "unknown"} value={Number(c.c)} max={maxCtry} />
                ))}
                {!countryDist.length && <div className="text-sm opacity-70">Keine Daten</div>}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Aufbewahrung */}
      <Card
        title="Aufbewahrung der Daten"
        help="Aktuell ist kein Aufbewahrungszeitraum vorgesehen - die Daten werden daher unbefristet gespeichert. Das lässt sich später jederzeit anpassen (z. B. 90 Tage Rohdaten, langfristig Tageswerte)."
        className="mt-5"
      >
        <p className="text-sm opacity-90">Sag Bescheid, wenn ich Dir Lösch-/Archiv-Jobs einbauen soll.</p>
      </Card>
    </main>
  );
}
