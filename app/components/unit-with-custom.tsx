// app/components/unit-with-custom.tsx
"use client";

import { useState } from "react";
import SelectBox from "@/app/components/select-box";

export default function UnitWithCustom({
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
