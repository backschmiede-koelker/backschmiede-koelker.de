// app/admin/offers/components/actions-bar.tsx
import React from "react";

export default function ActionsBar({
  isActive,
  onToggleActive,
  creating,
  onCreate,
}: {
  isActive: boolean;
  onToggleActive: () => void;
  creating: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <label className="flex items-center gap-2 text-sm sm:mr-auto">
        <input type="checkbox" checked={isActive} onChange={onToggleActive} />
        Aktiv anzeigen
      </label>

      <button
        onClick={onCreate}
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
  );
}
