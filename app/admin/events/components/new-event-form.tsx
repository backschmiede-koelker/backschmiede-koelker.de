// app/admin/events/components/new-event-form.tsx
"use client";

import { useMemo, useState } from "react";
import ImageUploader from "@/app/components/image-uploader";
import { LOCATION_OPTIONS, type LocationKey, locationLabel } from "@/app/lib/locations";

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewEventForm({ onCreated }: { onCreated?: () => void }) {
  const nowIso = useMemo(() => new Date().toISOString(), []);
  const [open, setOpen] = useState(false);

  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startsAt, setStartsAt] = useState(nowIso);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [locations, setLocations] = useState<LocationKey[]>(["RECKE", "METTINGEN"]);

  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const captionOk = !!caption.trim();
  const startsOk = Number.isFinite(new Date(startsAt).getTime());
  const formOk = captionOk && startsOk;

  function onToggleLocation(l: LocationKey) {
    setLocations((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  }

  async function create() {
    if (!formOk) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl || null,
          startsAt,
          endsAt,
          isActive,
          locations,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Fehler beim Anlegen");
        return;
      }

      setCaption("");
      setDescription("");
      setImageUrl("");
      setStartsAt(nowIso);
      setEndsAt(null);
      setIsActive(true);
      setShowErrors(false);

      onCreated?.();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-surface admin-pad min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Neuen Termin anlegen</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Erstelle einen neuen Termin.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={[
            "shrink-0 rounded-xl px-3 py-2 text-sm ring-1",
            "bg-white/80 hover:bg-zinc-50 ring-zinc-300",
            "dark:bg-white/5 dark:hover:bg-white/10 dark:ring-white/10",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
          ].join(" ")}
        >
          {open ? "Schließen" : "Öffnen"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 min-w-0">
          <div className="space-y-1">
            <label className="text-sm font-medium">Titel</label>
            <input
              className={[
                "w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800",
                showErrors && !captionOk ? "ring-1 ring-red-400" : "",
              ].join(" ")}
              placeholder="z. B. Sommerfest"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Start</label>
              <input
                type="datetime-local"
                className={[
                  "w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800",
                  showErrors && !startsOk ? "ring-1 ring-red-400" : "",
                ].join(" ")}
                value={toLocalInputValue(startsAt)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  setStartsAt(new Date(v).toISOString());
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Ende{" "}
                <span className="font-normal text-zinc-500 dark:text-zinc-400">
                  (optional)
                </span>
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                value={endsAt ? toLocalInputValue(endsAt) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setEndsAt(v ? new Date(v).toISOString() : null);
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Beschreibung</label>
            <textarea
              className="w-full min-h-[90px] rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              placeholder="z. B. Verkostung, Aktionen, Infos…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="text-sm font-medium">
              Filialen
              <span className="ml-1 text-xs text-zinc-500">
                (Standard: beide)
              </span>
            </label>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {LOCATION_OPTIONS.map((l) => {
                const active = locations.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onToggleLocation(l)}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                      active
                        ? "bg-emerald-100 ring-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:ring-emerald-700 dark:text-emerald-200"
                        : "bg-zinc-100 ring-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200",
                    ].join(" ")}
                  >
                    {locationLabel(l)}
                  </button>
                );
              })}
            </div>
          </div>

          <ImageUploader folder="events" imageUrl={imageUrl} onChange={setImageUrl} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Aktiv
            </label>

            <button
              type="button"
              onClick={create}
              disabled={saving || !formOk}
              className={[
                "rounded-md px-4 py-2 text-sm text-white",
                "bg-emerald-700 hover:bg-emerald-800",
                "dark:bg-emerald-500 dark:hover:bg-emerald-400",
                "focus:outline-none focus:ring-2 focus:ring-emerald-400",
                "disabled:opacity-60",
              ].join(" ")}
            >
              {saving ? "Speichere…" : "Anlegen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
