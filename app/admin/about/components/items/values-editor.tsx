// app/admin/about/components/items/values-editor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createValue, deleteValue, updateValue, getSectionById } from "../../actions";
import { useSortableList } from "../dnd/use-sortable-list";
import ReorderHeader from "../dnd/reorder-header";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type ValueDTO = AboutSectionDTO["values"][number];

export default function ValuesEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await getSectionById(section.id);
    onUpdated(next);
  }

  const valuesSorted = useMemo(() => {
    const aNum = (n: unknown) => (Number.isFinite(Number(n)) ? Number(n) : 0);
    return [...section.values].sort(
      (a, b) =>
        aNum((a as any).sortOrder) - aNum((b as any).sortOrder) ||
        String(a.id).localeCompare(String(b.id))
    );
  }, [section.values]);

  async function persistOrder(nextLocal: ValueDTO[]) {
    setBusy(true);
    try {
      await Promise.all(
        nextLocal.map((it, i) =>
          updateValue({
            id: it.id,
            title: it.title,
            description: it.description ?? null,
            sortOrder: i,
          })
        )
      );

      onUpdated({
        ...section,
        values: nextLocal.map((it, i) => ({ ...it, sortOrder: i })),
      } as AboutSectionDTO);

      await refreshSection();
    } finally {
      setBusy(false);
    }
  }

  const sortable = useSortableList({
    items: valuesSorted,
    onReorderPersist: async (next) => {
      const idToIndex = new Map(next.map((n: any) => [n.id, n.sortOrder]));
      const nextLocal = valuesSorted
        .slice()
        .sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0));
      await persistOrder(nextLocal);
    },
  });

  useEffect(() => {
    sortable.setLocalOrder(valuesSorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, valuesSorted.map((t) => `${t.id}:${(t as any).sortOrder}`).join("|")]);

  async function moveByArrow(id: string, dir: -1 | 1) {
    if (busy) return;

    const items = sortable.items as ValueDTO[];
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const j = idx + dir;
    if (j < 0 || j >= items.length) return;

    const nextLocal = items.slice();
    const [moved] = nextLocal.splice(idx, 1);
    nextLocal.splice(j, 0, moved);

    sortable.setLocalOrder(nextLocal);
    await persistOrder(nextLocal);
  }

  return (
    <div className="space-y-4 min-w-0">
      <div className="text-sm font-semibold">Werte</div>

      {/* CREATE */}
      <div
        className="
          rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm
          dark:border-zinc-800/80 dark:bg-zinc-950/30
          min-w-0
        "
      >
        <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Sparkles size={16} />
              </span>
              <div className="text-sm font-semibold">Neuer Wert</div>
            </div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Sortierung per Drag & Drop oder Pfeilen.
            </div>
          </div>
        </div>

        {/* ✅ Button auf Desktop korrekt auf Input-Höhe */}
        <div className="mt-4 grid gap-3 lg:grid-cols-6 min-w-0">
          <div className="lg:col-span-2 min-w-0">
            <div className="text-xs font-medium mb-1">Titel</div>
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="lg:col-span-3 min-w-0">
            <div className="text-xs font-medium mb-1">Beschreibung</div>
            <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="min-w-0 flex flex-col">
            <div
              aria-hidden="true"
              className="hidden lg:block text-xs font-medium mb-1 opacity-0 select-none"
            >
              Aktion
            </div>
            <Button
              disabled={busy || !title.trim()}
              onClick={async () => {
                setBusy(true);
                try {
                  const sortOrder = (sortable.items as ValueDTO[]).length;
                  await createValue({
                    sectionId: section.id,
                    title,
                    description: description || null,
                    sortOrder,
                  });

                  setTitle("");
                  setDescription("");
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
      </div>

      {/* LIST */}
      <div
        className="
          rounded-2xl border border-zinc-200/70 bg-white/70 shadow-sm overflow-hidden
          dark:border-zinc-800/80 dark:bg-zinc-950/30
          min-w-0
        "
      >
        <div
          className="
            flex flex-wrap items-center justify-between gap-3
            px-4 py-3 border-b border-zinc-200/70
            dark:border-zinc-800/80
            min-w-0
          "
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Sparkles size={16} />
            </span>
            <div className="text-sm font-semibold">Vorhandene Werte</div>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">{sortable.items.length} Werte</div>
        </div>

        {sortable.items.length === 0 ? (
          <div className="p-4 text-sm text-zinc-600 dark:text-zinc-400">Noch keine Werte.</div>
        ) : (
          <motion.div layout transition={{ duration: 0.22 }} className="p-3 space-y-3 min-w-0">
            <AnimatePresence initial={false}>
              {(sortable.items as ValueDTO[]).map((it, index) => (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="
                    rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm
                    dark:border-zinc-800 dark:bg-zinc-900/40
                    min-w-0
                  "
                  {...sortable.bindDropTarget(it.id)}
                >
                  <ReorderHeader
                    disabled={busy}
                    isFirst={index === 0}
                    isLast={index === sortable.items.length - 1}
                    bindDragHandle={sortable.bindDragHandle(it.id)}
                    onUp={() => void moveByArrow(it.id, -1)}
                    onDown={() => void moveByArrow(it.id, 1)}
                    leftMeta={<div className="text-xs text-zinc-500">Position: {index + 1}</div>}
                  />

                  <Row
                    item={it}
                    busy={busy}
                    onSave={async (n) => {
                      if (busy) return;
                      setBusy(true);
                      try {
                        await updateValue({
                          id: it.id,
                          title: n.title,
                          description: n.description || null,
                          sortOrder: (it as any).sortOrder ?? index,
                        });
                        await refreshSection();
                      } finally {
                        setBusy(false);
                      }
                    }}
                    onDelete={async () => {
                      if (busy) return;
                      setBusy(true);
                      try {
                        await deleteValue(it.id);
                        await refreshSection();
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Row({
  item,
  busy,
  onSave,
  onDelete,
}: {
  item: ValueDTO;
  busy: boolean;
  onSave: (n: { title: string; description: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(item.title ?? "");
    setDescription(item.description ?? "");
  }, [item.id, item.title, item.description]);

  return (
    <div className="grid gap-2 lg:grid-cols-6 min-w-0">
      <div className="lg:col-span-2 min-w-0">
        <div className="text-xs font-medium mb-1">Titel</div>
        <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="lg:col-span-4 min-w-0">
        <div className="text-xs font-medium mb-1">Beschreibung</div>
        <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-2 min-w-0">
        <Button
          disabled={busy || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ title, description });
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Speichert…" : "Speichern"}
        </Button>

        <DeleteButton
          confirmText="Wert wirklich löschen?"
          disabled={busy || saving}
          onDelete={async () => {
            setSaving(true);
            try {
              await onDelete();
            } finally {
              setSaving(false);
            }
          }}
        />
      </div>
    </div>
  );
}
