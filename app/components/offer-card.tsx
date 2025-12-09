// app/components/offer-card.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ImageUploader from "./image-uploader";
import ProductPicker from "./product-picker";
import SelectBox from "./select-box";
import {
  PRICE_RE,
  parseEuroToCents,
  euro,
  centsToEuroString,
} from "../lib/format";
import { OfferKind, Weekday, Location } from "../types/offers";
import FieldLabel from "@/app/components/ui/field-label";
import { WEEKDAY_OPTIONS } from "@/app/components/ui/weekdays";

type OfferDTO = import("./offer-renderer").OfferDTO;
type ProductLite = { id: string; name: string; priceCents: number; unit: string };

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function todayYMD() {
  return toYMD(new Date());
}
function plusDaysYMD(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toYMD(d);
}

export default function OfferCard({
  item,
  onSaved,
  onDeleted,
}: {
  item: OfferDTO;
  onSaved?: () => void;
  onDeleted?: () => void;
}) {
  // Einheiten
  const [allUnits, setAllUnits] = useState<string[]>(["pro Stück"]);
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
        const items = parseProductsJson(json);
        const units = new Set<string>(["pro Stück"]);
        items.forEach((p: any) => {
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

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Base
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.subtitle ?? ""); // bei GENERIC auch Body
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");

  // item.kind / item.weekday / item.locations kommen aus OfferDTO (Prisma-Enums),
  // wir mappen sie einmal auf unsere eigenen Enums.
  const [kind, setKind] = useState<OfferKind>(item.kind as any);
  const [weekday, setWeekday] = useState<Weekday>(
    (item.weekday as any) ?? Weekday.MONDAY,
  );

  // Datumsfelder (leer, wenn DB leer → wir setzen Defaults per useEffect unten)
  const [date, setDate] = useState(item.date ? item.date.slice(0, 10) : "");
  const [startDate, setStart] = useState(
    item.startDate ? item.startDate.slice(0, 10) : "",
  );
  const [endDate, setEnd] = useState(
    item.endDate ? item.endDate.slice(0, 10) : "",
  );

  const [locations, setLocations] = useState<Location[]>(
    (item.locations as any) ?? [],
  );
  const [priority, setPriority] = useState<number>(
    Number.isFinite(Number(item.priority)) ? Number(item.priority) : 0,
  );
  const [minSpend, setMinSpend] = useState<string>(
    item.minBasketCents != null
      ? (item.minBasketCents / 100).toFixed(2).replace(".", ",")
      : "",
  );
  const [isActive, setIsActive] = useState<boolean>(!!item.isActive);

  // Defaults setzen, falls aus DB nichts da ist
  useEffect(() => {
    if (kind === OfferKind.DATE_RANGE && !startDate && !endDate) {
      setStart(todayYMD());
      setEnd(plusDaysYMD(6));
    }
    if (kind === OfferKind.ONE_DAY && !date) {
      setDate(todayYMD());
    }
  }, [kind, startDate, endDate, date]);

  function setKindWithDefaults(k: OfferKind) {
    setKind(k);
    if (k === OfferKind.DATE_RANGE) {
      // Nur setzen, wenn nichts vorhanden
      setStart((s) => s || todayYMD());
      setEnd((e) => e || plusDaysYMD(6));
    }
    if (k === OfferKind.ONE_DAY) {
      setDate((d) => d || todayYMD());
    }
  }

  function toggleLoc(l: Location) {
    setLocations((s) =>
      s.includes(l) ? s.filter((x) => x !== l) : [...s, l],
    );
  }

  // PRODUCT_NEW
  const [pNewProduct, setPNewProduct] = useState<ProductLite | null>(
    (item.productNew?.product as any) ?? null,
  );
  const [pNewLabel, setPNewLabel] = useState<string>(
    item.productNew?.highlightLabel ?? "NEU",
  );

  // PRODUCT_DISCOUNT
  const [pDiscProduct, setPDiscProduct] = useState<ProductLite | null>(
    (item.productDiscount?.product as any) ?? null,
  );
  const [pDiscPrice, setPDiscPrice] = useState<string>(
    item.productDiscount ? centsToEuroString(item.productDiscount.priceCents) : "",
  );
  const [pDiscOriginal, setPDiscOriginal] = useState<string>(
    item.productDiscount?.originalPriceCents != null
      ? centsToEuroString(item.productDiscount.originalPriceCents)
      : "",
  );
  const [pDiscUnit, setPDiscUnit] = useState<string>(
    item.productDiscount?.unit ?? (pDiscProduct?.unit ?? "pro Stück"),
  );
  const discPreview = useMemo(() => {
    if (!pDiscProduct || !PRICE_RE.test(pDiscPrice)) return null;
    const newCents = parseEuroToCents(pDiscPrice);
    const origCents =
      pDiscOriginal && PRICE_RE.test(pDiscOriginal)
        ? parseEuroToCents(pDiscOriginal)
        : null;
    return { newCents, origCents };
  }, [pDiscProduct, pDiscPrice, pDiscOriginal]);

  // MULTIBUY_PRICE
  const [pMultiProduct, setPMultiProduct] = useState<ProductLite | null>(
    (item.multibuyPrice?.product as any) ?? null,
  );
  const [pMultiQty, setPMultiQty] = useState<string>(
    item.multibuyPrice ? String(item.multibuyPrice.packQty) : "",
  );
  const [pMultiPrice, setPMultiPrice] = useState<string>(
    item.multibuyPrice
      ? centsToEuroString(item.multibuyPrice.packPriceCents)
      : "",
  );
  const [pMultiCompareQty, setPMultiCompareQty] = useState<string>(
    item.multibuyPrice?.comparePackQty != null
      ? String(item.multibuyPrice.comparePackQty)
      : "",
  );
  const [pMultiComparePrice, setPMultiComparePrice] = useState<string>(
    item.multibuyPrice?.comparePriceCents != null
      ? centsToEuroString(item.multibuyPrice.comparePriceCents)
      : "",
  );
  const [pMultiUnit, setPMultiUnit] = useState<string>(
    item.multibuyPrice?.unit ?? (pMultiProduct?.unit ?? "pro Stück"),
  );

  const multiPreview = useMemo(() => {
    const qtyNum = Number(pMultiQty);
    const hasQty = Number.isFinite(qtyNum) && qtyNum > 0;
    if (!pMultiProduct || !PRICE_RE.test(pMultiPrice) || !hasQty) return null;
    const packCents = parseEuroToCents(pMultiPrice);
    const cQty =
      pMultiCompareQty && Number.isFinite(Number(pMultiCompareQty))
        ? Number(pMultiCompareQty)
        : null;
    const cPrice =
      pMultiComparePrice && PRICE_RE.test(pMultiComparePrice)
        ? parseEuroToCents(pMultiComparePrice)
        : null;
    return { packCents, qtyNum, cQty, cPrice };
  }, [
    pMultiProduct,
    pMultiQty,
    pMultiPrice,
    pMultiCompareQty,
    pMultiComparePrice,
  ]);

  const validBase =
    title.trim() &&
    ((kind === OfferKind.DATE_RANGE && startDate && endDate) ||
      (kind === OfferKind.ONE_DAY && date) ||
      (kind === OfferKind.RECURRING_WEEKDAY && weekday));

  async function save() {
    if (!validBase) {
      alert("Bitte Titel und Zeitraum ausfüllen.");
      return;
    }
    setSaving(true);
    try {
      const base: any = {
        title: title.trim(),
        subtitle: description.trim() || null,
        imageUrl: imageUrl || null,
        isActive,
        kind,
        locations,
        priority: Number.isFinite(Number(priority)) ? Number(priority) : 0,
        minBasketCents: minSpend ? parseEuroToCents(minSpend) : null,
      };
      if (kind === OfferKind.RECURRING_WEEKDAY) base.weekday = weekday;
      if (kind === OfferKind.ONE_DAY) base.date = date;
      if (kind === OfferKind.DATE_RANGE) {
        base.startDate = startDate;
        base.endDate = endDate;
      }

      let payload: any = undefined;
      if (item.type === "GENERIC")
        payload = { body: description || "", ctaLabel: null, ctaHref: null };

      if (item.type === "PRODUCT_NEW") {
        if (!pNewProduct) return alert("Bitte Produkt auswählen.");
        payload = { productId: pNewProduct.id, highlightLabel: pNewLabel || "NEU" };
      }

      if (item.type === "PRODUCT_DISCOUNT") {
        if (!pDiscProduct) return alert("Bitte Produkt auswählen.");
        if (!PRICE_RE.test(pDiscPrice)) return alert("Bitte gültigen Preis eingeben.");
        const finalUnit = (pDiscUnit || "").trim();
        payload = {
          productId: pDiscProduct.id,
          priceCents: parseEuroToCents(pDiscPrice),
          originalPriceCents:
            pDiscOriginal && PRICE_RE.test(pDiscOriginal)
              ? parseEuroToCents(pDiscOriginal)
              : null,
          unit: finalUnit || null,
        };
      }

      if (item.type === "MULTIBUY_PRICE") {
        if (!pMultiProduct) return alert("Bitte Produkt auswählen.");
        const qty = Number(pMultiQty);
        if (!Number.isFinite(qty) || qty <= 0)
          return alert("Bitte eine gültige Menge eingeben.");
        if (!PRICE_RE.test(pMultiPrice))
          return alert("Bitte gültigen Set-Preis eingeben.");
        const finalUnit = (pMultiUnit || "").trim();
        payload = {
          productId: pMultiProduct.id,
          packQty: Math.max(1, qty),
          packPriceCents: parseEuroToCents(pMultiPrice),
          comparePackQty:
            pMultiCompareQty && Number.isFinite(Number(pMultiCompareQty))
              ? Number(pMultiCompareQty)
              : null,
          comparePriceCents:
            pMultiComparePrice && PRICE_RE.test(pMultiComparePrice)
              ? parseEuroToCents(pMultiComparePrice)
              : null,
          unit: finalUnit || null,
        };
      }

      const res = await fetch(`/api/offers/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, payload }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Konnte Angebot nicht speichern.");
        return;
      }
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Wirklich löschen?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/offers/${item.id}`, { method: "DELETE" });
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="relative overflow-visible rounded-2xl border bg-white/90 p-4 ring-1 shadow-sm dark:bg-zinc-900/80 focus-within:z-40 min-w-0">
      <div className="grid gap-4 min-w-0">
        {/* Titel */}
        <div className="min-w-0">
          <FieldLabel>Titel</FieldLabel>
          <input
            className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel…"
          />
        </div>

        {/* Beschreibung */}
        <div className="min-w-0">
          <FieldLabel>Beschreibung (optional)</FieldLabel>
          <textarea
            rows={3}
            className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung…"
          />
        </div>

        {/* Bild */}
        <div className="min-w-0">
          <FieldLabel>Bild (optional)</FieldLabel>
          <div className="mt-1 min-w-0">
            <ImageUploader folder="offers" imageUrl={imageUrl} onChange={setImageUrl} />
          </div>
        </div>

        {/* Zeit + Filialen + Priorität */}
        <div className="grid gap-3 lg:grid-cols-2 min-w-0">
          <div className="lg:col-span-2 grid gap-2 lg:grid-cols-3 min-w-0">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`kind-${item.id}`}
                checked={kind === OfferKind.DATE_RANGE}
                onChange={() => setKindWithDefaults(OfferKind.DATE_RANGE)}
              />
              <span>Zeitraum</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`kind-${item.id}`}
                checked={kind === OfferKind.ONE_DAY}
                onChange={() => setKindWithDefaults(OfferKind.ONE_DAY)}
              />
              <span>Ein Tag</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`kind-${item.id}`}
                checked={kind === OfferKind.RECURRING_WEEKDAY}
                onChange={() => setKindWithDefaults(OfferKind.RECURRING_WEEKDAY)}
              />
              <span>Wöchentlich</span>
            </label>
          </div>

          {kind === OfferKind.DATE_RANGE ? (
            <>
              <div className="min-w-0">
                <FieldLabel>Start</FieldLabel>
                <input
                  type="date"
                  className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  value={startDate}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="min-w-0">
                <FieldLabel>Ende</FieldLabel>
                <input
                  type="date"
                  className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  value={endDate}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </>
          ) : kind === OfferKind.ONE_DAY ? (
            <>
              <div className="min-w-0">
                <FieldLabel>Datum</FieldLabel>
                <input
                  type="date"
                  className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div aria-hidden />
            </>
          ) : (
            <>
              <div className="min-w-0">
                <FieldLabel>Wochentag</FieldLabel>
                <div className="mt-1 min-w-0">
                  <SelectBox
                    value={
                      WEEKDAY_OPTIONS.find((w) => w.value === weekday)?.label ||
                      "Montag"
                    }
                    onChange={(label) => {
                      const found = WEEKDAY_OPTIONS.find(
                        (w) => w.label === label,
                      );
                      if (found) return setWeekday(found.value as Weekday);
                    }}
                    options={WEEKDAY_OPTIONS.map((w) => w.label)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>
              <div aria-hidden />
            </>
          )}

          {/* Filialen / Priorität */}
          <div className="min-w-0">
            <FieldLabel>Filialen</FieldLabel>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {([Location.RECKE, Location.METTINGEN] as const).map((l) => {
                const active = locations.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLoc(l)}
                    className={[
                      "shrink-0 rounded-full px-3 py-1 text-xs ring-1",
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
            <FieldLabel>Priorität</FieldLabel>
            <input
              className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Einkaufswert */}
        <div className="min-w-0">
          <FieldLabel>Ab Einkaufswert (optional)</FieldLabel>
          <div className="relative min-w-0">
            <input
              className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
              placeholder="z. B. 10,00"
              value={minSpend}
              onChange={(e) => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) setMinSpend(v);
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
              €
            </span>
          </div>
        </div>

        {/* Typspezifisch */}
        {item.type === "PRODUCT_NEW" && (
          <div className="grid gap-3 min-w-0">
            <div className="min-w-0">
              <ProductPicker value={pNewProduct} onChange={setPNewProduct} />
            </div>
            <div className="min-w-0">
              <FieldLabel>Label (z. B. „NEU“)</FieldLabel>
              <input
                className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                value={pNewLabel}
                onChange={(e) => setPNewLabel(e.target.value)}
              />
            </div>
          </div>
        )}

        {item.type === "PRODUCT_DISCOUNT" && (
          <div className="grid gap-3 min-w-0">
            <div className="min-w-0">
              <ProductPicker
                value={pDiscProduct}
                onChange={(p) => {
                  setPDiscProduct(p);
                  if (p) {
                    setPDiscUnit((u) => u || p.unit || "pro Stück");
                    setPDiscOriginal(centsToEuroToStringSafe(p.priceCents));
                  }
                }}
              />
            </div>
            <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3 min-w-0">
              <div className="min-w-0">
                <FieldLabel>Neuer Preis</FieldLabel>
                <div className="relative min-w-0">
                  <input
                    className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                    placeholder="0,00"
                    value={pDiscPrice}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\./g, ",");
                      if (v === "" || PRICE_RE.test(v)) setPDiscPrice(v);
                    }}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
                    €
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <FieldLabel>Statt-Preis (optional)</FieldLabel>
                <div className="relative min-w-0">
                  <input
                    className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                    placeholder="0,00"
                    value={pDiscOriginal}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\./g, ",");
                      if (v === "" || PRICE_RE.test(v)) setPDiscOriginal(v);
                    }}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
                    €
                  </span>
                </div>
              </div>
              <div className="lg:col-span-2 2xl:col-span-1 min-w-0">
                <FieldLabel>Einheit (optional)</FieldLabel>
                <UnitWithCustom
                  value={pDiscUnit}
                  onChange={setPDiscUnit}
                  allUnits={allUnits}
                  placeholder="pro Stück"
                />
              </div>
            </div>

            {!!discPreview && pDiscProduct && (
              <div className="text-sm">
                Vorher:{" "}
                {discPreview.origCents != null ? (
                  <span className="tabular-nums line-through opacity-70">
                    {euro(discPreview.origCents)}
                  </span>
                ) : (
                  <i>—</i>
                )}{" "}
                → Neu:{" "}
                <span className="tabular-nums font-semibold">
                  {euro(discPreview.newCents)}
                </span>
                {pDiscUnit ? <> / {pDiscUnit}</> : null}
              </div>
            )}
          </div>
        )}

        {item.type === "MULTIBUY_PRICE" && (
          <div className="grid gap-3 min-w-0">
            <div className="min-w-0">
              <ProductPicker
                value={pMultiProduct}
                onChange={(p) => {
                  setPMultiProduct(p);
                  setPMultiUnit((u) => u || p?.unit || "pro Stück");
                }}
              />
            </div>

            <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3 min-w-0">
              <div className="min-w-0">
                <FieldLabel>Menge</FieldLabel>
                <input
                  inputMode="numeric"
                  className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  placeholder="0"
                  value={pMultiQty}
                  onChange={(e) => setPMultiQty(e.target.value.replace(",", "."))}
                />
              </div>
              <div className="min-w-0">
                <FieldLabel>Set-Preis</FieldLabel>
                <div className="relative min-w-0">
                  <input
                    className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                    placeholder="0,00"
                    value={pMultiPrice}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\./g, ",");
                      if (v === "" || PRICE_RE.test(v)) setPMultiPrice(v);
                    }}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
                    €
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <FieldLabel>Mengen-Einheit</FieldLabel>
                <UnitWithCustom
                  value={pMultiUnit || ""}
                  onChange={(v) => setPMultiUnit(v)}
                  allUnits={allUnits}
                  placeholder="pro Stück"
                />
              </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-2 min-w-0">
              <div className="min-w-0">
                <FieldLabel>Früher: Menge (optional)</FieldLabel>
                <input
                  className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  placeholder="0"
                  value={pMultiCompareQty}
                  onChange={(e) =>
                    setPMultiCompareQty(e.target.value.replace(",", "."))
                  }
                />
              </div>
              <div className="min-w-0">
                <FieldLabel>Früher: Preis (optional)</FieldLabel>
                <div className="relative min-w-0">
                  <input
                    className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
                    placeholder="0,00"
                    value={pMultiComparePrice}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\./g, ",");
                      if (v === "" || PRICE_RE.test(v))
                        setPMultiComparePrice(v);
                    }}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
                    €
                  </span>
                </div>
              </div>
            </div>

            {!!multiPreview && pMultiProduct && (
              <div className="text-sm">
                Neu: <b>{multiPreview.qtyNum}</b> {pMultiUnit || ""} für{" "}
                <b className="tabular-nums">{euro(multiPreview.packCents)}</b>
                {multiPreview.cQty ? (
                  <>
                    {" "}
                    —{" "}
                    <span className="opacity-70">
                      statt {multiPreview.cQty} {pMultiUnit || ""}
                    </span>
                    {multiPreview.cPrice ? (
                      <> für {euro(multiPreview.cPrice)}</>
                    ) : null}
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Aktionen */}
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 min-w-0">
          <div className="min-w-0">
            <button
              onClick={() => setIsActive((a) => !a)}
              className={[
                "w-full inline-flex items-center justify-center rounded-md px-3 py-2 text-sm ring-1 transition active:translate-y-[1px]",
                isActive
                  ? "text-emerald-700 ring-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:ring-emerald-800/60 dark:hover:bg-emerald-900/20"
                  : "text-zinc-600 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800",
              ].join(" ")}
              title={isActive ? "Deaktivieren" : "Aktivieren"}
            >
              {isActive ? "Aktiv" : "Inaktiv"}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:col-span-2 min-w-0">
            <button
              onClick={save}
              disabled={saving}
              className={[
                "w-full sm:w-auto rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition active:translate-y-[1px]",
                saving ? "bg-emerald-700/70 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700",
              ].join(" ")}
            >
              {saving ? "Änderungen werden gespeichert…" : "Änderungen speichern"}
            </button>
            <button
              onClick={remove}
              disabled={deleting}
              className={[
                "w-full sm:w-auto rounded-md px-3 py-2 text-sm ring-1 transition active:translate-y-[1px]",
                deleting
                  ? "text-red-600 ring-red-200 cursor-wait"
                  : "text-red-600 ring-red-200 hover:bg-red-50 hover:ring-red-300 dark:text-red-400 dark:ring-red-800/60 dark:hover:bg-red-900/20",
              ].join(" ")}
            >
              {deleting ? "Wird gelöscht…" : "Löschen"}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Hilfs-Component für Discount & Multibuy: SelectBox ↔ Custom mit Platzhaltern */
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
    <div className="min-h-[112px] min-w-0">
      {!customMode ? (
        <>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-[minmax(0,1fr),auto] sm:items-start min-w-0">
            <SelectBox
              ariaLabel="Einheit wählen"
              value={value || ""}
              onChange={(v) => onChange(v)}
              options={Array.from(new Set([value || "", ...allUnits])).filter(
                Boolean,
              )}
              placeholder={placeholder}
              className="w-full min-w-0 max-w-full"
            />
            <button
              type="button"
              className="shrink-0 self-start rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
              onClick={() => setCustomMode(true)}
            >
              Einheit hinzufügen
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2 min-w-0">
          <input
            className="min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="z. B. 250 g"
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
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
              className="shrink-0 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
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

function centsToEuroToStringSafe(cents: number) {
  try {
    return centsToEuroString(cents);
  } catch {
    return "";
  }
}
