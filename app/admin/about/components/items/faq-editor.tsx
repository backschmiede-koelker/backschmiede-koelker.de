// app/admin/about/components/items/faq-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createFaq, deleteFaq, updateFaq, updateSection } from "../../actions";

export default function FaqEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
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
      <div className="text-sm font-semibold">FAQ</div>

      <div className="grid gap-2 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Frage</div>
          <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Antwort</div>
          <TextInput value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Sort</div>
          <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="md:col-span-5">
          <Button
            disabled={busy || !question.trim() || !answer.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                await createFaq({ sectionId: section.id, question, answer, sortOrder });
                setQuestion("");
                setAnswer("");
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
        {section.faqs.map((it) => (
          <div key={it.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
            <Row
              q0={it.question}
              a0={it.answer}
              sort0={it.sortOrder}
              onSave={async (n) => {
                await updateFaq({ id: it.id, question: n.question, answer: n.answer, sortOrder: n.sortOrder });
                await refreshSection();
              }}
              onDelete={async () => {
                await deleteFaq(it.id);
                await refreshSection();
              }}
            />
          </div>
        ))}
        {section.faqs.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Noch keine FAQ-Einträge.</div>
        )}
      </div>
    </div>
  );
}

function Row({
  q0,
  a0,
  sort0,
  onSave,
  onDelete,
}: {
  q0: string;
  a0: string;
  sort0: number;
  onSave: (n: { question: string; answer: string; sortOrder: number }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [question, setQuestion] = useState(q0);
  const [answer, setAnswer] = useState(a0);
  const [sortOrder, setSortOrder] = useState(sort0);
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-2 md:grid-cols-6">
      <div className="md:col-span-2">
        <div className="text-xs font-medium mb-1">Frage</div>
        <TextInput value={question} onChange={(e) => setQuestion(e.target.value)} />
      </div>
      <div className="md:col-span-3">
        <div className="text-xs font-medium mb-1">Antwort</div>
        <TextInput value={answer} onChange={(e) => setAnswer(e.target.value)} />
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
              await onSave({ question, answer, sortOrder });
            } finally {
              setBusy(false);
            }
          }}
        >
          Speichern
        </Button>
        <DeleteButton
          confirmText="FAQ wirklich löschen?"
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
