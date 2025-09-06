import { headers } from "next/headers";
import { formatEUR } from "../lib/format";

// ---------- Types ----------
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
  tags?: string[];
  kind: "RECURRING_WEEKDAY" | "ONE_DAY" | "DATE_RANGE";
  weekday?: "MONDAY"|"TUESDAY"|"WEDNESDAY"|"THURSDAY"|"FRIDAY"|"SATURDAY"|"SUNDAY"|null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  products: OfferProductLink[];
};

type WeeklyResponse = { from: string; to: string; items: Array<{ id: string }> };

// ---------- Base URL ----------
async function getBaseUrl() {
  const envBase = process.env.SITE_URL?.replace(/\/+$/, "");
  if (envBase) return envBase;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

// ---------- Helpers ----------
function rangeLabel(fromISO: string, toISO: string) {
  const from = new Date(fromISO), to = new Date(toISO);
  const f = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(from);
  const t = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(to);
  return `${f} - ${t}`;
}
function roleChipText(link: OfferProductLink) {
  const q = `${link.quantity}×`;
  switch (link.role) {
    case "BUNDLE_COMPONENT": return `${q} ${link.product.name} (Set)`;
    case "QUALIFIER": return `${q} ${link.product.name} (Kaufe)`;
    case "CHOICE_QUALIFIER": return `${q} ${link.product.name} (Kauf-Auswahl)`;
    case "REWARD_FREE": return `${q} ${link.product.name} (gratis)`;
    case "REWARD_DISCOUNTED": {
      const p = typeof link.perItemPriceCents === "number" ? ` ${formatEUR(link.perItemPriceCents/100)}` : "";
      return `${q} ${link.product.name}${p ? ` (je${p})` : " (reduziert)"}`;
    }
    case "CHOICE_REWARD": return `${q} ${link.product.name} (Zugabe-Auswahl)`;
  }
}

// ---------- Data ----------
async function fetchWeekly(): Promise<WeeklyResponse> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/offers?type=weekly`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed weekly list");
  return res.json();
}
async function fetchOfferDetail(id: string): Promise<OfferDetail> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/offers/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed offer detail");
  return res.json();
}

// ---------- UI ----------
export default async function WeeklyDeals() {
  const data = await fetchWeekly();

  if (!data || data.items.length === 0) {
    return (
      <section className="relative rounded-3xl p-6 ring-1 ring-amber-500/25 bg-gradient-to-br from-amber-50/70 to-amber-100/40 dark:from-amber-900/10 dark:to-amber-800/10">
        <header className="mb-2">
          <h3 className="text-2xl font-semibold leading-tight">Angebote dieser Woche</h3>
          <p className="text-xs opacity-70">Gültig {rangeLabel(data?.from ?? "", data?.to ?? "")}</p>
        </header>
        <div className="rounded-xl border border-amber-500/20 bg-white/70 dark:bg-zinc-900/60 p-5 text-sm shadow-sm">
          Diese Woche sind gerade keine Angebote eingetragen.
        </div>
      </section>
    );
  }

  const details = await Promise.all(data.items.map(i => fetchOfferDetail(i.id)));

  return (
    <section className="relative rounded-3xl p-6 md:p-7 ring-1 ring-amber-500/25 bg-gradient-to-br from-amber-50/70 to-amber-100/40 dark:from-amber-900/10 dark:to-amber-800/10">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold leading-tight">Angebote dieser Woche</h3>
          <p className="text-xs opacity-70">Gültig {rangeLabel(data.from, data.to)}</p>
        </div>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((it) => {
          const hasOriginal = typeof it.originalPriceCents === "number" && (it.originalPriceCents as number) > 0;
          const hasNow = typeof it.priceCents === "number";
          const unit = (it.unit || "").trim();
          const chips = it.products.slice(0, 6).map(roleChipText);

          return (
            <li key={it.id} className="group overflow-hidden rounded-2xl bg-white/90 dark:bg-zinc-900/70 ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
              {it.imageUrl && (
                <div className="aspect-[5/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-lg font-semibold leading-tight">{it.title}</h4>

                  <div className="shrink-0 text-right">
                    {hasOriginal && (
                      <div className="text-xs line-through text-zinc-500 tabular-nums">
                        {formatEUR((it.originalPriceCents as number)/100)}{unit ? ` / ${unit}` : ""}
                      </div>
                    )}
                    {hasNow && (
                      <div className="text-base font-bold tabular-nums">
                        {formatEUR((it.priceCents as number)/100)}{unit ? ` / ${unit}` : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Zeitraum / Art */}
                <KindRow item={it} className="mt-0.5" />

                {it.description && <p className="mt-2 text-sm opacity-90">{it.description}</p>}

                {/* Rollen-Zusammenfassung */}
                {chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {chips.map((c, idx) => (
                      <span
                        key={`${it.id}-chip-${idx}`}
                        className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide opacity-80"
                        title={c}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(it.tags) && it.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {it.tags.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function KindRow({ item, className = "" }: { item: OfferDetail; className?: string }) {
  const dd = (iso?: string | null) =>
    iso ? new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso)) : "";
  const dm = (iso?: string | null) =>
    iso ? new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(new Date(iso)) : "";
  const weekdayMap: Record<NonNullable<OfferDetail["weekday"]>, string> = {
    MONDAY: "Montag", TUESDAY: "Dienstag", WEDNESDAY: "Mittwoch",
    THURSDAY: "Donnerstag", FRIDAY: "Freitag", SATURDAY: "Samstag", SUNDAY: "Sonntag",
  };

  let label = "";
  if (item.kind === "ONE_DAY") label = `Nur am ${dm(item.date)}`;
  else if (item.kind === "RECURRING_WEEKDAY" && item.weekday) label = `Jeden ${weekdayMap[item.weekday]}`;
  else label = `Gültig ${dd(item.startDate)} - ${dd(item.endDate)}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium ring-1 ring-amber-500/20">
        {label}
      </span>
    </div>
  );
}
