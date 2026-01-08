// app/admin/about/components/items/stats-editor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createStat, deleteStat, updateStat, getSectionById } from "../../actions";
import { useSortableList } from "../dnd/use-sortable-list";
import ReorderHeader from "../dnd/reorder-header";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

type StatDTO = AboutSectionDTO["stats"][number];

export default function StatsEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await getSectionById(section.id);
    onUpdated(next);
  }

  const statsSorted = useMemo(() => {
    const aNum = (n: unknown) => (Number.isFinite(Number(n)) ? Number(n) : 0);
    return [...section.stats].sort(
      (a, b) =>
        aNum((a as any).sortOrder) - aNum((b as any).sortOrder) ||
        String(a.id).localeCompare(String(b.id))
    );
  }, [section.stats]);

  async function persistOrder(nextLocal: StatDTO[]) {
    setBusy(true);
    try {
      await Promise.all(
        nextLocal.map((it, i) =>
          updateStat({
            id: it.id,
            label: it.label,
            value: it.value,
            sortOrder: i,
          })
        )
      );

      onUpdated({
        ...section,
        stats: nextLocal.map((it, i) => ({ ...it, sortOrder: i })),
      } as AboutSectionDTO);

      await refreshSection();
    } finally {
      setBusy(false);
    }
  }

  const sortable = useSortableList({
    items: statsSorted,
    onReorderPersist: async (next) => {
      const idToIndex = new Map(next.map((n: any) => [n.id, n.sortOrder]));
      const nextLocal = statsSorted
        .slice()
        .sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0));
      await persistOrder(nextLocal);
    },
  });

  useEffect(() => {
    sortable.setLocalOrder(statsSorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, statsSorted.map((s) => `${s.id}:${(s as any).sortOrder}`).join("|")]);

  async function moveByArrow(id: string, dir: -1 | 1) {
    if (busy) return;

    const items = sortable.items as StatDTO[];
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
      <div className="text-sm font-semibold">Stats</div>

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
                <BarChart3 size={16} />
              </span>
              <div className="text-sm font-semibold">Neuer Stat</div>
            </div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Sortierung per Drag & Drop oder Pfeilen.
            </div>
          </div>
        </div>

        {/* ✅ Button auf Desktop korrekt auf Input-Höhe */}
        <div className="mt-4 grid gap-3 lg:grid-cols-5 min-w-0">
          <div className="lg:col-span-2 min-w-0">
            <div className="text-xs font-medium mb-1">Label</div>
            <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="lg:col-span-2 min-w-0">
            <div className="text-xs font-medium mb-1">Value</div>
            <TextInput value={value} onChange={(e) => setValue(e.target.value)} />
          </div>

          <div className="min-w-0 flex flex-col">
            <div
              aria-hidden="true"
              className="hidden lg:block text-xs font-medium mb-1 opacity-0 select-none"
            >
              Aktion
            </div>
            <Button
              disabled={busy || !label.trim() || !value.trim()}
              onClick={async () => {
                setBusy(true);
                try {
                  const sortOrder = (sortable.items as StatDTO[]).length;
                  await createStat({ sectionId: section.id, label, value, sortOrder });
                  setLabel("");
                  setValue("");
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
              <BarChart3 size={16} />
            </span>
            <div className="text-sm font-semibold">Vorhandene Stats</div>
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {sortable.items.length} Einträge
          </div>
        </div>

        {sortable.items.length === 0 ? (
          <div className="p-4 text-sm text-zinc-600 dark:text-zinc-400">Noch keine Stats.</div>
        ) : (
          <motion.div layout transition={{ duration: 0.22 }} className="p-3 space-y-3 min-w-0">
            <AnimatePresence initial={false}>
              {(sortable.items as StatDTO[]).map((it, index) => (
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
                        await updateStat({
                          id: it.id,
                          label: n.label,
                          value: n.value,
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
                        await deleteStat(it.id);
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
  item: StatDTO;
  busy: boolean;
  onSave: (n: { label: string; value: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [label, setLabel] = useState(item.label ?? "");
  const [value, setValue] = useState(item.value ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(item.label ?? "");
    setValue(item.value ?? "");
  }, [item.id, item.label, item.value]);

  return (
    <div className="grid gap-2 lg:grid-cols-6 min-w-0">
      <div className="lg:col-span-2 min-w-0">
        <div className="text-xs font-medium mb-1">Label</div>
        <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>

      <div className="lg:col-span-2 min-w-0">
        <div className="text-xs font-medium mb-1">Value</div>
        <TextInput value={value} onChange={(e) => setValue(e.target.value)} />
      </div>

      <div className="lg:col-span-2 flex flex-wrap items-end justify-end gap-2 min-w-0">
        <Button
          disabled={busy || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave({ label, value });
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Speichert…" : "Speichern"}
        </Button>

        <DeleteButton
          confirmText="Stat wirklich löschen?"
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
