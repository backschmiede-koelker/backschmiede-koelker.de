// app/admin/about/components/items/timeline-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createTimeline, deleteTimeline, updateTimeline, getSectionById } from "../../actions";

export default function TimelineEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await getSectionById(section.id);
    onUpdated(next);
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Timeline</div>

      <div className="grid gap-2 md:grid-cols-5">
        <div>
          <div className="text-xs font-medium mb-1">Jahr</div>
          <TextInput value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Titel</div>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Beschreibung</div>
          <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Sort</div>
          <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="md:col-span-4 flex items-end">
          <Button
            disabled={busy || !year.trim() || !title.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                await createTimeline({
                  sectionId: section.id,
                  year,
                  title,
                  description: description || null,
                  sortOrder,
                });
                setYear("");
                setTitle("");
                setDescription("");
                setSortOrder(0);
                await refreshSection();
              } finally {
                setBusy(false);
              }
            }}
          >
            Hinzufügen
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {section.timeline.map((it) => (
          <div key={it.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
            <Row
              year0={it.year}
              title0={it.title}
              desc0={it.description ?? ""}
              sort0={it.sortOrder}
              onSave={async (n) => {
                await updateTimeline({ id: it.id, year: n.year, title: n.title, description: n.description || null, sortOrder: n.sortOrder });
                await refreshSection();
              }}
              onDelete={async () => {
                await deleteTimeline(it.id);
                await refreshSection();
              }}
            />
          </div>
        ))}
        {section.timeline.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Noch keine Timeline-Einträge.</div>
        )}
      </div>
    </div>
  );
}

function Row({
  year0,
  title0,
  desc0,
  sort0,
  onSave,
  onDelete,
}: {
  year0: string;
  title0: string;
  desc0: string;
  sort0: number;
  onSave: (n: { year: string; title: string; description: string; sortOrder: number }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [year, setYear] = useState(year0);
  const [title, setTitle] = useState(title0);
  const [description, setDescription] = useState(desc0);
  const [sortOrder, setSortOrder] = useState(sort0);
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-2 md:grid-cols-6">
      <div>
        <div className="text-xs font-medium mb-1">Jahr</div>
        <TextInput value={year} onChange={(e) => setYear(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <div className="text-xs font-medium mb-1">Titel</div>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <div className="text-xs font-medium mb-1">Beschreibung</div>
        <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <div className="text-xs font-medium mb-1">Sort</div>
        <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
      </div>

      <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-2">
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave({ year, title, description, sortOrder });
            } finally {
              setBusy(false);
            }
          }}
        >
          Speichern
        </Button>
        <DeleteButton
          confirmText="Timeline-Eintrag wirklich löschen?"
          disabled={busy}
          onDelete={async () => {
            setBusy(true);
            try {
              await onDelete();
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    </div>
  );
}
