// app/admin/events/components/event-card.tsx
"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/app/types/event";
import ImageUploader from "@/app/components/image-uploader";
import { fmtDate } from "@/app/lib/time";

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function niceDate(iso: string) {
  return fmtDate(iso, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function EventCard({
  item,
  onSaved,
  onDelete,
}: {
  item: EventItem;
  onSaved?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [caption, setCaption] = useState(item.caption);
  const [description, setDescription] = useState(item.description ?? "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [startsAt, setStartsAt] = useState(item.startsAt);
  const [endsAt, setEndsAt] = useState<string | null>(item.endsAt ?? null);
  const [isActive, setIsActive] = useState(!!item.isActive);

  const [saving, setSaving] = useState(false);

  const changed = useMemo(() => {
    return (
      caption.trim() !== item.caption ||
      (description.trim() || "") !== (item.description ?? "") ||
      (imageUrl || "") !== (item.imageUrl ?? "") ||
      startsAt !== item.startsAt ||
      (endsAt ?? null) !== (item.endsAt ?? null) ||
      isActive !== item.isActive
    );
  }, [caption, description, imageUrl, startsAt, endsAt, isActive, item]);

  const captionOk = !!caption.trim();
  const startsOk = Number.isFinite(new Date(startsAt).getTime());
  const canSave = changed && captionOk && startsOk && !saving;

  async function save() {
    if (!captionOk || !startsOk) {
      alert("Bitte Caption und Startdatum prüfen.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl || null,
          startsAt,
          endsAt,
          isActive,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Konnte Termin nicht speichern.");
        return;
      }

      onSaved?.();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="min-w-0">
      <div className="admin-surface admin-pad min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium break-words">{item.caption}</div>
            <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              {niceDate(item.startsAt)} ·{" "}
              <span className={item.isActive ? "text-emerald-700 dark:text-emerald-300 font-semibold" : "text-zinc-600 dark:text-zinc-300 font-semibold"}>
                {item.isActive ? "Aktiv" : "Inaktiv"}
              </span>
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
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Caption</label>
                <input
                  className={[
                    "w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800",
                    !captionOk ? "ring-1 ring-red-400" : "",
                  ].join(" ")}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={[
                    "w-full inline-flex items-center justify-center rounded-md px-3 py-2 text-sm ring-1 transition",
                    isActive
                      ? "text-emerald-800 ring-emerald-300/60 hover:bg-emerald-50 dark:text-emerald-200 dark:ring-emerald-700/60 dark:hover:bg-emerald-900/20"
                      : "text-zinc-700 ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {isActive ? "Aktiv" : "Inaktiv"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Start</label>
                <input
                  type="datetime-local"
                  className={[
                    "w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800",
                    !startsOk ? "ring-1 ring-red-400" : "",
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <ImageUploader folder="events" imageUrl={imageUrl} onChange={setImageUrl} />

            <div className="admin-btn-row admin-btn-row-2 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={save}
                disabled={!canSave}
                className={[
                  "w-full sm:flex-1 min-w-0 rounded-md px-4 py-2 text-sm text-white",
                  "bg-emerald-700 hover:bg-emerald-800",
                  "dark:bg-emerald-500 dark:hover:bg-emerald-400",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-400",
                  "disabled:opacity-60",
                ].join(" ")}
              >
                {saving ? "Speichere…" : "Änderungen speichern"}
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="w-full sm:w-auto rounded-md px-4 py-2 text-sm text-red-700 ring-1 ring-red-300 hover:bg-red-50 dark:text-red-300 dark:ring-red-800/60 dark:hover:bg-red-900/20"
              >
                Löschen
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
