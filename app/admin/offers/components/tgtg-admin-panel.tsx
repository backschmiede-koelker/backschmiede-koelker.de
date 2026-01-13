// app/admin/offers/components/tgtg-admin-panel.tsx
"use client";

import * as React from "react";

import SectionCard from "@/app/components/ui/section-card";
import FieldLabel from "@/app/components/ui/field-label";
import ReorderHeader from "@/app/admin/about/components/dnd/reorder-header";
import { useSortableList } from "@/app/admin/about/components/dnd/use-sortable-list";

type Step = {
  id: string;
  sortOrder: number;
  title: string;
  description: string;
};

type Faq = {
  id: string;
  sortOrder: number;
  question: string;
  answer: string;
};

type Dto = {
  title: string;
  subtitle: string | null; // Chip/Badge Text
  description: string | null;

  reckeSubtitle: string | null;
  mettingenSubtitle: string | null;

  tgtgAppLinkRecke: string;
  tgtgAppLinkMettingen: string;

  reckeHinweis: string | null;
  mettingenHinweis: string | null;
  allgemeinerHinweis: string | null;

  steps: { id: string; sortOrder: number; title: string; description: string }[];
  faqItems: { id: string; sortOrder: number; question: string; answer: string }[];
};

function cleanOpt(v: string | null): string | null {
  const s = (v ?? "").trim();
  return s ? s : null;
}

// kleine Hilfe: defensive key, falls id mal leer ist
function safeKey(prefix: string, id: string, idx: number) {
  const v = String(id || "").trim();
  return v ? v : `${prefix}-${idx}`;
}

export default function TgtgAdminPanel() {
  const [open, setOpen] = React.useState(false);
  const loadedOnceRef = React.useRef(false);

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Basisfelder
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState<string | null>(null);

  const [reckeSubtitle, setReckeSubtitle] = React.useState<string | null>(null);
  const [mettingenSubtitle, setMettingenSubtitle] = React.useState<string | null>(null);

  const [tgtgAppLinkRecke, setTgtgAppLinkRecke] = React.useState("");
  const [tgtgAppLinkMettingen, setTgtgAppLinkMettingen] = React.useState("");

  const [reckeHinweis, setReckeHinweis] = React.useState<string | null>(null);
  const [mettingenHinweis, setMettingenHinweis] = React.useState<string | null>(null);
  const [allgemeinerHinweis, setAllgemeinerHinweis] = React.useState<string | null>(null);

  // UX state
  const [savingBase, setSavingBase] = React.useState(false);
  const [addingStep, setAddingStep] = React.useState<"idle" | "adding" | "added">("idle");
  const [addingFaq, setAddingFaq] = React.useState<"idle" | "adding" | "added">("idle");

  const [stepSaving, setStepSaving] = React.useState<Record<string, boolean>>({});
  const [stepDeleting, setStepDeleting] = React.useState<Record<string, boolean>>({});
  const [faqSaving, setFaqSaving] = React.useState<Record<string, boolean>>({});
  const [faqDeleting, setFaqDeleting] = React.useState<Record<string, boolean>>({});

  const [reorderBusySteps, setReorderBusySteps] = React.useState(false);
  const [reorderBusyFaqs, setReorderBusyFaqs] = React.useState(false);

  // Stabiler „Source“-State für useSortableList
  const [loadedSteps, setLoadedSteps] = React.useState<Step[]>([]);
  const [loadedFaqs, setLoadedFaqs] = React.useState<Faq[]>([]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/admin/tgtg-cta", { cache: "no-store" });
      if (!res.ok) throw new Error("Konnte TGTG-Daten nicht laden.");

      const dto = (await res.json()) as Dto;

      setTitle(dto.title || "");
      setSubtitle(dto.subtitle ?? null);
      setDescription(dto.description ?? null);

      setReckeSubtitle(dto.reckeSubtitle ?? null);
      setMettingenSubtitle(dto.mettingenSubtitle ?? null);

      setTgtgAppLinkRecke(dto.tgtgAppLinkRecke || "");
      setTgtgAppLinkMettingen(dto.tgtgAppLinkMettingen || "");

      setReckeHinweis(dto.reckeHinweis ?? null);
      setMettingenHinweis(dto.mettingenHinweis ?? null);
      setAllgemeinerHinweis(dto.allgemeinerHinweis ?? null);

      const nextSteps: Step[] = (dto.steps || [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((s, idx) => ({
          id: String(s.id || "").trim(),
          sortOrder: Number(s.sortOrder ?? idx),
          title: s.title ?? "",
          description: s.description ?? "",
        }));

      const nextFaqs: Faq[] = (dto.faqItems || [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((f, idx) => ({
          id: String(f.id || "").trim(),
          sortOrder: Number(f.sortOrder ?? idx),
          question: f.question ?? "",
          answer: f.answer ?? "",
        }));

      setLoadedSteps(nextSteps);
      setLoadedFaqs(nextFaqs);

      loadedOnceRef.current = true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (open && !loadedOnceRef.current && !loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Persist: Reihenfolge sofort speichern (wird von useSortableList bei Drop getriggert)
  async function persistStepsOrder(next: { id: string; sortOrder: number }[]) {
    // wenn ids fehlen, nicht persistieren
    const clean = (next || []).filter((x) => String(x.id || "").trim().length > 0);
    if (!clean.length) return;

    setReorderBusySteps(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/tgtg-cta/steps/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: clean }),
      });
      if (!res.ok) throw new Error("Reihenfolge (Steps) konnte nicht gespeichert werden.");

      // source aktualisieren
      setLoadedSteps((prev) => {
        const map = new Map(prev.map((p) => [p.id, p] as const));
        const nextList = clean
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((o) => {
            const it = map.get(o.id);
            return it ? { ...it, sortOrder: o.sortOrder } : null;
          })
          .filter(Boolean) as Step[];
        return nextList;
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setReorderBusySteps(false);
    }
  }

  async function persistFaqsOrder(next: { id: string; sortOrder: number }[]) {
    const clean = (next || []).filter((x) => String(x.id || "").trim().length > 0);
    if (!clean.length) return;

    setReorderBusyFaqs(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/tgtg-cta/faqs/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: clean }),
      });
      if (!res.ok) throw new Error("Reihenfolge (FAQ) konnte nicht gespeichert werden.");

      setLoadedFaqs((prev) => {
        const map = new Map(prev.map((p) => [p.id, p] as const));
        const nextList = clean
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((o) => {
            const it = map.get(o.id);
            return it ? { ...it, sortOrder: o.sortOrder } : null;
          })
          .filter(Boolean) as Faq[];
        return nextList;
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setReorderBusyFaqs(false);
    }
  }

  const stepsSortable = useSortableList<Step>({
    items: loadedSteps,
    onReorderPersist: persistStepsOrder,
  });

  const faqsSortable = useSortableList<Faq>({
    items: loadedFaqs,
    onReorderPersist: persistFaqsOrder,
  });

  // Edit helpers (nur lokal)
  function updateStepLocal(id: string, patch: Partial<Pick<Step, "title" | "description">>) {
    stepsSortable.setLocalOrder((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function updateFaqLocal(id: string, patch: Partial<Pick<Faq, "question" | "answer">>) {
    faqsSortable.setLocalOrder((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  }

  // Basis speichern (Button direkt unter "Allgemeiner Hinweis")
  async function saveBase() {
    setSavingBase(true);
    setErr(null);
    try {
      const payload = {
        title: title.trim(),
        subtitle: cleanOpt(subtitle), // ✅ Chip/Badge Text
        description: cleanOpt(description),

        reckeSubtitle: cleanOpt(reckeSubtitle),
        mettingenSubtitle: cleanOpt(mettingenSubtitle),

        tgtgAppLinkRecke: (tgtgAppLinkRecke || "").trim(),
        tgtgAppLinkMettingen: (tgtgAppLinkMettingen || "").trim(),

        reckeHinweis: cleanOpt(reckeHinweis),
        mettingenHinweis: cleanOpt(mettingenHinweis),
        allgemeinerHinweis: cleanOpt(allgemeinerHinweis),
      };

      const res = await fetch("/api/admin/tgtg-cta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Speichern fehlgeschlagen.");
      await res.json();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSavingBase(false);
    }
  }

  // Step speichern/löschen (direkt DB)
  async function saveStep(id: string) {
    setStepSaving((m) => ({ ...m, [id]: true }));
    setErr(null);
    try {
      const item = stepsSortable.items.find((x) => x.id === id);
      if (!item) return;

      const res = await fetch(`/api/admin/tgtg-cta/steps/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: (item.title || "").trim(),
          description: (item.description || "").trim(),
        }),
      });
      if (!res.ok) throw new Error("Step konnte nicht gespeichert werden.");

      setLoadedSteps((prev) =>
        prev.map((p) => (p.id === id ? { ...p, title: item.title, description: item.description } : p)),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setStepSaving((m) => ({ ...m, [id]: false }));
    }
  }

  async function deleteStep(id: string) {
    setStepDeleting((m) => ({ ...m, [id]: true }));
    setErr(null);
    try {
      const res = await fetch(`/api/admin/tgtg-cta/steps/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Step konnte nicht gelöscht werden.");

      const nextLocal = stepsSortable.items
        .filter((x) => x.id !== id)
        .map((x, idx) => ({ ...x, sortOrder: idx }));

      stepsSortable.setLocalOrder(nextLocal);
      setLoadedSteps(nextLocal);

      await persistStepsOrder(nextLocal.map((x) => ({ id: x.id, sortOrder: x.sortOrder })));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setStepDeleting((m) => ({ ...m, [id]: false }));
    }
  }

  // FAQ speichern/löschen
  async function saveFaq(id: string) {
    setFaqSaving((m) => ({ ...m, [id]: true }));
    setErr(null);
    try {
      const item = faqsSortable.items.find((x) => x.id === id);
      if (!item) return;

      const res = await fetch(`/api/admin/tgtg-cta/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: (item.question || "").trim(),
          answer: (item.answer || "").trim(),
        }),
      });
      if (!res.ok) throw new Error("FAQ konnte nicht gespeichert werden.");

      setLoadedFaqs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, question: item.question, answer: item.answer } : p)),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setFaqSaving((m) => ({ ...m, [id]: false }));
    }
  }

  async function deleteFaq(id: string) {
    setFaqDeleting((m) => ({ ...m, [id]: true }));
    setErr(null);
    try {
      const res = await fetch(`/api/admin/tgtg-cta/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("FAQ konnte nicht gelöscht werden.");

      const nextLocal = faqsSortable.items
        .filter((x) => x.id !== id)
        .map((x, idx) => ({ ...x, sortOrder: idx }));

      faqsSortable.setLocalOrder(nextLocal);
      setLoadedFaqs(nextLocal);

      await persistFaqsOrder(nextLocal.map((x) => ({ id: x.id, sortOrder: x.sortOrder })));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
    } finally {
      setFaqDeleting((m) => ({ ...m, [id]: false }));
    }
  }

  // Add Step/FAQ (deaktiviert kurz + "Hinzugefügt")
  async function addStep() {
    if (addingStep !== "idle") return;
    setAddingStep("adding");
    setErr(null);

    try {
      const res = await fetch("/api/admin/tgtg-cta/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Neuer Schritt", description: "" }),
      });
      if (!res.ok) throw new Error("Step konnte nicht hinzugefügt werden.");
      const created = (await res.json()) as Step;

      const next = [...stepsSortable.items, created].map((x, idx) => ({ ...x, sortOrder: idx }));
      stepsSortable.setLocalOrder(next);
      setLoadedSteps(next);

      await persistStepsOrder(next.map((x) => ({ id: x.id, sortOrder: x.sortOrder })));

      setAddingStep("added");
      window.setTimeout(() => setAddingStep("idle"), 900);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
      setAddingStep("idle");
    }
  }

  async function addFaq() {
    if (addingFaq !== "idle") return;
    setAddingFaq("adding");
    setErr(null);

    try {
      const res = await fetch("/api/admin/tgtg-cta/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Neue Frage", answer: "" }),
      });
      if (!res.ok) throw new Error("FAQ konnte nicht hinzugefügt werden.");
      const created = (await res.json()) as Faq;

      const next = [...faqsSortable.items, created].map((x, idx) => ({ ...x, sortOrder: idx }));
      faqsSortable.setLocalOrder(next);
      setLoadedFaqs(next);

      await persistFaqsOrder(next.map((x) => ({ id: x.id, sortOrder: x.sortOrder })));

      setAddingFaq("added");
      window.setTimeout(() => setAddingFaq("idle"), 900);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler");
      setAddingFaq("idle");
    }
  }

  return (
    <div className="mb-4 md:mb-6 min-w-0">
      <div className="admin-surface admin-pad min-w-0 overflow-x-hidden">
        <div className="grid grid-cols-1 gap-3 min-w-0">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <div className="text-sm font-semibold break-words">Too Good To Go Bereich</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-300 break-words">
                Texte, Schritte und FAQ für die Website bearbeiten.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen((v) => {
                  const next = !v;
                  if (!next) {
                    requestAnimationFrame(() => {
                      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    });
                  }
                  return next;
                });
              }}
              className="h-10 shrink-0 rounded-xl border border-zinc-200/70 bg-white/70 px-3 text-sm shadow-sm hover:bg-zinc-50 transition
                         dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {open ? "Schließen" : "Öffnen"}
            </button>
          </div>

          {open && (
            <div className="min-w-0">
              <SectionCard className="admin-nested-flat-lg min-w-0 overflow-x-hidden">
                {loading ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">Lädt…</div>
                ) : (
                  <div className="grid gap-4 min-w-0">
                    {err ? (
                      <div className="rounded-xl border border-rose-300/40 bg-rose-50/60 p-3 text-sm text-rose-900 dark:border-rose-400/20 dark:bg-rose-900/20 dark:text-rose-100 break-words">
                        {err}
                      </div>
                    ) : null}

                    {/* Basis */}
                    <div className="grid gap-3 min-w-0">
                      <div className="min-w-0">
                        <FieldLabel>Titel</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="min-w-0">
                        <FieldLabel>Chip/Badge Text (optional)</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={subtitle ?? ""}
                          onChange={(e) => setSubtitle(e.target.value || null)}
                          placeholder='z.B. "Lebensmittel retten"'
                        />
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 break-words">
                          Dieser Text wird im Chip oben angezeigt.
                        </p>
                      </div>

                      <div className="min-w-0">
                        <FieldLabel>Beschreibung</FieldLabel>
                        <textarea
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 min-h-[88px]"
                          value={description ?? ""}
                          onChange={(e) => setDescription(e.target.value || null)}
                        />
                      </div>
                    </div>

                    {/* Filial-spezifisch */}
                    <div className="grid gap-3 sm:grid-cols-2 min-w-0">
                      <div className="min-w-0">
                        <FieldLabel>Recke – Untertitel</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={reckeSubtitle ?? ""}
                          onChange={(e) => setReckeSubtitle(e.target.value || null)}
                        />
                      </div>

                      <div className="min-w-0">
                        <FieldLabel>Mettingen – Untertitel</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={mettingenSubtitle ?? ""}
                          onChange={(e) => setMettingenSubtitle(e.target.value || null)}
                        />
                      </div>

                      <div className="min-w-0">
                        <FieldLabel>Recke – App/Share Link</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={tgtgAppLinkRecke}
                          onChange={(e) => setTgtgAppLinkRecke(e.target.value)}
                        />
                      </div>

                      <div className="min-w-0">
                        <FieldLabel>Mettingen – App/Share Link</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={tgtgAppLinkMettingen}
                          onChange={(e) => setTgtgAppLinkMettingen(e.target.value)}
                        />
                      </div>

                      <div className="min-w-0">
                        <FieldLabel>Recke – Hinweis (klein)</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={reckeHinweis ?? ""}
                          onChange={(e) => setReckeHinweis(e.target.value || null)}
                        />
                      </div>

                      <div className="min-w-0">
                        <FieldLabel>Mettingen – Hinweis (klein)</FieldLabel>
                        <input
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                          value={mettingenHinweis ?? ""}
                          onChange={(e) => setMettingenHinweis(e.target.value || null)}
                        />
                      </div>

                      <div className="sm:col-span-2 min-w-0">
                        <FieldLabel>Allgemeiner Hinweis (unter den Buttons)</FieldLabel>
                        <textarea
                          className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 min-h-[72px]"
                          value={allgemeinerHinweis ?? ""}
                          onChange={(e) => setAllgemeinerHinweis(e.target.value || null)}
                        />

                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={saveBase}
                            disabled={savingBase}
                            className="w-full sm:w-auto rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {savingBase ? "Speichert…" : "Speichern"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="admin-surface admin-pad-tight min-w-0 overflow-x-hidden">
                      <div className="grid gap-2 min-w-0">
                        <div className="grid gap-2 sm:flex sm:items-center sm:justify-between min-w-0">
                          <div className="text-sm font-semibold break-words">Anleitungssteps</div>
                          <button
                            type="button"
                            disabled={addingStep !== "idle"}
                            onClick={addStep}
                            className="h-10 w-full sm:w-auto rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {addingStep === "adding"
                              ? "Fügt hinzu…"
                              : addingStep === "added"
                                ? "Hinzugefügt"
                                : "Schritt hinzufügen"}
                          </button>
                        </div>

                        {reorderBusySteps ? (
                          <div className="text-xs text-zinc-600 dark:text-zinc-300">
                            Speichere Reihenfolge…
                          </div>
                        ) : null}

                        <div className="grid gap-3 min-w-0">
                          {stepsSortable.items.map((s, idx) => (
                            <div
                              key={safeKey("step", s.id, idx)}
                              {...stepsSortable.bindDropTarget(s.id)}
                              className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/30 min-w-0 overflow-x-hidden"
                            >
                              <ReorderHeader
                                disabled={reorderBusySteps}
                                isFirst={idx === 0}
                                isLast={idx === stepsSortable.items.length - 1}
                                bindDragHandle={stepsSortable.bindDragHandle(s.id)}
                                onUp={() => {}}
                                onDown={() => {}}
                                leftMeta={
                                  <div className="text-xs text-zinc-600 dark:text-zinc-300 break-words min-w-0">
                                    Nummer: <b>{idx + 1}</b>
                                  </div>
                                }
                              />

                              <div className="grid gap-2 min-w-0">
                                <div className="min-w-0">
                                  <FieldLabel>Titel</FieldLabel>
                                  <input
                                    className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                                    value={s.title}
                                    onChange={(e) => updateStepLocal(s.id, { title: e.target.value })}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <FieldLabel>Beschreibung</FieldLabel>
                                  <textarea
                                    className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 min-h-[70px]"
                                    value={s.description}
                                    onChange={(e) => updateStepLocal(s.id, { description: e.target.value })}
                                  />
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  <button
                                    type="button"
                                    onClick={() => saveStep(s.id)}
                                    disabled={!!stepSaving[s.id] || !!stepDeleting[s.id] || reorderBusySteps}
                                    className="h-10 w-full rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                  >
                                    {stepSaving[s.id] ? "Speichert…" : "Speichern"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteStep(s.id)}
                                    disabled={!!stepDeleting[s.id] || !!stepSaving[s.id] || reorderBusySteps}
                                    className="h-10 w-full rounded-xl border border-rose-200/70 bg-white/70 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50
                                               dark:border-rose-400/25 dark:bg-white/5 dark:text-rose-200 dark:hover:bg-rose-900/20 disabled:opacity-60"
                                  >
                                    {stepDeleting[s.id] ? "Löscht…" : "Löschen"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* FAQ */}
                    <div className="admin-surface admin-pad-tight min-w-0 overflow-x-hidden">
                      <div className="grid gap-2 min-w-0">
                        <div className="grid gap-2 sm:flex sm:items-center sm:justify-between min-w-0">
                          <div className="text-sm font-semibold break-words">FAQ</div>
                          <button
                            type="button"
                            disabled={addingFaq !== "idle"}
                            onClick={addFaq}
                            className="h-10 w-full sm:w-auto rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {addingFaq === "adding"
                              ? "Fügt hinzu…"
                              : addingFaq === "added"
                                ? "Hinzugefügt"
                                : "FAQ hinzufügen"}
                          </button>
                        </div>

                        {reorderBusyFaqs ? (
                          <div className="text-xs text-zinc-600 dark:text-zinc-300">
                            Speichere Reihenfolge…
                          </div>
                        ) : null}

                        <div className="grid gap-3 min-w-0">
                          {faqsSortable.items.map((f, idx) => (
                            <div
                              key={safeKey("faq", f.id, idx)}
                              {...faqsSortable.bindDropTarget(f.id)}
                              className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/30 min-w-0 overflow-x-hidden"
                            >
                              <ReorderHeader
                                disabled={reorderBusyFaqs}
                                isFirst={idx === 0}
                                isLast={idx === faqsSortable.items.length - 1}
                                bindDragHandle={faqsSortable.bindDragHandle(f.id)}
                                onUp={() => {}}
                                onDown={() => {}}
                              />

                              <div className="grid gap-2 min-w-0">
                                <div className="min-w-0">
                                  <FieldLabel>Frage</FieldLabel>
                                  <input
                                    className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                                    value={f.question}
                                    onChange={(e) => updateFaqLocal(f.id, { question: e.target.value })}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <FieldLabel>Antwort</FieldLabel>
                                  <textarea
                                    className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800 min-h-[80px]"
                                    value={f.answer}
                                    onChange={(e) => updateFaqLocal(f.id, { answer: e.target.value })}
                                  />
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  <button
                                    type="button"
                                    onClick={() => saveFaq(f.id)}
                                    disabled={!!faqSaving[f.id] || !!faqDeleting[f.id] || reorderBusyFaqs}
                                    className="h-10 w-full rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                  >
                                    {faqSaving[f.id] ? "Speichert…" : "Speichern"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteFaq(f.id)}
                                    disabled={!!faqDeleting[f.id] || !!faqSaving[f.id] || reorderBusyFaqs}
                                    className="h-10 w-full rounded-xl border border-rose-200/70 bg-white/70 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50
                                               dark:border-rose-400/25 dark:bg-white/5 dark:text-rose-200 dark:hover:bg-rose-900/20 disabled:opacity-60"
                                  >
                                    {faqDeleting[f.id] ? "Löscht…" : "Löschen"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: nur Schließen */}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          requestAnimationFrame(() => {
                            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                          });
                        }}
                        className="w-full sm:w-auto rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm shadow-sm hover:bg-zinc-50 transition
                                   dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      >
                        Schließen
                      </button>
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
