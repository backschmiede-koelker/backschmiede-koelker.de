// app/admin/about/components/items/faq-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createFaq, deleteFaq, updateFaq, getSectionById } from "../../actions";
import { useSortableList } from "../dnd/use-sortable-list";
import ReorderHeader from "../dnd/reorder-header";
import { AnimatePresence, motion } from "motion/react";

export default function FaqEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await getSectionById(section.id);
    onUpdated(next);
  }

  const sortable = useSortableList({
    items: section.faqs,
    onReorderPersist: async (next) => {
      await Promise.all(
        next.map((n) => {
          const current = section.faqs.find((f) => f.id === n.id);
          if (!current) return Promise.resolve();
          return updateFaq({
            id: n.id,
            question: current.question,
            answer: current.answer,
            sortOrder: n.sortOrder,
          });
        })
      );
      await refreshSection();
    },
  });

  const items = sortable.items;

  async function moveByArrow(id: string, dir: -1 | 1) {
    if (busy) return;

    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const j = idx + dir;
    if (j < 0 || j >= items.length) return;

    const nextLocal = items.slice();
    const [moved] = nextLocal.splice(idx, 1);
    nextLocal.splice(j, 0, moved);
    sortable.setLocalOrder(nextLocal);

    setBusy(true);
    try {
      await Promise.all(
        nextLocal.map((it, i) =>
          updateFaq({
            id: it.id,
            question: it.question,
            answer: it.answer,
            sortOrder: i,
          })
        )
      );
      await refreshSection();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 min-w-0">
      <div className="text-sm font-semibold">FAQ</div>

      {/* CREATE */}
      <div className="grid gap-2 lg:grid-cols-6 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <div className="text-xs font-medium mb-1">Frage</div>
          <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>

        <div className="lg:col-span-3 min-w-0">
          <div className="text-xs font-medium mb-1">Antwort</div>
          <TextInput value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>

        {/* ✅ Button auf Desktop neben den Feldern + auf Input-Höhe */}
        <div className="lg:col-span-1 min-w-0 flex flex-col">
          <div
            aria-hidden="true"
            className="hidden lg:block text-xs font-medium mb-1 opacity-0 select-none"
          >
            Aktion
          </div>
          <Button
            disabled={busy || !question.trim() || !answer.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                await createFaq({
                  sectionId: section.id,
                  question,
                  answer,
                  sortOrder: items.length,
                });
                setQuestion("");
                setAnswer("");
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

      {/* LIST */}
      <motion.div layout transition={{ duration: 0.22 }} className="space-y-2 min-w-0">
        <AnimatePresence initial={false}>
          {items.map((it, index) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/20 p-3 min-w-0"
              {...sortable.bindDropTarget(it.id)}
            >
              <ReorderHeader
                disabled={busy}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                bindDragHandle={sortable.bindDragHandle(it.id)}
                onUp={() => void moveByArrow(it.id, -1)}
                onDown={() => void moveByArrow(it.id, 1)}
                leftMeta={<div className="text-xs text-zinc-500">Position: {index + 1}</div>}
              />

              <Row
                q0={it.question}
                a0={it.answer}
                busy={busy}
                onSave={async (n) => {
                  setBusy(true);
                  try {
                    await updateFaq({
                      id: it.id,
                      question: n.question,
                      answer: n.answer,
                      sortOrder: it.sortOrder,
                    });
                    await refreshSection();
                  } finally {
                    setBusy(false);
                  }
                }}
                onDelete={async () => {
                  setBusy(true);
                  try {
                    await deleteFaq(it.id);
                    await refreshSection();
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Noch keine FAQ-Einträge.</div>
        )}
      </motion.div>
    </div>
  );
}

function Row({
  q0,
  a0,
  busy,
  onSave,
  onDelete,
}: {
  q0: string;
  a0: string;
  busy: boolean;
  onSave: (n: { question: string; answer: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [question, setQuestion] = useState(q0);
  const [answer, setAnswer] = useState(a0);

  return (
    <div className="grid gap-2 lg:grid-cols-6 min-w-0">
      <div className="lg:col-span-3 min-w-0">
        <div className="text-xs font-medium mb-1">Frage</div>
        <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} />
      </div>
      <div className="lg:col-span-3 min-w-0">
        <div className="text-xs font-medium mb-1">Antwort</div>
        <TextInput value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </div>

      <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-2 min-w-0">
        <Button disabled={busy} onClick={() => void onSave({ question, answer })}>
          Speichern
        </Button>
        <DeleteButton confirmText="FAQ wirklich löschen?" disabled={busy} onDelete={onDelete} />
      </div>
    </div>
  );
}
