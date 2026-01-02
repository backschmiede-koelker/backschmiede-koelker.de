// app/admin/about/components/items/stats-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createStat, deleteStat, updateStat, getSectionById } from "../../actions";

export default function StatsEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await getSectionById(section.id);
    onUpdated(next);
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Stats</div>

      <div className="grid gap-2 md:grid-cols-4">
        <div>
          <div className="text-xs font-medium mb-1">Label</div>
          <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Value</div>
          <TextInput value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Sort</div>
          <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="flex items-end">
          <Button
            disabled={busy || !label.trim() || !value.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                await createStat({ sectionId: section.id, label, value, sortOrder });
                setLabel("");
                setValue("");
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
        {section.stats.map((it) => (
          <div key={it.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
            <Row
              label0={it.label}
              value0={it.value}
              sort0={it.sortOrder}
              onSave={async (n) => {
                await updateStat({ id: it.id, label: n.label, value: n.value, sortOrder: n.sortOrder });
                await refreshSection();
              }}
              onDelete={async () => {
                await deleteStat(it.id);
                await refreshSection();
              }}
            />
          </div>
        ))}
        {section.stats.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Noch keine Stats.</div>
        )}
      </div>
    </div>
  );
}

function Row({
  label0,
  value0,
  sort0,
  onSave,
  onDelete,
}: {
  label0: string;
  value0: string;
  sort0: number;
  onSave: (n: { label: string; value: string; sortOrder: number }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [label, setLabel] = useState(label0);
  const [value, setValue] = useState(value0);
  const [sortOrder, setSortOrder] = useState(sort0);
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-2 md:grid-cols-6">
      <div className="md:col-span-2">
        <div className="text-xs font-medium mb-1">Label</div>
        <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <div className="text-xs font-medium mb-1">Value</div>
        <TextInput value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div>
        <div className="text-xs font-medium mb-1">Sort</div>
        <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
      </div>
      <div className="flex items-end gap-2">
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave({ label, value, sortOrder });
            } finally {
              setBusy(false);
            }
          }}
        >
          Speichern
        </Button>
        <DeleteButton
          confirmText="Stat wirklich löschen?"
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
