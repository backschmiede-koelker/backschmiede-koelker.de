// app/admin/offers/components/location-priority-row.tsx
import React from "react";
import FieldLabel from "@/app/components/ui/field-label";
import { Location } from "@/app/types/offers";

export default function LocationPriorityRow({
  locations,
  onToggleLocation,
  priority,
  onPriorityChange,
}: {
  locations: Location[];
  onToggleLocation: (l: Location) => void;
  priority: number;
  onPriorityChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="min-w-0">
        <FieldLabel hint="In welchen Filialen gilt das Angebot? Standard: beide.">
          Filialen
        </FieldLabel>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {([Location.RECKE, Location.METTINGEN] as const).map((l) => {
            const active = locations.includes(l);
            return (
              <button
                key={l}
                type="button"
                onClick={() => onToggleLocation(l)}
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
        <FieldLabel hint="Höhere Zahl = weiter oben in der Liste. Normalerweise 0 lassen.">
          Priorität
        </FieldLabel>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
          type="number"
          value={priority}
          onChange={(e) => onPriorityChange(Number(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}
