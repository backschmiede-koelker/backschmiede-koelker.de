"use client";

import { useEffect, useMemo, useState } from "react";
import ImageUploader from "@/app/components/image-uploader";
import ProductPicker from "@/app/components/product-picker";
import SelectBox from "@/app/components/select-box";
import { PRICE_RE, parseEuroToCents, euro } from "@/app/lib/format";
import { OfferKind, Weekday, Location, OfferType } from "@prisma/client";
import OfferCard from "@/app/components/offer-card";

// Kleine UI-Bausteine
import FieldLabel from "app/components/ui/field-label";
import SectionCard from "app/components/ui/section-card";
import OfferTypeSelector from "app/admin/offers/components/offer-type-selector";
import ScheduleSelector from "app/admin/offers/components/schedule-selector";
import LocationPriorityRow from "app/admin/offers/components/location-priority-row";
import MinSpendField from "app/admin/offers/components/min-spend-field";
import ActionsBar from "app/admin/offers/components/actions-bar";

// ProductDiscountForm bleibt wie gehabt (nutzt intern deine SelectBox/Unit-Handling)
import ProductDiscountForm from "app/admin/offers/components/product-discount-form";

type ProductLite = { id: string; name: string; priceCents: number; unit: string };
type OfferDTO = import("../../components/offer-renderer").OfferDTO;

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
  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    let alive = true;
    function parseProductsJson(json: any) {
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.items)) return json.items;
      return [];
    }
    (async () => {
      try {
        const res = await fetch("/api/products?limit=50", { cache: "no-store" });
        const json = await res.json();
        const products = parseProductsJson(json);
        const units = new Set<string>(["pro Stück"]);
        products.forEach((p: any) => {
          const u = (p?.unit || "").trim();
          if (u) units.add(u);
        });
        if (alive) setAllUnits(Array.from(units).sort((a, b) => a.localeCompare(b, "de")));
      } catch {
        if (alive) setAllUnits(["pro Stück"]);
      }
    })();
    return () => {
      alive = false;
    };
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
  const [pNew, setPNew] = useState<{ product: ProductLite | null; label: string }>({
    product: null,
    label: "NEU",
  });
  const [pDisc, setPDisc] = useState<{
    product: ProductLite | null;
    price: string;
    original: string;
    unit: string;
  }>({
    product: null,
    price: "",
    original: "",
    unit: "",
  });
  const [pMulti, setPMulti] = useState<{
    product: ProductLite | null;
    qty: string;
    price: string;
    compareQty: string;
    comparePrice: string;
    unit: string;
  }>({ product: null, qty: "", price: "", compareQty: "", comparePrice: "", unit: "" });

  // Defaults: Start = heute, Ende = +6 Tage beim ersten Laden (wenn leer)
  useEffect(() => {
    if (startDate || endDate) return;
    const now = new Date();
    const start = toYMD(now);
    const endD = new Date(now);
    endD.setDate(now.getDate() + 6);
    setStart(start);
    setEnd(toYMD(endD));
  }, [startDate, endDate]);

  function setKindWithDefaults(k: OfferKind) {
    setKind(k);
    if (k === OfferKind.ONE_DAY && !date) setDate(toYMD(new Date()));
    if (k === OfferKind.DATE_RANGE && !(startDate && endDate)) {
      const now = new Date();
      setStart((s) => s || toYMD(now));
      const e = new Date(now);
      e.setDate(now.getDate() + 6);
      setEnd((en) => en || toYMD(e));
    }
  }

  // Standard-Einheit, sobald Units da sind
  useEffect(() => {
    const def = allUnits.includes("pro Stück") ? "pro Stück" : allUnits[0] || "";
    if (!pDisc.unit) setPDisc((s) => ({ ...s, unit: def }));
    if (!pMulti.unit) setPMulti((s) => ({ ...s, unit: def }));
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
    const origCents =
      pDisc.original && PRICE_RE.test(pDisc.original) ? parseEuroToCents(pDisc.original) : null;
    return { newCents, origCents };
  }, [pDisc]);

  const multiPreview = useMemo(() => {
    const qtyNum = Number(pMulti.qty);
    const hasQty = Number.isFinite(qtyNum) && qtyNum > 0;
    if (!pMulti.product || !PRICE_RE.test(pMulti.price) || !hasQty) return null;
    const packCents = parseEuroToCents(pMulti.price);
    const cQty =
      pMulti.compareQty && Number.isFinite(Number(pMulti.compareQty))
        ? Number(pMulti.compareQty)
        : null;
    const cPrice =
      pMulti.comparePrice && PRICE_RE.test(pMulti.comparePrice)
        ? parseEuroToCents(pMulti.comparePrice)
        : null;
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
      if (kind === "DATE_RANGE") {
        base.startDate = startDate;
        base.endDate = endDate;
      }

      let payload: any = {};
      if (type === "GENERIC") payload = { body: description || "", ctaLabel: null, ctaHref: null };

      if (type === "PRODUCT_NEW") {
        if (!pNew.product) return alert("Bitte Produkt auswählen.");
        payload = { productId: pNew.product.id, highlightLabel: pNew.label || "NEU" };
      }

      if (type === "PRODUCT_DISCOUNT") {
        if (!pDisc.product) return alert("Bitte Produkt auswählen.");
        if (!PRICE_RE.test(pDisc.price)) return alert("Bitte gültigen Preis eingeben.");
        const finalUnit = (pDisc.unit || "").trim();
        payload = {
          productId: pDisc.product.id,
          priceCents: parseEuroToCents(pDisc.price),
          originalPriceCents:
            pDisc.original && PRICE_RE.test(pDisc.original) ? parseEuroToCents(pDisc.original) : null,
          unit: finalUnit || null,
        };
      }

      if (type === "MULTIBUY_PRICE") {
        if (!pMulti.product) return alert("Bitte Produkt auswählen.");
        const qty = Number(pMulti.qty);
        if (!Number.isFinite(qty) || qty <= 0) return alert("Bitte eine gültige Menge eingeben.");
        if (!PRICE_RE.test(pMulti.price)) return alert("Bitte gültigen Set-Preis eingeben.");
        const finalUnit = (pMulti.unit || "").trim();
        payload = {
          productId: pMulti.product.id,
          packQty: Math.max(1, qty),
          packPriceCents: parseEuroToCents(pMulti.price),
          comparePackQty:
            pMulti.compareQty && Number.isFinite(Number(pMulti.compareQty))
              ? Number(pMulti.compareQty)
              : null,
          comparePriceCents:
            pMulti.comparePrice && PRICE_RE.test(pMulti.comparePrice)
              ? parseEuroToCents(pMulti.comparePrice)
              : null,
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
      setTitle("");
      setDescription("");
      setImageUrl("");
      setKind(OfferKind.DATE_RANGE);
      setWeekday(Weekday.MONDAY);
      setDate("");
      setStart("");
      setEnd("");
      setLocations([Location.RECKE, Location.METTINGEN]);
      setPriority(0);
      setMinSpend("");
      setIsActive(true);
      setPNew({ product: null, label: "NEU" });
      setPDisc({ product: null, price: "", original: "", unit: "" });
      setPMulti({ product: null, qty: "", price: "", compareQty: "", comparePrice: "", unit: "" });

      await reload();
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8 py-6 lg:py-10 min-w-0">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Angebote</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Wähle unten einen <b>Typ</b> und fülle nur die wenigen Felder aus. Fertig.
        </p>
      </header>

      {/* ERFASSUNG */}
      <SectionCard className="relative z-30 overflow-visible">
        {/* Typ-Auswahl */}
        <OfferTypeSelector type={type} onChange={setType} />

        {/* Basisfelder */}
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="min-w-0">
              <FieldLabel hint="Kurzer, knackiger Titel – damit Kund:innen sofort verstehen, worum es geht.">
                Titel
              </FieldLabel>
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

          {/* Zeitraum / Wochentag */}
          <ScheduleSelector
            kind={kind}
            onKindChange={setKindWithDefaults}
            date={date}
            onDateChange={setDate}
            startDate={startDate}
            onStartDateChange={setStart}
            endDate={endDate}
            onEndDateChange={setEnd}
            weekday={weekday}
            onWeekdayChange={setWeekday}
          />

          {/* Filialen + Priorität */}
          <LocationPriorityRow
            locations={locations}
            onToggleLocation={(l) => {
              const includes = locations.includes(l);
              setLocations(includes ? locations.filter((x) => x !== l) : [...locations, l]);
            }}
            priority={priority}
            onPriorityChange={(v) => setPriority(v)}
          />

          {/* Ab Einkaufswert */}
          <MinSpendField value={minSpend} onChange={setMinSpend} />
        </div>

        {/* TYP-SPEZIFISCHE FELDER */}
        <div className="mt-6 grid gap-4">
          {type === "GENERIC" && (
            <SectionCard muted>
              <div className="font-medium">Allgemein</div>
              <p className="mt-1 text-sm text-zinc-600">
                Für Hinweise, Aktionen oder Platzhalter ohne Produktbezug. Bild + Titel + Beschreibung werden verwendet.
              </p>
            </SectionCard>
          )}

          {/* Jetzt neu */}
          {type === "PRODUCT_NEW" && (
            <SectionCard>
              <div className="grid gap-3">
                <div>
                  {/* Doppeltes Label entfernt – ProductPicker zeigt sein Label */}
                  <ProductPicker
                    value={pNew.product}
                    onChange={(p) => setPNew((s) => ({ ...s, product: p }))}
                  />
                </div>
                <div>
                  <FieldLabel>Label</FieldLabel>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    value={pNew.label}
                    onChange={(e) => setPNew((s) => ({ ...s, label: e.target.value }))}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Produkt reduziert */}
          {type === "PRODUCT_DISCOUNT" && (
            <ProductDiscountForm
              value={pDisc}
              onChange={setPDisc}
              allUnits={allUnits}
              preview={discPreview ? { old: discPreview.origCents, now: discPreview.newCents } : null}
            />
          )}

          {/* Mehr für weniger */}
          {type === "MULTIBUY_PRICE" && (
            <SectionCard>
              <div className="font-medium">Mehr für weniger</div>
              <div className="text-xs text-zinc-600 mt-1">
                „Menge <b>Einheit</b> für X €“. Beispiel: „5 <b>Stück</b> für 1,80 €“ oder „100 <b>g</b> für 2,50 €“.
              </div>

              <div className="mt-3">
                {/* Doppeltes Label entfernt – ProductPicker zeigt sein Label */}
                <ProductPicker
                  value={pMulti.product}
                  onChange={(p) =>
                    setPMulti((s) => ({ ...s, product: p, unit: s.unit || p?.unit || "pro Stück" }))
                  }
                />
              </div>

              {/* Spalten: Menge / Set-Preis / Einheit */}
              <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
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
                <div>
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
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
                      €
                    </span>
                  </div>
                </div>
                <div>
                  <FieldLabel>Mengen-Einheit</FieldLabel>
                  <UnitWithCustom
                    value={pMulti.unit}
                    onChange={(v) => setPMulti((s) => ({ ...s, unit: v }))}
                    allUnits={allUnits}
                    placeholder="pro Stück"
                  />
                </div>
              </div>

              {/* Vergleichswerte */}
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                <div>
                  <FieldLabel>Früher: Menge (optional)</FieldLabel>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    placeholder="0"
                    value={pMulti.compareQty}
                    onChange={(e) =>
                      setPMulti((s) => ({ ...s, compareQty: e.target.value.replace(",", ".") }))
                    }
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
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
                      €
                    </span>
                  </div>
                </div>
              </div>

              {!!multiPreview && pMulti.product && (
                <div className="text-sm mt-1">
                  Neu: <b>{multiPreview.qtyNum}</b> {pMulti.unit || ""} für{" "}
                  <b className="tabular-nums">{euro(multiPreview.packCents)}</b>
                  {multiPreview.cQty ? (
                    <>
                      {" "}
                      — <span className="opacity-70">statt {multiPreview.cQty} {pMulti.unit || ""}</span>
                      {multiPreview.cPrice ? <> für {euro(multiPreview.cPrice)}</> : null}
                    </>
                  ) : null}
                </div>
              )}
            </SectionCard>
          )}
        </div>

        {/* Aktionen */}
        <ActionsBar
          isActive={isActive}
          onToggleActive={() => setIsActive((a) => !a)}
          creating={creating}
          onCreate={create}
        />
      </SectionCard>

      {/* Abstand zur Liste */}
      <div className="h-16 lg:h-24" />

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

/** Hilfs-Component: SelectBox ↔ Custom; identisch zu OfferCard */
function UnitWithCustom({
  value,
  onChange,
  allUnits,
  placeholder = "pro Stück",
}: {
  value: string;
  onChange: (v: string) => void;
  allUnits: string[];
  placeholder?: string;
}) {
  const [customMode, setCustomMode] = useState(false);
  const [customUnit, setCustomUnit] = useState("");

  return (
    <div className="min-h-[112px]">
      {!customMode ? (
        <>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-[minmax(0,1fr),auto]">
            <SelectBox
              ariaLabel="Einheit wählen"
              value={value || ""}
              onChange={(v) => onChange(v)}
              options={Array.from(new Set([value || "", ...allUnits])).filter(Boolean)}
              placeholder={placeholder}
              className="w-full min-w-0"
            />
            <button
              type="button"
              className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
              onClick={() => setCustomMode(true)}
            >
              Einheit hinzufügen
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            className="min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="z. B. 250 g"
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="w-full sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
              disabled={!customUnit.trim()}
              onClick={() => {
                const v = customUnit.trim();
                if (v) onChange(v);
                setCustomUnit("");
                setCustomMode(false);
              }}
            >
              Übernehmen
            </button>
            <button
              type="button"
              className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
              onClick={() => {
                setCustomUnit("");
                setCustomMode(false);
              }}
            >
              Abbruch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
