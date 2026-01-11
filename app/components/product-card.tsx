// /app/components/product-card.tsx
"use client"
import { useMemo, useState } from "react"
import { Product } from "../types/product"
import SelectBox from "./select-box"
import { centsToEuroString, parseEuroToCents, PRICE_RE } from "../lib/format"
import { ALLERGENS, ALLERGEN_LABEL, type Allergen } from "@/app/lib/allergens";

type Props = {
  product: Product
  allUnits: string[]
  onSaved?: () => void
  onDelete?: () => void
}

export default function ProductCard({ product: p, allUnits, onSaved, onDelete }: Props) {
  const [editPrice, setEditPrice] = useState(centsToEuroString(p.priceCents))
  const [editUnit, setEditUnit] = useState(p.unit || "pro Stück")
  const [editIsActive, setEditIsActive] = useState(!!p.isActive)
  const [editSaving, setEditSaving] = useState(false)
  const [editCustomUnitMode, setEditCustomUnitMode] = useState(false)
  const [editCustomUnit, setEditCustomUnit] = useState("")
  const [editAllergens, setEditAllergens] = useState<Allergen[]>(p.allergens ?? []);

  function toggleAllergen(a: Allergen) {
    setEditAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  const epInvalid = Number.isNaN(parseEuroToCents(editPrice || ""))

  const changed = useMemo(() => {
    const cents = parseEuroToCents(editPrice || "")
    const allergensChanged =
      [...(p.allergens ?? [])].sort().join(",") !== [...editAllergens].sort().join(",");
    if (Number.isNaN(cents)) return false
    const unitFinal = (editCustomUnitMode ? (editCustomUnit || "").trim() : editUnit) || "pro Stück"
    return cents !== p.priceCents || 
    unitFinal !== (p.unit || "pro Stück") || editIsActive !== p.isActive || allergensChanged
  }, [editPrice, editUnit, editIsActive, editCustomUnitMode, editCustomUnit, editAllergens, p])

  async function saveInline() {
    setEditSaving(true)
    try {
      const cents = parseEuroToCents(editPrice || "")
      if (Number.isNaN(cents)) { alert("Ungültiger Preis"); return }
      const baseUnit = (editUnit || "pro Stück").trim() || "pro Stück"
      const finalUnit = (editCustomUnitMode ? (editCustomUnit || "").trim() : baseUnit) || "pro Stück"
      const active = editIsActive

      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceCents: cents,
          unit: finalUnit,
          isActive: active,
          allergens: editAllergens,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(()=> ({}))
        alert(j?.error || "Konnte Produkt nicht speichern.")
      }
      onSaved?.()
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <li className="rounded-2xl border bg-white/90 p-4 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/80 dark:ring-white/10">
    {/* Statt flex: eine 2-Spalten-Grid nur auf Mobile (Bild | Header) */}
    <div className="grid grid-cols-[56px,1fr] gap-3 sm:grid-cols-[56px,1fr]">
        {p.imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl}
              alt=""
              className="h-14 w-14 rounded object-cover ring-1 ring-black/10 dark:ring-white/10"
            />
          </>
        )}

        {/* Rechts neben dem Bild: Name, Slug, Tags */}
        <div className="min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="truncate font-medium">{p.name}</div>
            <div className="text-xs text-zinc-500 sm:ml-3">{p.slug}</div>
        </div>

        {p.tags?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1 text-xs text-zinc-600">
            {p.tags.map(t => (
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

        {/* Ab hier: volle Breite unter dem Bild */}
        <div className="col-span-2">
        {/* Row 1: Preis + Einheit + Einheit hinzufügen */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Preis */}
            <div className="space-y-1">
            <label className="text-xs text-zinc-500">Preis</label>
            <div className="relative">
                <input
                inputMode="decimal"
                className={`w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800 ${epInvalid ? "ring-1 ring-red-400" : ""}`}
                value={editPrice}
                onChange={e => {
                    const v = e.target.value.replace(/\./g, ",")
                    if (v === "" || PRICE_RE.test(v)) {
                    setEditPrice(v)
                    }
                }}
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
            </div>
            </div>

            {/* Einheit */}
            <div className="space-y-1">
            <label className="text-xs text-zinc-500">Einheit</label>

            {!editCustomUnitMode ? (
                <SelectBox
                ariaLabel={`Einheit für ${p.name}`}
                value={editUnit}
                onChange={(v) => setEditUnit(v)}
                options={Array.from(new Set([editUnit, ...allUnits]))}
                />
            ) : (
                <input
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                placeholder="z. B. 250 g"
                value={editCustomUnit}
                onChange={e => setEditCustomUnit(e.target.value)}
                />
            )}
            </div>

            {/* Einheit hinzufügen / übernehmen */}
            <div className="space-y-1">
            <label className="invisible text-xs">Einheit hinzufügen</label>
            {!editCustomUnitMode ? (
                <button
                type="button"
                className="w-full rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => setEditCustomUnitMode(true)}
                >
                Einheit hinzufügen
                </button>
            ) : (
                // Handy: untereinander; ab sm: nebeneinander
                <div className="flex flex-col gap-2 sm:flex-row">
                <button
                    type="button"
                    className="w-full sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                    disabled={!editCustomUnit.trim()}
                    onClick={() => {
                    const v = editCustomUnit.trim()
                    if (v) setEditUnit(v)
                    setEditCustomUnit("")
                    setEditCustomUnitMode(false)
                    }}
                >
                    Übernehmen
                </button>
                <button
                    type="button"
                    className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => { setEditCustomUnit(""); setEditCustomUnitMode(false) }}
                >
                    Abbruch
                </button>
                </div>
            )}
            </div>
        </div>
        </div>

        <div className="col-span-2">
          <div className="mt-4">
            <div className="text-xs text-zinc-500">Allergene</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {ALLERGENS.map((a) => {
                const active = editAllergens.includes(a);
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
          </div>
        </div>

        {/* Row 2: Aktiv/Inaktiv - volle Breite */}
        <div className="col-span-2">
        <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-3">
            <div>
            <button
                onClick={() => setEditIsActive(a => !a)}
                className={[
                "w-full inline-flex items-center justify-center rounded-md px-3 py-2 text-sm ring-1 transition",
                (editIsActive)
                    ? "text-emerald-700 ring-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:ring-emerald-800/60 dark:hover:bg-emerald-900/20"
                    : "text-zinc-600 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                ].join(" ")}
                title={editIsActive ? "Deaktivieren" : "Aktivieren"}
            >
                {editIsActive ? "Aktiv" : "Inaktiv"}
            </button>
            </div>
            <div className="hidden lg:block" />
            <div className="hidden lg:block" />
        </div>
        </div>

        {/* Row 3: Aktionen - volle Breite */}
        <div className="col-span-2">
            <div className="mt-4 flex flex-col gap-5 sm:flex-row">
                <button
                    onClick={saveInline}
                    disabled={!changed || epInvalid || !!editSaving}
                    className="w-full sm:w-auto rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
                >
                    {editSaving ? "Speichere…" : "Änderungen speichern"}
                </button>

                <button
                    className="w-full sm:w-auto rounded-md px-3 py-2 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50 hover:ring-red-300 dark:text-red-400 dark:ring-red-800/60 dark:hover:bg-red-900/20"
                    onClick={onDelete}
                    title="Dieses Produkt löschen"
                >
                    Löschen
                </button>
            </div>
        </div>
    </div>
    </li>
  )
}
