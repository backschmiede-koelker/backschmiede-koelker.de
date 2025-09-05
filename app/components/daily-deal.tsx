import { headers } from "next/headers";
import { euro } from "../lib/format";

// ---------- Types ----------
type LocationKey = "RECKE" | "METTINGEN";
type OfferKind = "RECURRING_WEEKDAY" | "ONE_DAY" | "DATE_RANGE";
type Weekday =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

type OfferProductRole =
  | "QUALIFIER"
  | "REWARD_FREE"
  | "REWARD_DISCOUNTED"
  | "BUNDLE_COMPONENT"
  | "CHOICE_QUALIFIER"
  | "CHOICE_REWARD";

type OfferProductLink = {
  role: OfferProductRole;
  quantity: number;
  perItemPriceCents: number | null;
  product: { id: string; name: string; priceCents: number; unit: string };
};

type OfferDetail = {
  id: string;
  title: string;
  description?: string | null;
  priceCents?: number | null;
  originalPriceCents?: number | null;
  unit?: string | null;
  imageUrl?: string | null;
  kind: OfferKind;
  weekday?: Weekday | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  locations: LocationKey[];
  tags?: string[];
  products: OfferProductLink[];
};

// ---------- Base URL (ohne Vercel-Kram) ----------
async function getBaseUrl() {
  // Optional feste Domain in .env: SITE_URL="https://deine-domain.tld"
  const envBase = process.env.SITE_URL?.replace(/\/+$/, "");
  if (envBase) return envBase;

  // Aus Request-Headern ableiten
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

// ---------- Helpers ----------
function formatDateISO(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}
function formatDay(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" }).format(d);
}
function weekdayLabel(w?: Weekday | null) {
  const map: Record<Weekday, string> = {
    MONDAY: "Montag", TUESDAY: "Dienstag", WEDNESDAY: "Mittwoch",
    THURSDAY: "Donnerstag", FRIDAY: "Freitag", SATURDAY: "Samstag", SUNDAY: "Sonntag",
  };
  return w ? map[w] : "";
}
function kindBadge(o: Pick<OfferDetail, "kind"|"weekday"|"date"|"startDate"|"endDate">) {
  if (o.kind === "ONE_DAY") return `Nur am ${formatDay(o.date)}`;
  if (o.kind === "RECURRING_WEEKDAY") return `Jeden ${weekdayLabel(o.weekday!)}`;
  return `Gültig ${formatDateISO(o.startDate)} – ${formatDateISO(o.endDate)}`;
}
function qtyLabel(q: number) { return `${q}×`; }
function groupsByRole(links: OfferProductLink[]) {
  const by: Record<OfferProductRole, OfferProductLink[]> = {
    QUALIFIER: [], REWARD_FREE: [], REWARD_DISCOUNTED: [],
    BUNDLE_COMPONENT: [], CHOICE_QUALIFIER: [], CHOICE_REWARD: [],
  };
  for (const l of links) by[l.role].push(l);
  return by;
}
function priceWithUnit(cents?: number | null, unit?: string | null) {
  if (typeof cents !== "number") return "";
  const u = (unit || "").trim();
  return `${euro(cents)}${u ? ` / ${u}` : ""}`;
}

// ---------- Data ----------
async function fetchDailyId(location?: LocationKey) {
  const base = await getBaseUrl();
  const qs = new URLSearchParams({ type: "daily" });
  if (location) qs.set("location", location);
  const res = await fetch(`${base}/api/offers?${qs.toString()}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed daily list");
  const data = (await res.json()) as { items: Array<{ id: string }> };
  return data.items?.[0]?.id as string | undefined;
}
async function fetchOfferDetail(id: string): Promise<OfferDetail> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/offers/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed offer detail");
  return res.json();
}

// ---------- UI ----------
export default async function DailyDeal({ location }: { location?: LocationKey }) {
  try {
    const id = await fetchDailyId(location);
    if (!id) {
      return (
        <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-emerald-50/60 dark:bg-emerald-900/10">
          <p className="text-sm opacity-70">Heute gibt es leider keine Tagesangebote.</p>
        </div>
      );
    }
    const offer = await fetchOfferDetail(id);
    const by = groupsByRole(offer.products);
    const hasNow = typeof offer.priceCents === "number";
    const hasOriginal = typeof offer.originalPriceCents === "number" && (offer.originalPriceCents as number) > 0;
    const unit = (offer.unit || "").trim();
    const hasBundle = by.BUNDLE_COMPONENT.length > 0;

    return (
      <article className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr),1.1fr] items-stretch rounded-3xl ring-1 ring-emerald-500/25 bg-gradient-to-br from-emerald-50/70 to-emerald-100/50 dark:from-emerald-900/10 dark:to-emerald-800/10 p-4 sm:p-5">
        {/* Bild */}
        {offer.imageUrl ? (
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={offer.imageUrl} alt={offer.title} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="rounded-2xl bg-white/70 dark:bg-zinc-900/40 ring-1 ring-black/5 dark:ring-white/10" />
        )}

        {/* Inhalt */}
        <div className="flex min-w-0 flex-col">
          <header className="mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-700/20 dark:text-emerald-200 dark:ring-emerald-300/20">
                Heutiges Angebot
              </span>
              <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] text-zinc-700 ring-1 ring-black/10 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10">
                {kindBadge(offer)}
              </span>
              {offer.locations?.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] text-zinc-700 ring-1 ring-black/10 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10">
                  {offer.locations.map(l => l === "RECKE" ? "Recke" : "Mettingen").join(" · ")}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-2xl font-bold leading-tight">{offer.title}</h3>

            {(offer.description || hasNow || hasOriginal) && (
              <p className="mt-1 text-sm">
                {offer.description ?? ""}
              </p>
            )}
          </header>

          {/* Preisblock */}
          {(hasOriginal || hasNow || hasBundle) && (
            <div className="mt-1 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {hasOriginal && (
                <span className="text-sm tabular-nums text-zinc-500 line-through">
                  {priceWithUnit(offer.originalPriceCents!, unit)}
                </span>
              )}
              {hasNow && (
                <span className="text-lg font-extrabold tabular-nums">
                  {priceWithUnit(offer.priceCents!, unit)}
                </span>
              )}
              {hasBundle && (
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium ring-1 ring-amber-500/20 dark:text-amber-200">
                  Set-Preis
                </span>
              )}
            </div>
          )}

          {/* Rollen-Gruppen */}
          <div className="mt-3 grid gap-3">
            {by.BUNDLE_COMPONENT.length > 0 && (
              <RoleGroup title="Im Set enthalten" items={by.BUNDLE_COMPONENT} tone="amber" />
            )}
            {by.QUALIFIER.length > 0 && (
              <RoleGroup title="Kaufe" items={by.QUALIFIER} tone="zinc" />
            )}
            {by.CHOICE_QUALIFIER.length > 0 && (
              <RoleGroup title="Wähle als Kaufbedingung" items={by.CHOICE_QUALIFIER} tone="zinc" choice />
            )}
            {by.REWARD_FREE.length > 0 && (
              <RoleGroup title="Gratis dazu" items={by.REWARD_FREE} tone="emerald" free />
            )}
            {by.REWARD_DISCOUNTED.length > 0 && (
              <RoleGroup title="Dazu reduziert" items={by.REWARD_DISCOUNTED} tone="emerald" />
            )}
            {by.CHOICE_REWARD.length > 0 && (
              <RoleGroup title="Deine Wahl als Zugabe" items={by.CHOICE_REWARD} tone="emerald" choice />
            )}
          </div>

          {/* Tags */}
          {Array.isArray(offer.tags) && offer.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {offer.tags.slice(0, 6).map(t => (
                <span key={t} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  } catch {
    return (
      <div className="rounded-2xl p-5 ring-1 ring-emerald-600/20 bg-emerald-50/60 dark:bg-emerald-900/10">
        <p className="text-sm opacity-70">Tagesangebot konnte gerade nicht geladen werden.</p>
      </div>
    );
  }
}

// ---------- Subcomponents ----------
function RoleGroup({
  title,
  items,
  tone = "zinc",
  free = false,
  choice = false,
}: {
  title: string;
  items: OfferProductLink[];
  tone?: "zinc" | "emerald" | "amber";
  free?: boolean;
  choice?: boolean;
}) {
  const toneRing =
    tone === "emerald" ? "ring-emerald-500/20" : tone === "amber" ? "ring-amber-500/20" : "ring-black/10 dark:ring-white/10";
  const toneBg =
    tone === "emerald" ? "bg-emerald-50/70 dark:bg-emerald-900/10" : tone === "amber" ? "bg-amber-50/70 dark:bg-amber-900/10" : "bg-white/70 dark:bg-zinc-900/30";
  return (
    <section className={`rounded-xl p-3 ring-1 ${toneRing} ${toneBg}`}>
      <h4 className="text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-200">
        {title}{choice ? " (Auswahl)" : ""}
      </h4>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((it, idx) => {
          const left = (
            <span className="inline-flex min-w-0 items-baseline gap-2">
              <span className="shrink-0 rounded-md bg-black/5 px-1.5 py-0.5 text-[11px] tabular-nums dark:bg-white/10">
                {qtyLabel(it.quantity)}
              </span>
              <span className="truncate">{it.product.name}</span>
            </span>
          );
          const price =
            free ? (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">GRATIS</span>
            ) : typeof it.perItemPriceCents === "number" ? (
              <span className="text-xs tabular-nums">{euro(it.perItemPriceCents)}</span>
            ) : null;

          return (
            <li key={`${it.product.id}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
              {left}
              {price}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
