// app/components/ui/unit-selector.tsx
import React, { useState } from "react";
import SelectBox from "@/app/components/select-box";

type Props = {
  value: string;
  onChange: (v: string) => void;
  allUnits: string[];
  placeholder?: string;
  addLabel?: string;
  customPlaceholder?: string;
  className?: string;
};

/**
 * Einheitenauswahl mit „Einheit hinzufügen“.
 * - Bis <2xl: Select und Button **untereinander** (mehr Breite pro Element, kein Quetschen).
 * - Ab 2xl: Select links, Button rechts in einer Zeile.
 * - Konstante Mindesthöhe verhindert Layout-Sprünge beim Umschalten in den Custom-Mode.
 */
export default function UnitSelector({
  value,
  onChange,
  allUnits,
  placeholder = "pro Stück",
  addLabel = "Einheit hinzufügen",
  customPlaceholder = "z. B. Stück",
  className,
}: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");

  return (
    <div className={className}>
      <div className="min-h-[112px]">
        {!customMode ? (
          // Hinweis: erst AB 2xl nebeneinander - darunter gestapelt
          <div className="grid gap-2 2xl:grid-cols-[minmax(0,1fr),auto]">
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
              className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
              onClick={() => setCustomMode(true)}
            >
              {addLabel}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              className="min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              placeholder={customPlaceholder}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="w-full sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
                disabled={!customValue.trim()}
                onClick={() => {
                  const v = customValue.trim();
                  if (v) onChange(v);
                  setCustomValue("");
                  setCustomMode(false);
                }}
              >
                Übernehmen
              </button>
              <button
                type="button"
                className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
                onClick={() => { setCustomValue(""); setCustomMode(false); }}
              >
                Abbruch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
