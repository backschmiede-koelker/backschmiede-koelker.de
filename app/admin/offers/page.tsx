"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductPicker from "@/app/components/product-picker";
import SelectBox from "@/app/components/select-box";
import ImageUploader from "@/app/components/image-uploader";
import { PRICE_RE, parseEuroToCents, euro, centsToEuroString } from "@/app/lib/format";
import { OfferKind, Weekday, Location, OfferType } from "@prisma/client";
import OfferCard from "@/app/components/offer-card";

type ProductLite = { id: string; name: string; priceCents: number; unit: string };
type OfferDTO = import("../../components/offer-renderer").OfferDTO;

const WEEKDAY_OPTIONS: { label: string; value: Weekday }[] = [
  { label: "Montag", value: Weekday.MONDAY },
  { label: "Dienstag", value: Weekday.TUESDAY },
  { label: "Mittwoch", value: Weekday.WEDNESDAY },
  { label: "Donnerstag", value: Weekday.THURSDAY },
  { label: "Freitag", value: Weekday.FRIDAY },
  { label: "Samstag", value: Weekday.SATURDAY },
  { label: "Sonntag", value: Weekday.SUNDAY },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-[10px] ring-1 ring-black/10">
      {children}
    </span>
  );
}

/** Tooltip als fixed Overlay, damit er immer über der Erfassungsbox / Seite liegt */
function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const btnRef = useRef<HTMLSpanElement | null>(null);

  function place() {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pageX = r.left + window.scrollX;
    const pageY = r.bottom + window.scrollY + 8;
    const maxLeft = Math.max(8, Math.min(pageX, window.scrollX + window.innerWidth - 256 - 8));
    setPos({ left: maxLeft, top: pageY });
  }

  useEffect(() => {
    if (!open) return;
    function onScroll() { place(); }
    function onResize() { place(); }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <span className="relative ml-1 inline-flex">
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-[10px] leading-none text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100"
        aria-label="Hinweis"
      >
        ?
      </span>
      <span
        className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-normal rounded-md bg-zinc-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg ring-1 ring-black/20 transition group-hover:opacity-100 group-focus-within:opacity-100 sm:block
                  min-w-[18rem] max-w-[min(36rem,90vw)] break-words"
      >
        {text}
      </span>
    </span>
  );
}

function FieldLabel({
  children,
  hint,
  className,
}: {
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`text-sm font-medium ${className || ""}`}>
      <span className="group inline-flex items-center">
        {children}
        {hint ? <HelpTip text={hint} /> : null}
      </span>
    </label>
  );
}

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export default function AdminOffers() {
  const [items, setItems] = useState<OfferDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Einheiten aus allen Produkten
  const [allUnits, setAllUnits] = useState<string[]>(["pro Stück"]);

  async function reload() {
    setLoading(true);
    try {
      const res = await fetch("/api/offers?type=all&limit=1000", { cache: "no-store" });
      const j = await res.json();
      setItems(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    let alive = true;

    function parseProductsJson(json: any) {
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.items)) return json.items;
      return [];
    }

    (async () => {
      try {
        // Ohne query: Array; Mit query: { items: [...] }
        // Wir nehmen „ohne query“ (max 50) – reicht zum Einsammeln der Units.
        const res = await fetch("/api/products?limit=50", { cache: "no-store" });
        const json = await res.json();
        const items = parseProductsJson(json);

        const units = new Set<string>(["pro Stück"]);
        items.forEach((p: any) => {
          const u = (p?.unit || "").trim();
          if (u) units.add(u);
        });

        if (alive) {
          setAllUnits(Array.from(units).sort((a, b) => a.localeCompare(b, "de")));
        }
      } catch {
        // im Fehlerfall wenigstens den Default lassen
        if (alive) setAllUnits(["pro Stück"]);
      }
    })();

    return () => { alive = false; };
  }, []);

  // ====== ERFASSUNG ======
  const [type, setType] = useState<OfferType>("GENERIC");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [kind, setKind] = useState<OfferKind>(OfferKind.DATE_RANGE);
  const [weekday, setWeekday] = useState<Weekday>(Weekday.MONDAY);
  const [date, setDate] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [locations, setLocations] = useState<Location[]>([Location.RECKE, Location.METTINGEN]);
  const [priority, setPriority] = useState<number>(0);
  const [minSpend, setMinSpend] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // payload je Typ
  const [pNew, setPNew] = useState<{ product: ProductLite | null; label: string }>({ product: null, label: "NEU" });

  const [pDisc, setPDisc] = useState<{ product: ProductLite | null; price: string; original: string; unit: string }>({
    product: null, price: "", original: "", unit: ""
  });
  const [pDiscCustomMode, setPDiscCustomMode] = useState(false);
  const [pDiscCustomUnit, setPDiscCustomUnit] = useState("");

  const [pMulti, setPMulti] = useState<{ product: ProductLite | null; qty: string; price: string; compareQty: string; comparePrice: string; unit: string; }>({
    product: null, qty: "", price: "", compareQty: "", comparePrice: "", unit: ""
  });
  const [pMultiCustomMode, setPMultiCustomMode] = useState(false);
  const [pMultiCustomUnit, setPMultiCustomUnit] = useState("");

  // Defaults: Woche Mo–So beim ersten Laden
  useEffect(() => {
    if (startDate || endDate) return;
    const now = new Date();
    const js = now.getDay();
    const moOffset = (js + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - moOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setStart(toYMD(monday));
    setEnd(toYMD(sunday));
  }, [startDate, endDate]);

  function setKindWithDefaults(k: OfferKind) {
    setKind(k);
    if (k === OfferKind.ONE_DAY && !date) setDate(toYMD(new Date()));
  }

  // Standard-Einheit, sobald Units da sind
  useEffect(() => {
    const def = allUnits.includes("pro Stück") ? "pro Stück" : (allUnits[0] || "");
    if (!pDisc.unit) setPDisc(s => ({ ...s, unit: def }));
    if (!pMulti.unit) setPMulti(s => ({ ...s, unit: def }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUnits]);

  function toggleLoc(l: Location) {
    setLocations((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]));
  }

  const validBase =
    title.trim() &&
    ((kind === "DATE_RANGE" && startDate && endDate) ||
      (kind === "ONE_DAY" && date) ||
      (kind === "RECURRING_WEEKDAY" && weekday));

  const discPreview = useMemo(() => {
    if (!pDisc.product || !PRICE_RE.test(pDisc.price)) return null;
    const newCents = parseEuroToCents(pDisc.price);
    const origCents = pDisc.original && PRICE_RE.test(pDisc.original) ? parseEuroToCents(pDisc.original) : null;
    return { newCents, origCents };
  }, [pDisc]);

  const multiPreview = useMemo(() => {
    const qtyNum = Number(pMulti.qty);
    const hasQty = Number.isFinite(qtyNum) && qtyNum > 0;
    if (!pMulti.product || !PRICE_RE.test(pMulti.price) || !hasQty) return null;
    const packCents = parseEuroToCents(pMulti.price);
    const cQty = pMulti.compareQty && Number.isFinite(Number(pMulti.compareQty)) ? Number(pMulti.compareQty) : null;
    const cPrice = pMulti.comparePrice && PRICE_RE.test(pMulti.comparePrice) ? parseEuroToCents(pMulti.comparePrice) : null;
    return { packCents, qtyNum, cQty, cPrice };
  }, [pMulti]);

  async function create() {
    if (!validBase) {
      alert("Bitte Titel und Zeitraum ausfüllen.");
      return;
    }
    setCreating(true);
    try {
      const base: any = {
        title: title.trim(),
        subtitle: description.trim() || null,
        imageUrl: imageUrl || null,
        tags: [],
        isActive,
        kind,
        locations,
        priority: Number.isFinite(Number(priority)) ? Number(priority) : 0,
        minBasketCents: minSpend ? parseEuroToCents(minSpend) : null,
      };
      if (kind === "RECURRING_WEEKDAY") base.weekday = weekday;
      if (kind === "ONE_DAY") base.date = date;
      if (kind === "DATE_RANGE") { base.startDate = startDate; base.endDate = endDate; }

      let payload: any = {};
      if (type === "GENERIC") payload = { body: description || "", ctaLabel: null, ctaHref: null };
      if (type === "PRODUCT_NEW") {
        if (!pNew.product) return alert("Bitte Produkt auswählen.");
        payload = { productId: pNew.product.id, highlightLabel: pNew.label || "NEU" };
      }
      if (type === "PRODUCT_DISCOUNT") {
        if (!pDisc.product) return alert("Bitte Produkt auswählen.");
        if (!PRICE_RE.test(pDisc.price)) return alert("Bitte gültigen Preis eingeben.");
        const finalUnit = pDiscCustomMode ? (pDiscCustomUnit || "").trim() : (pDisc.unit || "").trim();
        payload = {
          productId: pDisc.product.id,
          priceCents: parseEuroToCents(pDisc.price),
          originalPriceCents: pDisc.original && PRICE_RE.test(pDisc.original) ? parseEuroToCents(pDisc.original) : null,
          unit: finalUnit || null,
        };
      }
      if (type === "MULTIBUY_PRICE") {
        if (!pMulti.product) return alert("Bitte Produkt auswählen.");
        const qty = Number(pMulti.qty);
        if (!Number.isFinite(qty) || qty <= 0) return alert("Bitte eine gültige Menge eingeben.");
        if (!PRICE_RE.test(pMulti.price)) return alert("Bitte gültigen Set-Preis eingeben.");
        const finalUnit = pMultiCustomMode ? (pMultiCustomUnit || "").trim() : (pMulti.unit || "").trim();
        payload = {
          productId: pMulti.product.id,
          packQty: Math.max(1, qty),
          packPriceCents: parseEuroToCents(pMulti.price),
          comparePackQty: pMulti.compareQty && Number.isFinite(Number(pMulti.compareQty)) ? Number(pMulti.compareQty) : null,
          comparePriceCents: pMulti.comparePrice && PRICE_RE.test(pMulti.comparePrice) ? parseEuroToCents(pMulti.comparePrice) : null,
          unit: finalUnit || null,
        };
      }

      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, base, payload }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Fehler beim Anlegen");
        return;
      }

      // Reset & reload
      setTitle(""); setDescription(""); setImageUrl("");
      setKind(OfferKind.DATE_RANGE); setWeekday(Weekday.MONDAY);
      setDate(""); setStart(""); setEnd("");
      setLocations([Location.RECKE, Location.METTINGEN]);
      setPriority(0); setMinSpend(""); setIsActive(true);
      setPNew({ product: null, label: "NEU" });
      setPDisc({ product: null, price: "", original: "", unit: "" });
      setPDiscCustomMode(false); setPDiscCustomUnit("");
      setPMulti({ product: null, qty: "", price: "", compareQty: "", comparePrice: "", unit: "" });
      setPMultiCustomMode(false); setPMultiCustomUnit("");
      await reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Angebote</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Wähle unten einen <b>Typ</b> und fülle nur die wenigen Felder aus. Fertig.
        </p>
      </header>

      {/* ERFASSUNG – relative + overflow visible + hoher z-index für Overlays */}
      <section className="relative z-30 overflow-visible rounded-2xl border bg-white/90 p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/80 dark:ring-white/10">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { key: "GENERIC", title: "Allgemein", hint: "Hinweis, Aktion, Platzhalter" },
            { key: "PRODUCT_NEW", title: "Jetzt neu", hint: "Neues Produkt zeigen" },
            { key: "PRODUCT_DISCOUNT", title: "Produkt reduziert", hint: "Neuer Preis (optional statt)" },
            { key: "MULTIBUY_PRICE", title: "Mehr für weniger", hint: "z. B. 5 Stück für 1,80 €" },
          ] as const).map((c) => {
            const active = type === (c.key as OfferType);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setType(c.key as OfferType)}
                className={[
                  "rounded-xl p-3 text-left ring-1 transition",
                  active
                    ? "bg-amber-50 ring-amber-300 dark:bg-amber-900/20 dark:ring-amber-700"
                    : "bg-white ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-800/80",
                ].join(" ")}
              >
                <div className="font-medium">{c.title}</div>
                <div className="text-xs opacity-80">{c.hint}</div>
              </button>
            );
          })}
        </div>

        {/* BASIS-FELDER */}
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="min-w-0">
              <FieldLabel hint="Kurzer, knackiger Titel – damit Kund:innen sofort verstehen, worum es geht.">Titel</FieldLabel>
              <input
                className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='z. B. "5 Weizen 1,80 €"'
              />
            </div>

            <div className="min-w-0">
              <FieldLabel hint="Hier kannst du ein paar Worte ergänzen: Was ist besonders? Für wen? Wie lange?">
                Beschreibung (optional)
              </FieldLabel>
              <textarea
                rows={5}
                className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='z. B. "Diese Woche im Angebot"'
              />
            </div>
          </div>

          {/* Bild-Uploader */}
          <div className="min-w-0">
            <FieldLabel hint="Ein Bild macht das Angebot deutlich ansprechender. Zieh eine Datei rein oder klicke auf „Datei wählen“.">
              Bild (optional)
            </FieldLabel>
            <div className="mt-1">
              <ImageUploader folder="offers" imageUrl={imageUrl} onChange={setImageUrl} />
            </div>
          </div>

          {/* Zeit + Filialen + Priorität */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Zeitraumwahl */}
            <div className="md:col-span-2 grid gap-2 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === OfferKind.DATE_RANGE}
                  onChange={() => setKindWithDefaults(OfferKind.DATE_RANGE)}
                />
                <span>Zeitraum <span className="text-xs text-zinc-500">(z. B. Mo–So)</span></span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === OfferKind.ONE_DAY}
                  onChange={() => setKindWithDefaults(OfferKind.ONE_DAY)}
                />
                <span>Ein Tag</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === OfferKind.RECURRING_WEEKDAY}
                  onChange={() => setKindWithDefaults(OfferKind.RECURRING_WEEKDAY)}
                />
                <span>Wöchentlich</span>
              </label>
            </div>

            {/* Datumsfelder */}
            {kind === OfferKind.DATE_RANGE ? (
              <>
                <div className="min-w-0">
                  <FieldLabel hint="Erster Gültigkeitstag des Angebots.">Start</FieldLabel>
                  <input
                    className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel hint="Letzter Gültigkeitstag des Angebots.">Ende</FieldLabel>
                  <input
                    className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </>
            ) : kind === OfferKind.ONE_DAY ? (
              <>
                <div className="min-w-0">
                  <FieldLabel hint="Nur für einen bestimmten Tag gültig.">Datum</FieldLabel>
                  <input
                    className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div aria-hidden />
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <FieldLabel hint="An welchem Wochentag soll dieses Angebot jede Woche gelten?">Wochentag</FieldLabel>
                  <div className="mt-1">
                    <SelectBox
                      ariaLabel="Wochentag wählen"
                      value={WEEKDAY_OPTIONS.find((w) => w.value === weekday)?.label || "Montag"}
                      onChange={(label) => {
                        const found = WEEKDAY_OPTIONS.find((w) => w.label === label);
                        if (found) setWeekday(found.value);
                      }}
                      options={WEEKDAY_OPTIONS.map((w) => w.label)}
                      className="w-full min-w-0"
                    />
                  </div>
                </div>
                <div aria-hidden />
              </>
            )}

            {/* REIHE 2: Filialen / Priorität */}
            <div className="min-w-0">
              <FieldLabel hint="In welchen Filialen gilt das Angebot? Standard: beide.">Filialen</FieldLabel>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {([Location.RECKE, Location.METTINGEN] as const).map((l) => {
                  const active = locations.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLoc(l)}
                      className={[
                        "rounded-full px-3 py-1 text-xs ring-1",
                        active
                          ? "bg-emerald-100 ring-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:ring-emerald-700 dark:text-emerald-200"
                          : "bg-zinc-100 ring-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200",
                      ].join(" ")}
                    >
                      {l === Location.RECKE ? "Recke" : "Mettingen"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              <FieldLabel hint="Höhere Zahl = weiter oben in der Liste. Normalerweise 0 lassen.">Priorität</FieldLabel>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Ab Einkaufswert */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="min-w-0">
              <FieldLabel hint="Nur wenn das Angebot erst ab einem bestimmten Einkaufswert gelten soll. Sonst leer lassen.">
                Ab Einkaufswert (optional)
              </FieldLabel>
              <div className="relative">
                <input
                  className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                  placeholder="z. B. 10,00"
                  value={minSpend}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\./g, ",");
                    if (v === "" || PRICE_RE.test(v)) setMinSpend(v);
                  }}
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
              </div>
            </div>
          </div>
        </div>

        {/* TYP-SPEZIFISCHE FELDER */}
        <div className="mt-6 grid gap-4">
          {type === "GENERIC" && (
            <div className="rounded-xl border p-4">
              <div className="font-medium">Allgemein</div>
              <p className="mt-1 text-sm text-zinc-600">Für Hinweise, Aktionen oder Platzhalter ohne Produktbezug.</p>
              <ul className="mt-2 list-disc pl-5 text-xs text-zinc-600">
                <li><b>Bild</b> (optional) macht die Kachel auffällig.</li>
                <li><b>Titel</b> ist die Überschrift auf der Kachel.</li>
                <li><b>Beschreibung</b> ist der Text der Kachel.</li>
              </ul>
            </div>
          )}

          {type === "PRODUCT_NEW" && (
            <div className="rounded-xl border p-3 grid gap-3">
              <div className="font-medium">Jetzt neu</div>
              <div className="text-xs text-zinc-600">Wähle das neue Produkt aus und gib bei Bedarf ein kurzes Label ein.</div>
              <ProductPicker value={pNew.product} onChange={(p) => setPNew((s) => ({ ...s, product: p }))} />
              <div>
                <FieldLabel>Label</FieldLabel>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  value={pNew.label}
                  onChange={(e) => setPNew((s) => ({ ...s, label: e.target.value }))}
                />
              </div>
            </div>
          )}

          {type === "PRODUCT_DISCOUNT" && (
            <div className="rounded-xl border p-3 grid gap-3">
              <div className="font-medium">Produkt reduziert</div>
              <div className="text-xs text-zinc-600">Neuen Preis eintragen, optional „Statt“-Preis.</div>

              <ProductPicker
                value={pDisc.product}
                onChange={(p) =>
                  setPDisc((s) => ({
                    ...s,
                    product: p,
                    unit: s.unit || p?.unit || "pro Stück",
                    original: p ? centsToEuroString(p.priceCents) : s.original,
                  }))
                }
              />

              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <FieldLabel>Neuer Preis</FieldLabel>
                  <div className="relative">
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                      placeholder="0,00"
                      value={pDisc.price}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\./g, ",");
                        if (v === "" || PRICE_RE.test(v)) setPDisc((s) => ({ ...s, price: v }));
                      }}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
                  </div>
                </div>

                <div>
                  <FieldLabel>Statt-Preis (optional)</FieldLabel>
                  <div className="relative">
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                      placeholder="0,00"
                      value={pDisc.original}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\./g, ",");
                        if (v === "" || PRICE_RE.test(v)) setPDisc((s) => ({ ...s, original: v }));
                      }}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
                  </div>
                </div>

                {/* Einheit – konstante Höhe, kein Springen */}
                <div>
                  <FieldLabel>Einheit (optional)</FieldLabel>
                  <div className="mt-1 min-h-[112px]">
                    {!pDiscCustomMode ? (
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),auto]">
                        <SelectBox
                          ariaLabel="Einheit wählen"
                          value={pDisc.unit || ""}
                          onChange={(v) => setPDisc((s) => ({ ...s, unit: v }))}
                          options={Array.from(new Set([pDisc.unit || "", ...allUnits])).filter(Boolean)}
                          placeholder="pro Stück"
                          className="w-full min-w-0"
                        />
                        <button
                          type="button"
                          className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
                          onClick={() => setPDiscCustomMode(true)}
                        >
                          Einheit hinzufügen
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <input
                          className="min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          placeholder="z. B. 250 g"
                          value={pDiscCustomUnit}
                          onChange={(e) => setPDiscCustomUnit(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            className="w-full sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
                            disabled={!pDiscCustomUnit.trim()}
                            onClick={() => {
                              const v = pDiscCustomUnit.trim();
                              if (v) setPDisc((s) => ({ ...s, unit: v }));
                              setPDiscCustomUnit(""); setPDiscCustomMode(false);
                            }}
                          >
                            Übernehmen
                          </button>
                          <button
                            type="button"
                            className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
                            onClick={() => { setPDiscCustomUnit(""); setPDiscCustomMode(false); }}
                          >
                            Abbruch
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!!discPreview && pDisc.product && (
                <div className="text-sm mt-1">
                  Vorher:{" "}
                  {discPreview.origCents != null ? (
                    <span className="tabular-nums line-through opacity-70">{euro(discPreview.origCents)}</span>
                  ) : (<i>—</i>)}{" "}
                  → Neu: <span className="tabular-nums font-semibold">{euro(discPreview.newCents)}</span>
                  {pDisc.unit ? <> / {pDisc.unit}</> : null}
                </div>
              )}
            </div>
          )}

          {type === "MULTIBUY_PRICE" && (
            <div className="rounded-xl border p-3 grid gap-3">
              <div className="font-medium">Mehr für weniger</div>
              <div className="text-xs text-zinc-600">
                Ideal für „Menge <b>Einheit</b> für X €“. Beispiel: „5 <b>Stück</b> für 1,80 €“ oder „100 <b>g</b> für 2,50 €“.
              </div>

              <ProductPicker
                value={pMulti.product}
                onChange={(p) => setPMulti((s) => ({ ...s, product: p, unit: s.unit || p?.unit || "pro Stück" }))}
              />

              <div className="grid gap-2 md:grid-cols-4">
                <div>
                  <FieldLabel>Menge</FieldLabel>
                  <input
                    inputMode="numeric"
                    className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    placeholder="0"
                    value={pMulti.qty}
                    onChange={(e) => setPMulti((s) => ({ ...s, qty: e.target.value.replace(",", ".") }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Set-Preis</FieldLabel>
                  <div className="relative">
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                      placeholder="0,00"
                      value={pMulti.price}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\./g, ",");
                        if (v === "" || PRICE_RE.test(v)) setPMulti((s) => ({ ...s, price: v }));
                      }}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
                  </div>
                </div>

                {/* Mengeneinheit – konstante Höhe */}
                <div>
                  <FieldLabel>Mengen-Einheit</FieldLabel>
                  <div className="mt-1 min-h-[112px]">
                    {!pMultiCustomMode ? (
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr),auto]">
                        <SelectBox
                          ariaLabel="Mengen-Einheit wählen"
                          value={pMulti.unit || ""}
                          onChange={(v) => setPMulti((s) => ({ ...s, unit: v }))}
                          options={Array.from(new Set([pMulti.unit || "", ...allUnits])).filter(Boolean)}
                          placeholder="pro Stück"
                          className="w-full min-w-0"
                        />
                        <button
                          type="button"
                          className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
                          onClick={() => setPMultiCustomMode(true)}
                        >
                          Einheit hinzufügen
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <input
                          className="min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          placeholder="z. B. Stück"
                          value={pMultiCustomUnit}
                          onChange={(e) => setPMultiCustomUnit(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            className="w-full sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
                            disabled={!pMultiCustomUnit.trim()}
                            onClick={() => {
                              const v = pMultiCustomUnit.trim();
                              if (v) setPMulti((s) => ({ ...s, unit: v }));
                              setPMultiCustomUnit(""); setPMultiCustomMode(false);
                            }}
                          >
                            Übernehmen
                          </button>
                          <button
                            type="button"
                            className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
                            onClick={() => { setPMultiCustomUnit(""); setPMultiCustomMode(false); }}
                          >
                            Abbruch
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <FieldLabel>Früher: Menge (optional)</FieldLabel>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    placeholder="0"
                    value={pMulti.compareQty}
                    onChange={(e) => setPMulti((s) => ({ ...s, compareQty: e.target.value.replace(",", ".") }))}
                  />
                </div>
                <div>
                  <FieldLabel>Früher: Preis (optional)</FieldLabel>
                  <div className="relative">
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                      placeholder="0,00"
                      value={pMulti.comparePrice}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\./g, ",");
                        if (v === "" || PRICE_RE.test(v)) setPMulti((s) => ({ ...s, comparePrice: v }));
                      }}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
                  </div>
                </div>
              </div>

              {!!multiPreview && pMulti.product && (
                <div className="text-sm mt-1">
                  Neu: <b>{multiPreview.qtyNum}</b> {pMulti.unit || ""} für{" "}
                  <b className="tabular-nums">{euro(multiPreview.packCents)}</b>
                  {multiPreview.cQty ? (
                    <>
                      {" "}— <span className="opacity-70">statt {multiPreview.cQty} {pMulti.unit || ""}</span>
                      {multiPreview.cPrice ? <> für {euro(multiPreview.cPrice)}</> : null}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Aktionen */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <label className="flex items-center gap-2 text-sm sm:mr-auto">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktiv anzeigen
          </label>

          <button
            onClick={create}
            disabled={creating}
            className={[
              "rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition active:translate-y-[1px]",
              creating ? "bg-emerald-700/70 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700",
            ].join(" ")}
            title="Angebot speichern"
          >
            {creating ? "Angebot wird angelegt…" : "Angebot anlegen"}
          </button>
        </div>
      </section>

      {/* deutlich mehr Platz zur Liste */}
      <div className="h-20 sm:h-24 md:h-32" />

      {/* LISTE */}
      <section>
        <h2 className="text-lg font-semibold">Bestehende Angebote</h2>
        <div className="text-sm text-zinc-500 min-h-[1.5rem] mt-1">{loading ? "Lade…" : null}</div>
        <ul className="mt-3 grid gap-3">
          {items.map((it) => (
            <OfferCard key={it.id} item={it} onSaved={reload} onDeleted={reload} />
          ))}
        </ul>
      </section>
    </main>
  );
}
