// /app/components/new-product-form.tsx
"use client"
import { useState } from "react"
import SelectBox from "./select-box"
import ImageUploader from "./image-uploader"
import { PRICE_RE, parseEuroToCents } from "../lib/format"
import { parseTags } from "../lib/tags"
import { ALLERGENS, ALLERGEN_LABEL, type Allergen } from "@/app/lib/allergens";

type Props = {
  allUnits: string[]
  allTags: string[]
  onCreated?: () => void
}

export default function NewProductForm({ allUnits, allTags, onCreated }: Props) {
  const [name, setName] = useState("")
  const [priceEuro, setPriceEuro] = useState("")
  const [unit, setUnit] = useState("pro Stück")
  const [customUnitMode, setCustomUnitMode] = useState(false)
  const [customUnit, setCustomUnit] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [chosenTags, setChosenTags] = useState<string[]>([])
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [isActive, setIsActive] = useState(true)
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)

  function toggleAllergen(a: Allergen) {
    setAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  function addTagFromInput() {
    const parts = parseTags(tagInput)
    if (!parts.length) return
    const merged = Array.from(new Set([...chosenTags, ...parts]))
    setChosenTags(merged)
    setTagInput("")
  }
  function removeChosenTag(tag: string) {
    setChosenTags(chosenTags.filter(x => x !== tag))
  }

  const priceCentsNew = parseEuroToCents(priceEuro)
  const priceInvalidNew = Number.isNaN(priceCentsNew)
  const hasTitle = !!name.trim()
  const hasImage = !!imageUrl
  const hasTags = chosenTags.length > 0
  const unitOk = customUnitMode ? !!customUnit.trim() : !!unit.trim()
  const formValid = hasTitle && !priceInvalidNew && hasImage && hasTags && unitOk

  async function create() {
    if (!formValid) { setShowErrors(true); return }
    setSaving(true)
    try {
      const finalUnit = (customUnitMode ? customUnit : unit).trim() || "pro Stück"
      const payload = {
        name: name.trim(),
        priceCents: priceCentsNew,
        unit: finalUnit,
        imageUrl: imageUrl || null,
        tags: chosenTags,
        allergens: allergens,
        isActive: !!isActive,
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err?.error || "Fehler beim Anlegen")
        return
      }
      // reset
      setName("")
      setPriceEuro("")
      setUnit("pro Stück")
      setCustomUnitMode(false)
      setCustomUnit("")
      setImageUrl("")
      setTagInput("")
      setChosenTags([])
      setAllergens([])
      setIsActive(true)
      setShowErrors(false)
      onCreated?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-white/90 p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/80 dark:ring-white/10">
      {/* Titel */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Titel</label>
        <input
          className={`w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 ${showErrors && !hasTitle ? "ring-1 ring-red-400" : ""}`}
          placeholder="z. B. Käsekuchen"
          value={name}
          onChange={e => { setName(e.target.value); if (showErrors) setShowErrors(false) }}
        />
      </div>

      {/* Preis + Einheit */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Preis</label>
          <div className="relative">
            <input
              inputMode="decimal"
              className={`w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800 ${showErrors && priceInvalidNew ? "ring-1 ring-red-400" : ""}`}
              placeholder="0,00"
              value={priceEuro}
              onChange={e => {
                const v = e.target.value.replace(/\./g, ",")
                if (v === "" || PRICE_RE.test(v)) {
                  setPriceEuro(v)
                  if (showErrors) setShowErrors(false)
                }
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
          </div>
        </div>

        <div className="space-y-1">
        <label className="text-sm font-medium">Einheit</label>

        {!customUnitMode ? (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <SelectBox
                ariaLabel="Einheit auswählen"
                value={unit}
                onChange={(v) => { setUnit(v); if (showErrors) setShowErrors(false) }}
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
            <div className="flex flex-col gap-2">
            <input
                className={`min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 ${showErrors && !unitOk ? "ring-1 ring-red-400" : ""}`}
                placeholder="z. B. 250 g"
                value={customUnit}
                onChange={e => { setCustomUnit(e.target.value); if (showErrors) setShowErrors(false) }}
            />

            {/* HIER: mobil untereinander, ab sm nebeneinander */}
            <div className="flex flex-col gap-2 sm:flex-row">
                <button
                type="button"
                className="w-full sm:w-auto sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                disabled={!customUnit.trim()}
                onClick={() => {
                    const v = customUnit.trim()
                    if (v) setUnit(v)
                    setCustomUnit("")
                    setCustomUnitMode(false)
                }}
                >
                Übernehmen
                </button>
                <button
                type="button"
                className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => { setCustomUnitMode(false); setCustomUnit("") }}
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
        <ImageUploader folder="products" imageUrl={imageUrl} onChange={setImageUrl} />
      </div>

      {/* Tags */}
      <div className={`space-y-2 ${showErrors && !hasTags ? "ring-1 ring-red-400 rounded-md p-2" : ""}`}>
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
              const active = chosenTags.includes(t)
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
                      : "bg-zinc-100 ring-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200"
                  ].join(" ")}
                >
                  {t}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="z. B. Brot, Vollkorn"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTagFromInput() } }}
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

      <div className="min-w-0">
        <label className="text-sm font-medium">
          Allergene <span className="ml-1 text-xs text-zinc-500">(optional)</span>
        </label>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {ALLERGENS.map((a) => {
            const active = allergens.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAllergen(a)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                  active
                    ? "bg-rose-100 ring-rose-300 text-rose-900 dark:bg-rose-900/30 dark:ring-rose-700 dark:text-rose-200"
                    : "bg-zinc-100 ring-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200",
                ].join(" ")}
              >
                {ALLERGEN_LABEL[a]}
              </button>
            );
          })}
        </div>

        {allergens.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {allergens.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs ring-1 ring-rose-300 text-rose-900 dark:bg-rose-900/30 dark:ring-rose-700 dark:text-rose-200"
              >
                {ALLERGEN_LABEL[a]}
                <button
                  type="button"
                  aria-label={`${ALLERGEN_LABEL[a]} entfernen`}
                  onClick={() => toggleAllergen(a)}
                  className="-mr-1 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status + Speichern */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          Aktiv anzeigen
        </label>

        <button
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
          onClick={create}
          disabled={saving || !formValid}
        >
          {saving ? "Speichere…" : "Anlegen"}
        </button>
      </div>
    </div>
  )
}