// app/admin/about/components/items/faq-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createFaq, deleteFaq, updateFaq, getSectionById } from "../../actions";
import { useSortableList } from "../dnd/useSortableList";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
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
    <div className="space-y-3">
      <div className="text-sm font-semibold">FAQ</div>

      {/* CREATE */}
      <div className="grid gap-2 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Frage</div>
          <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Antwort</div>
          <TextInput value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>

        <div className="md:col-span-5">
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

      {/* LIST (animiert + DnD DropTarget auf kompletter Row, DragHandle nur am Griff) */}
      <motion.div layout transition={{ duration: 0.22 }} className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((it, index) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/20 p-3 flex gap-3"
              {...sortable.bindDropTarget(it.id)}
            >
              {/* CONTROLS */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <div
                  {...sortable.bindDragHandle(it.id)}
                  className="cursor-grab active:cursor-grabbing rounded-md p-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Ziehen"
                >
                  <GripVertical size={18} />
                </div>

                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void moveByArrow(it.id, -1);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700
                             hover:bg-zinc-100 dark:hover:bg-zinc-800
                             disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Nach oben"
                >
                  <ArrowUp size={16} />
                </button>

                <button
                  type="button"
                  disabled={busy || index === items.length - 1}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void moveByArrow(it.id, 1);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700
                             hover:bg-zinc-100 dark:hover:bg-zinc-800
                             disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Nach unten"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="flex-1">
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Noch keine FAQ-Einträge.
          </div>
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
    <div className="grid gap-2 md:grid-cols-6">
      <div className="md:col-span-3">
        <div className="text-xs font-medium mb-1">Frage</div>
        <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} />
      </div>
      <div className="md:col-span-3">
        <div className="text-xs font-medium mb-1">Antwort</div>
        <TextInput value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </div>

      <div className="md:col-span-6 flex items-center justify-end gap-2">
        <Button disabled={busy} onClick={() => void onSave({ question, answer })}>
          Speichern
        </Button>
        <DeleteButton confirmText="FAQ wirklich löschen?" disabled={busy} onDelete={onDelete} />
      </div>
    </div>
  );
}
