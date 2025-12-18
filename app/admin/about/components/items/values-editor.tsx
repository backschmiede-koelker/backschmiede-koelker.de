// app/admin/about/components/items/values-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createValue, deleteValue, updateValue, updateSection } from "../../actions";

export default function ValuesEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await updateSection({
      id: section.id,
      type: section.type,
      slug: section.slug,
      title: section.title ?? null,
      subtitle: section.subtitle ?? null,
      body: section.body ?? null,
      imageUrl: section.imageUrl ?? null,
      isActive: section.isActive,
      sortOrder: section.sortOrder,
    });
    onUpdated(next);
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Werte</div>

      <div className="grid gap-2 md:grid-cols-4">
        <div>
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
        <div className="md:col-span-4">
          <Button
            disabled={busy || !title.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                await createValue({
                  sectionId: section.id,
                  title,
                  description: description || null,
                  sortOrder,
                });
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
        {section.values.map((it) => (
          <div key={it.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
            <Row
              title0={it.title}
              description0={it.description ?? ""}
              sort0={it.sortOrder}
              onSave={async (n) => {
                await updateValue({ id: it.id, title: n.title, description: n.description || null, sortOrder: n.sortOrder });
                await refreshSection();
              }}
              onDelete={async () => {
                await deleteValue(it.id);
                await refreshSection();
              }}
            />
          </div>
        ))}
        {section.values.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Noch keine Werte.</div>
        )}
      </div>
    </div>
  );
}

function Row({
  title0,
  description0,
  sort0,
  onSave,
  onDelete,
}: {
  title0: string;
  description0: string;
  sort0: number;
  onSave: (n: { title: string; description: string; sortOrder: number }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(title0);
  const [description, setDescription] = useState(description0);
  const [sortOrder, setSortOrder] = useState(sort0);
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-2 md:grid-cols-6">
      <div className="md:col-span-2">
        <div className="text-xs font-medium mb-1">Titel</div>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="md:col-span-3">
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
              await onSave({ title, description, sortOrder });
            } finally {
              setBusy(false);
            }
          }}
        >
          Speichern
        </Button>
        <DeleteButton
          confirmText="Wert wirklich löschen?"
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
