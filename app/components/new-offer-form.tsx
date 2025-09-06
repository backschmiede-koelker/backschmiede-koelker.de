// /app/components/new-offer-form.tsx
"use client";
import { useMemo, useState } from "react";
import { OfferKind, Weekday, Location } from "@prisma/client";
import SelectBox from "./select-box";
import ImageUploader from "./image-uploader";
import OfferProductsEditor from "./offer-products-editor";
import { PRICE_RE, parseEuroToCents } from "../lib/format";
import { parseTags } from "../lib/tags";

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
  allUnits: string[];
  allTags: string[];
  onCreated?: () => void;
};

export default function NewOfferForm({ allUnits, allTags, onCreated }: Props) {
  const [kind, setKind] = useState<OfferKind>(OfferKind.DATE_RANGE);
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [priceEuro, setPriceEuro] = useState("");
  const [originalPriceEuro, setOriginalPriceEuro] = useState("");
  const [unit, setUnit] = useState("pro Stück");
  const [customUnitMode, setCustomUnitMode] = useState(false);
  const [customUnit, setCustomUnit] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [chosenTags, setChosenTags] = useState<string[]>([]);
  const [weekday, setWeekday] = useState<Weekday | "">("");
  const [date, setDate] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [priority, setPriority] = useState<number | "">("");
  const [isActive, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [linked, setLinked] = useState<any[]>([]); // OfferProductsEditor: {product, role, quantity, perItemPriceCents}

  const priceCentsNew = parseEuroToCents(priceEuro);
  const origCents = parseEuroToCents(originalPriceEuro || "");
  const priceInvalidNew = Number.isNaN(priceCentsNew);
  const origInvalid = originalPriceEuro !== "" && Number.isNaN(origCents);

  const hasTitle = !!title.trim();
  const hasImage = !!imageUrl;
  const unitOk = customUnitMode ? !!customUnit.trim() : !!unit.trim();
  const kindOk =
    (kind === OfferKind.DATE_RANGE && !!startDate && !!endDate) ||
    (kind === OfferKind.ONE_DAY && !!date) ||
    (kind === OfferKind.RECURRING_WEEKDAY && !!weekday);
  const formValid = hasTitle && !priceInvalidNew && !origInvalid && unitOk && hasImage && kindOk;

  function addTagFromInput() {
    const parts = parseTags(tagInput);
    if (!parts.length) return;
    const merged = Array.from(new Set([...chosenTags, ...parts]));
    setChosenTags(merged);
    setTagInput("");
  }

  function removeChosenTag(tag: string) {
    setChosenTags(chosenTags.filter(x => x !== tag));
  }

  function toggleLocation(l: Location) {
    setLocations(s => (s.includes(l) ? s.filter(x => x !== l) : [...s, l]));
  }

  const unitFinal = useMemo(
    () => (customUnitMode ? customUnit.trim() : unit.trim()) || "pro Stück",
    [customUnitMode, customUnit, unit]
  );

  async function create() {
    if (!formValid) { setShowErrors(true); return; }
    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        priceCents: priceCentsNew, // JETZT-Preis
        originalPriceCents: originalPriceEuro === "" ? null : origCents, // STATT-Preis
        unit: unitFinal,
        imageUrl: imageUrl || null,
        tags: chosenTags,
        isActive,
        kind,
        locations,
        priority: priority === "" ? 0 : Number(priority),
        products: linked.map((l: any) => ({
          productId: l.product.id,
          role: l.role,
          quantity: l.quantity,
          perItemPriceCents: l.perItemPriceCents ?? null
        })),
      };
      if (kind === OfferKind.RECURRING_WEEKDAY) payload.weekday = weekday;
      if (kind === OfferKind.ONE_DAY) payload.date = date;
      if (kind === OfferKind.DATE_RANGE) { payload.startDate = startDate; payload.endDate = endDate; }

      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Fehler beim Anlegen");
        return;
      }

      // reset
      setTitle(""); setDesc(""); setPriceEuro(""); setOriginalPriceEuro("");
      setUnit("pro Stück"); setCustomUnitMode(false); setCustomUnit("");
      setImageUrl(""); setTagInput(""); setChosenTags([]);
      setWeekday(""); setDate(""); setStart(""); setEnd("");
      setLocations([]); setPriority(""); setActive(true); setKind(OfferKind.DATE_RANGE);
      setLinked([]);
      setShowErrors(false);
      onCreated?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-white/90 p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/80 dark:ring-white/10">
      <h2 className="text-lg font-semibold">Neues Angebot</h2>

      {/* Titel */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Titel</label>
        <input
          className={`w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 ${showErrors && !hasTitle ? "ring-1 ring-red-400" : ""}`}
          placeholder="z. B. Dinkel-Kruste"
          value={title}
          onChange={e => { setTitle(e.target.value); if (showErrors) setShowErrors(false); }}
        />
      </div>

      {/* Preise + Einheit */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Jetzt-Preis */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Jetzt-Preis</label>
          <div className="relative">
            <input
              inputMode="decimal"
              className={`w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800 ${showErrors && priceInvalidNew ? "ring-1 ring-red-400" : ""}`}
              placeholder="0,00"
              value={priceEuro}
              onChange={e => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) {
                  setPriceEuro(v);
                  if (showErrors) setShowErrors(false);
                }
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
          </div>
        </div>

        {/* Statt-Preis (optional) */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Statt-Preis (optional)</label>
          <div className="relative">
            <input
              inputMode="decimal"
              className={`w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800 ${showErrors && origInvalid ? "ring-1 ring-red-400" : ""}`}
              placeholder="0,00"
              value={originalPriceEuro}
              onChange={e => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) {
                  setOriginalPriceEuro(v);
                  if (showErrors) setShowErrors(false);
                }
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
          </div>
        </div>

        {/* Einheit */}
        <div className="space-y-1 lg:col-span-2">
          <label className="text-sm font-medium">Einheit</label>

          {!customUnitMode ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,auto]">
              <SelectBox
                ariaLabel="Einheit auswählen"
                value={unit}
                onChange={(v) => { setUnit(v); if (showErrors) setShowErrors(false); }}
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
            <div className={`flex flex-col gap-2 ${showErrors && !unitOk ? "ring-1 ring-red-400 rounded-md p-2" : ""}`}>
              <input
                className="min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                placeholder="z. B. 250 g"
                value={customUnit}
                onChange={e => { setCustomUnit(e.target.value); if (showErrors) setShowErrors(false); }}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
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
                  onClick={() => { setCustomUnitMode(false); setCustomUnit(""); }}
                >
                  Abbruch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bild */}
      <div className={`${showErrors && !hasImage ? "ring-1 ring-red-400 rounded-md p-2" : ""}`}>
        <ImageUploader imageUrl={imageUrl} onChange={setImageUrl} />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2">
          {chosenTags.map(t => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs ring-1 ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-700"
            >
              {t}
              <button onClick={() => removeChosenTag(t)} className="ml-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                ×
              </button>
            </span>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(t => {
              const active = chosenTags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setChosenTags(cs => (cs.includes(t) ? cs.filter(x => x !== t) : [...cs, t]))
                  }
                  className={[
                    "rounded-full px-3 py-1 text-xs ring-1 transition",
                    active
                      ? "bg-amber-100 ring-amber-300 text-amber-900 dark:bg-amber-900/30 dark:ring-amber-700 dark:text-amber-200"
                      : "bg-zinc-100 ring-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="z. B. Brot, Vollkorn"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTagFromInput(); } }}
          />
          <button
            type="button"
            onClick={addTagFromInput}
            className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Tag hinzufügen
          </button>
        </div>
      </div>

      {/* Art (Kind) + Zeitfelder */}
      <div className="grid gap-3 rounded-2xl border p-3 ring-1 ring-black/5 dark:ring-white/10">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="kind" checked={kind === OfferKind.DATE_RANGE} onChange={() => setKind(OfferKind.DATE_RANGE)} />
            <span>Zeitraum</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="kind" checked={kind === OfferKind.ONE_DAY} onChange={() => setKind(OfferKind.ONE_DAY)} />
            <span>Ein Tag</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="kind" checked={kind === OfferKind.RECURRING_WEEKDAY} onChange={() => setKind(OfferKind.RECURRING_WEEKDAY)} />
            <span>Wöchentlich (Wochentag)</span>
          </label>
        </div>

        {kind === OfferKind.DATE_RANGE && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              className={`rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 ${showErrors && !startDate ? "ring-1 ring-red-400" : ""}`}
              type="date"
              value={startDate}
              onChange={e => { setStart(e.target.value); if (showErrors) setShowErrors(false); }}
            />
            <input
              className={`rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 ${showErrors && !endDate ? "ring-1 ring-red-400" : ""}`}
              type="date"
              value={endDate}
              onChange={e => { setEnd(e.target.value); if (showErrors) setShowErrors(false); }}
            />
          </div>
        )}

        {kind === OfferKind.ONE_DAY && (
          <div>
            <input
              className={`w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 ${showErrors && !date ? "ring-1 ring-red-400" : ""}`}
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); if (showErrors) setShowErrors(false); }}
            />
          </div>
        )}

        {kind === OfferKind.RECURRING_WEEKDAY && (
          <div>
            <select
              className={`w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 ${showErrors && !weekday ? "ring-1 ring-red-400" : ""}`}
              value={weekday}
              onChange={e => { setWeekday(e.target.value as Weekday); if (showErrors) setShowErrors(false); }}
            >
              <option value="">— Wochentag wählen —</option>
              {WEEKDAYS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Verknüpfte Produkte */}
      <div className="mt-2">
        <OfferProductsEditor value={linked} onChange={setLinked} />
      </div>

      {/* Filialen */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm opacity-70">Filialen:</span>
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
      </div>

      {/* Status & Priorität + Speichern */}
      <div className="grid gap-3 sm:grid-cols-[1fr,auto] items-center">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={e => setActive(e.target.checked)} />
            Aktiv
          </label>
          <input
            className="w-28 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            type="number"
            placeholder="Priorität"
            value={priority}
            onChange={e => setPriority(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
            onClick={create}
            disabled={saving || !formValid}
          >
            {saving ? "Speichere…" : "Anlegen"}
          </button>
        </div>
      </div>
    </section>
  );
}
