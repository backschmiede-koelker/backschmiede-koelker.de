// /app/components/offer-card.tsx
"use client";
import { useMemo, useState } from "react";
import { Offer, OfferKind, Weekday, Location } from "@prisma/client";
import SelectBox from "./select-box";
import OfferProductsEditor from "./offer-products-editor";
import { PRICE_RE, parseEuroToCents, centsToEuroString, euro } from "../lib/format";

const WEEKDAYS: { label: string; value: Weekday }[] = [
  { label: "Montag", value: Weekday.MONDAY },
  { label: "Dienstag", value: Weekday.TUESDAY },
  { label: "Mittwoch", value: Weekday.WEDNESDAY },
  { label: "Donnerstag", value: Weekday.THURSDAY },
  { label: "Freitag", value: Weekday.FRIDAY },
  { label: "Samstag", value: Weekday.SATURDAY },
  { label: "Sonntag", value: Weekday.SUNDAY },
];

type Props = {
  offer: Offer;
  allUnits: string[];
  onSaved?: () => void;
  onDelete?: () => void;
};

export default function OfferCard({ offer: o, allUnits, onSaved, onDelete }: Props) {
  const [title, setTitle] = useState(o.title);
  const [description, setDesc] = useState(o.description ?? "");
  const [price, setPrice] = useState(centsToEuroString(o.priceCents ?? 0));
  const [originalPrice, setOriginalPrice] = useState(centsToEuroString((o as any).originalPriceCents ?? 0));
  const [unit, setUnit] = useState(o.unit || "pro Stück");
  const [customUnitMode, setCustomUnitMode] = useState(false);
  const [customUnit, setCustomUnit] = useState("");
  const [imageUrl] = useState(o.imageUrl ?? ""); // nur Anzeige (kein Edit)
  const [tags, setTags] = useState((o.tags ?? []).join(", "));
  const [kind, setKind] = useState<OfferKind>(o.kind);
  const [weekday, setWeekday] = useState<Weekday | "">(o.weekday ?? "");
  const [date, setDate] = useState(o.date ? new Date(o.date).toISOString().slice(0,10) : "");
  const [startDate, setStart] = useState(o.startDate ? new Date(o.startDate).toISOString().slice(0,10) : "");
  const [endDate, setEnd] = useState(o.endDate ? new Date(o.endDate).toISOString().slice(0,10) : "");
  const [locations, setLocations] = useState<Location[]>(o.locations as any || []);
  const [priority, setPriority] = useState<number>(o.priority ?? 0);
  const [isActive, setActive] = useState(!!o.isActive);
  const [saving, setSaving] = useState(false);

  const priceCents = parseEuroToCents(price || "");
  const priceInvalid = Number.isNaN(priceCents);
  const origCents = parseEuroToCents(originalPrice || "");
  const origInvalid = originalPrice !== "" && Number.isNaN(origCents);

  // verknüpfte Produkte (falls API sie bereits mitliefert; sonst leer)
  const [linked, setLinked] = useState<any[]>(
    Array.isArray((o as any).products)
      ? (o as any).products.map((p: any) => ({
          product: p.product,
          role: p.role,
          quantity: p.quantity,
          perItemPriceCents: p.perItemPriceCents ?? null
        }))
      : []
  );

  const unitFinal = useMemo(
    () => (customUnitMode ? customUnit.trim() : unit.trim()) || "pro Stück",
    [customUnitMode, customUnit, unit]
  );

  const changed = useMemo(() => {
    const normalized = {
      title: title.trim(),
      description: description.trim() || "",
      priceCents: Number.isNaN(priceCents) ? 0 : priceCents,
      originalPriceCents: originalPrice === "" ? null : (Number.isNaN(origCents) ? null : origCents),
      unit: unitFinal,
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
      isActive: !!isActive,
      kind,
      weekday: kind === OfferKind.RECURRING_WEEKDAY ? (weekday || null) : null,
      date: kind === OfferKind.ONE_DAY ? (date || null) : null,
      startDate: kind === OfferKind.DATE_RANGE ? (startDate || null) : null,
      endDate: kind === OfferKind.DATE_RANGE ? (endDate || null) : null,
      locations,
      priority: Number(priority ?? 0),
      products: linked.map((l: any) => ({
        productId: l.product.id,
        role: l.role,
        quantity: l.quantity,
        perItemPriceCents: l.perItemPriceCents ?? null
      })),
    };

    const baseline = {
      title: o.title,
      description: o.description ?? "",
      priceCents: o.priceCents ?? 0,
      originalPriceCents: (o as any).originalPriceCents ?? null,
      unit: o.unit || "pro Stück",
      tags: (o.tags ?? []),
      isActive: !!o.isActive,
      kind: o.kind,
      weekday: o.weekday ?? null,
      date: o.date ? o.date.toString().slice(0,10) : null,
      startDate: o.startDate ? o.startDate.toString().slice(0,10) : null,
      endDate: o.endDate ? o.endDate.toString().slice(0,10) : null,
      locations: (o.locations as any) || [],
      priority: o.priority ?? 0,
      products: Array.isArray((o as any).products)
        ? (o as any).products.map((p: any) => ({
            productId: p.product.id, role: p.role, quantity: p.quantity,
            perItemPriceCents: p.perItemPriceCents ?? null
          }))
        : [],
    };

    return JSON.stringify(normalized) !== JSON.stringify(baseline);
  }, [title, description, priceCents, origCents, originalPrice, unitFinal, tags, isActive, kind, weekday, date, startDate, endDate, locations, priority, linked, o]);

  function toggleLocation(l: Location) {
    setLocations(s => (s.includes(l) ? s.filter(x => x !== l) : [...s, l]));
  }

  async function save() {
    setSaving(true);
    try {
      if (priceInvalid || origInvalid) { alert("Ungültiger Preis"); return; }
      const body: any = {
        title: title.trim(),
        description: description.trim() || null,
        priceCents: priceCents,
        originalPriceCents: originalPrice === "" ? null : origCents,
        unit: unitFinal,
        // imageUrl & slug NICHT änderbar → nicht senden
        tags: tags.split(",").map(s => s.trim()).filter(Boolean),
        isActive: !!isActive,
        kind,
        weekday: kind === OfferKind.RECURRING_WEEKDAY ? weekday || null : null,
        date: kind === OfferKind.ONE_DAY ? (date || null) : null,
        startDate: kind === OfferKind.DATE_RANGE ? (startDate || null) : null,
        endDate: kind === OfferKind.DATE_RANGE ? (endDate || null) : null,
        locations,
        priority: Number(priority ?? 0),
        products: linked.map((l: any) => ({
          productId: l.product.id,
          role: l.role,
          quantity: l.quantity,
          perItemPriceCents: l.perItemPriceCents ?? null
        })),
      };

      const res = await fetch(`/api/offers/${o.id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(()=> ({}));
        alert(j?.error || "Konnte Angebot nicht speichern.");
      }
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-2xl border bg-white/90 p-4 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/80 dark:ring-white/10">
      {/* Kopf */}
      <div className="grid grid-cols-[56px,1fr,auto] gap-3 sm:grid-cols-[56px,1fr,auto]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-14 w-14 rounded object-cover ring-1 ring-black/10 dark:ring-white/10"
          />
        ) : (
          <div className="h-14 w-14 rounded bg-zinc-100 ring-1 ring-black/10 dark:bg-zinc-800 dark:ring-white/10" />
        )}

        <div className="min-w-0">
          <div className="truncate font-medium">{title || "—"}</div>
          {(o.tags?.length ?? 0) > 0 && (
            <div className="mt-1 flex flex-wrap gap-1 text-xs text-zinc-600">
              {(o.tags ?? []).map(t => (
                <span
                  key={t}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 ring-1 ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          {(o as any).originalPriceCents != null && (o as any).originalPriceCents > 0 && (
            <div className="text-xs line-through text-zinc-500 tabular-nums">
              {euro((o as any).originalPriceCents)}
            </div>
          )}
          <div className="text-sm font-semibold tabular-nums">
            {Number.isNaN(priceCents) ? "" : euro(priceCents)}
          </div>
        </div>
      </div>

      {/* Formular */}
      <div className="mt-4 grid gap-3 md:grid-cols-6">
        {/* Titel */}
        <input
          className="border p-2 rounded md:col-span-2 bg-white dark:bg-zinc-800"
          placeholder="Titel"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {/* Preis (Jetzt) */}
        <div className="relative">
          <input
            inputMode="decimal"
            className={`w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800 ${priceInvalid ? "ring-1 ring-red-400" : ""}`}
            placeholder="0,00"
            value={price}
            onChange={e => {
              const v = e.target.value.replace(/\./g, ",");
              if (v === "" || PRICE_RE.test(v)) setPrice(v);
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
        </div>

        {/* Statt-Preis */}
        <div className="relative">
          <input
            inputMode="decimal"
            className={`w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800 ${origInvalid ? "ring-1 ring-red-400" : ""}`}
            placeholder="Statt-Preis 0,00"
            value={originalPrice}
            onChange={e => {
              const v = e.target.value.replace(/\./g, ",");
              if (v === "" || PRICE_RE.test(v)) setOriginalPrice(v);
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
        </div>

        {/* Einheit (Select/Custom) */}
        <div className="space-y-1 md:col-span-2">
          {!customUnitMode ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,auto]">
              <SelectBox
                ariaLabel="Einheit auswählen"
                value={unit}
                onChange={v => setUnit(v)}
                options={Array.from(new Set([unit, ...allUnits]))}
              />
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => setCustomUnitMode(true)}
              >
                Einheit hinzufügen
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                placeholder="z. B. 250 g"
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value)}
              />
              <button
                type="button"
                className="w-full sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                disabled={!customUnit.trim()}
                onClick={() => { if (customUnit.trim()) setUnit(customUnit.trim()); setCustomUnit(""); setCustomUnitMode(false); }}
              >
                Übernehmen
              </button>
              <button
                type="button"
                className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => { setCustomUnit(""); setCustomUnitMode(false); }}
              >
                Abbruch
              </button>
            </div>
          )}
        </div>

        {/* Tags / Beschreibung */}
        <input
          className="border p-2 rounded md:col-span-3 bg-white dark:bg-zinc-800"
          placeholder="Tags (kommagetrennt)"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
        <input
          className="border p-2 rounded md:col-span-3 bg-white dark:bg-zinc-800"
          placeholder="Beschreibung"
          value={description}
          onChange={e => setDesc(e.target.value)}
        />

        {/* Art */}
        <select
          className="border p-2 rounded md:col-span-2 bg-white dark:bg-zinc-800"
          value={kind}
          onChange={e => setKind(e.target.value as OfferKind)}
        >
          <option value={OfferKind.DATE_RANGE}>Zeitraum</option>
          <option value={OfferKind.ONE_DAY}>Ein Tag</option>
          <option value={OfferKind.RECURRING_WEEKDAY}>Wöchentlich</option>
        </select>

        {kind === OfferKind.RECURRING_WEEKDAY && (
          <select
            className="border p-2 rounded md:col-span-2 bg-white dark:bg-zinc-800"
            value={weekday ?? ""}
            onChange={e => setWeekday(e.target.value as Weekday)}
          >
            <option value="">— Wochentag —</option>
            {WEEKDAYS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        )}
        {kind === OfferKind.ONE_DAY && (
          <input
            className="border p-2 rounded md:col-span-2 bg-white dark:bg-zinc-800"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        )}
        {kind === OfferKind.DATE_RANGE && (
          <>
            <input
              className="border p-2 rounded bg-white dark:bg-zinc-800"
              type="date"
              value={startDate}
              onChange={e => setStart(e.target.value)}
            />
            <input
              className="border p-2 rounded bg-white dark:bg-zinc-800"
              type="date"
              value={endDate}
              onChange={e => setEnd(e.target.value)}
            />
          </>
        )}

        {/* Verknüpfte Produkte */}
        <div className="md:col-span-6">
          <OfferProductsEditor value={linked} onChange={setLinked} />
        </div>

        {/* Filialen + Aktiv + Prio */}
        <div className="md:col-span-6 flex flex-wrap items-center gap-2 p-2 rounded border bg-white/50 dark:bg-zinc-900/30">
          {([Location.RECKE, Location.METTINGEN] as const).map(l => {
            const active = locations.includes(l);
            return (
              <button
                key={l}
                type="button"
                onClick={() => toggleLocation(l)}
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

          <label className="ms-auto flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={e => setActive(e.target.checked)} />
            Aktiv
          </label>
          <input
            className="w-28 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            type="number"
            placeholder="Priorität"
            value={priority}
            onChange={e => setPriority(Number(e.target.value))}
          />
        </div>

        {/* Aktionen */}
        <div className="md:col-span-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={save}
            disabled={!changed || priceInvalid || origInvalid || !!saving}
            className="w-full sm:w-auto rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
          >
            {saving ? "Speichere…" : "Änderungen speichern"}
          </button>
          <button
            className="w-full sm:w-auto rounded-md px-3 py-2 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50 hover:ring-red-300 dark:text-red-400 dark:ring-red-800/60 dark:hover:bg-red-900/20"
            onClick={onDelete}
            title="Dieses Angebot löschen"
          >
            Löschen
          </button>
        </div>
      </div>
    </li>
  );
}
