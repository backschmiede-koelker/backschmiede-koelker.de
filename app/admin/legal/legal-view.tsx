// app/admin/legal/legal-view.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "../components/admin-page-header";
import SectionCard from "@/app/components/ui/section-card";
import FieldLabel from "@/app/components/ui/field-label";
import ReorderHeader from "@/app/admin/about/components/dnd/reorder-header";
import { useSortableList } from "@/app/admin/about/components/dnd/use-sortable-list";
import { LEGAL_CONTACT_TOKENS } from "@/app/lib/legal-defaults";
import type {
  LegalBlockDTO,
  LegalDocumentDTO,
  LegalSettingsDTO,
  LegalSectionDTO,
} from "@/app/types/legal";
import {
  addBlock,
  addSection,
  persistBlocksOrder,
  persistSectionsOrder,
  removeBlock,
  removeSection,
  saveBlock,
  saveLegalSettings,
  saveLegalTitle,
  saveSection,
} from "./actions";

type LegalDocType = "IMPRINT" | "PRIVACY";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unbekannter Fehler.";
}

function sortSections(sections: LegalSectionDTO[]) {
  return sections
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id));
}

function sortBlocks(blocks: LegalBlockDTO[]) {
  return blocks
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id));
}

export default function AdminLegalView({
  initialSettings,
  initialImprint,
  initialPrivacy,
}: {
  initialSettings: LegalSettingsDTO;
  initialImprint: LegalDocumentDTO;
  initialPrivacy: LegalDocumentDTO;
}) {
  const [settings, setSettings] = useState<LegalSettingsDTO>(initialSettings);
  const [imprint, setImprint] = useState<LegalDocumentDTO>(initialImprint);
  const [privacy, setPrivacy] = useState<LegalDocumentDTO>(initialPrivacy);
  const [activeTab, setActiveTab] = useState<LegalDocType>("IMPRINT");
  const [error, setError] = useState<string | null>(null);

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  function updateDoc(type: LegalDocType, next: LegalDocumentDTO) {
    if (type === "IMPRINT") setImprint(next);
    else setPrivacy(next);
  }

  const activeDoc = activeTab === "IMPRINT" ? imprint : privacy;

  async function saveContacts() {
    setError(null);
    setSettingsSuccess(null);
    setSavingSettings(true);
    try {
      await saveLegalSettings({
        contactEmail: settings.contactEmail,
        phoneRecke: settings.phoneRecke,
        phoneMettingen: settings.phoneMettingen,
      });
      setSettingsSuccess("Kontaktfelder gespeichert.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-3.5 sm:px-6 md:px-8 py-6 md:py-10 min-w-0">
      <AdminPageHeader
        title="Rechtliches"
        subtitle="Impressum und Datenschutzerklärung als Bausteine pflegen."
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {settingsSuccess ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {settingsSuccess}
        </div>
      ) : null}

      <SectionCard className="mb-6">
        <h2 className="text-lg font-semibold">Kontaktfelder</h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
          Platzhalter im Text: {LEGAL_CONTACT_TOKENS.email},{" "}
          {LEGAL_CONTACT_TOKENS.phoneRecke},{" "}
          {LEGAL_CONTACT_TOKENS.phoneMettingen}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <FieldLabel>E-Mail</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  contactEmail: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FieldLabel>Telefon Recke</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.phoneRecke}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  phoneRecke: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <FieldLabel>Telefon Mettingen</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.phoneMettingen}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  phoneMettingen: e.target.value,
                }))
              }
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={saveContacts}
              disabled={savingSettings}
              className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {savingSettings ? "Speichere…" : "Kontaktfelder speichern"}
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="mb-4 inline-flex rounded-xl border border-zinc-200/70 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/60 p-1">
        {(["IMPRINT", "PRIVACY"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              "px-4 py-2 text-sm rounded-lg transition",
              activeTab === tab
                ? "bg-emerald-600 text-white"
                : "text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
            ].join(" ")}
          >
            {tab === "IMPRINT" ? "Impressum" : "Datenschutz"}
          </button>
        ))}
      </div>

      <LegalDocumentEditor
        document={activeDoc}
        onChange={(next) => updateDoc(activeDoc.type, next)}
        onError={(msg) => setError(msg)}
      />
    </main>
  );
}

function LegalDocumentEditor({
  document,
  onChange,
  onError,
}: {
  document: LegalDocumentDTO;
  onChange: (next: LegalDocumentDTO) => void;
  onError: (message: string) => void;
}) {
  const [reorderSaving, setReorderSaving] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [addingSection, setAddingSection] = useState(false);

  const sectionsSorted = useMemo(() => sortSections(document.sections), [document.sections]);

  const sortable = useSortableList<LegalSectionDTO>({
    items: sectionsSorted,
    onReorderPersist: async (next) => {
      const idToIndex = new Map(next.map((item) => [item.id, item.sortOrder]));
      const ordered = sectionsSorted
        .slice()
        .sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0));

      const updatedSections = ordered.map((section, idx) => ({
        ...section,
        sortOrder: idx,
      }));

      onChange({ ...document, sections: updatedSections });

      setReorderSaving(true);
      try {
        await persistSectionsOrder({
          documentId: document.id,
          order: updatedSections.map((section, idx) => ({
            id: section.id,
            sortOrder: idx,
          })),
        });
      } catch (err: unknown) {
        onError(getErrorMessage(err));
      } finally {
        setReorderSaving(false);
      }
    },
  });

  useEffect(() => {
    sortable.setLocalOrder(sectionsSorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsSorted.map((s) => `${s.id}:${s.sortOrder}`).join("|")]);

  async function moveSection(id: string, dir: -1 | 1) {
    if (reorderSaving) return;
    const items = sortable.items;
    const idx = items.findIndex((item) => item.id === id);
    if (idx < 0) return;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= items.length) return;

    const next = items.slice();
    const [moved] = next.splice(idx, 1);
    next.splice(nextIdx, 0, moved);

    sortable.setLocalOrder(next);
    const updated = next.map((section, i) => ({ ...section, sortOrder: i }));
    onChange({ ...document, sections: updated });

    setReorderSaving(true);
    try {
      await persistSectionsOrder({
        documentId: document.id,
        order: updated.map((section, i) => ({ id: section.id, sortOrder: i })),
      });
    } catch (err: unknown) {
      onError(getErrorMessage(err));
    } finally {
      setReorderSaving(false);
    }
  }

  async function handleSaveTitle() {
    setSavingTitle(true);
    try {
      await saveLegalTitle({ type: document.type, title: document.title });
      onChange({ ...document, title: document.title.trim() });
    } catch (err: unknown) {
      onError(getErrorMessage(err));
    } finally {
      setSavingTitle(false);
    }
  }

  async function handleAddSection() {
    setAddingSection(true);
    try {
      const nextSort =
        document.sections.length > 0
          ? Math.max(...document.sections.map((s) => s.sortOrder)) + 1
          : 0;
      const created = await addSection({
        documentId: document.id,
        heading: "Neue Sektion",
        sortOrder: nextSort,
      });
      onChange({ ...document, sections: [...document.sections, created] });
    } catch (err: unknown) {
      onError(getErrorMessage(err));
    } finally {
      setAddingSection(false);
    }
  }

  function updateSection(id: string, patch: Partial<LegalSectionDTO>) {
    onChange({
      ...document,
      sections: document.sections.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    });
  }

  function updateBlock(sectionId: string, blockId: string, patch: Partial<LegalBlockDTO>) {
    onChange({
      ...document,
      sections: document.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          blocks: section.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
        };
      }),
    });
  }

  function replaceBlocks(sectionId: string, blocks: LegalBlockDTO[]) {
    onChange({
      ...document,
      sections: document.sections.map((section) => (section.id === sectionId ? { ...section, blocks } : section)),
    });
  }

  return (
    <SectionCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{document.type === "IMPRINT" ? "Impressum" : "Datenschutz"}</h2>
        <button
          type="button"
          onClick={handleAddSection}
          disabled={addingSection}
          className="w-full sm:w-auto rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {addingSection ? "Füge hinzu…" : "Sektion hinzufügen"}
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <FieldLabel>Dokument-Titel</FieldLabel>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={document.title}
            onChange={(e) => onChange({ ...document, title: e.target.value })}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleSaveTitle}
            disabled={savingTitle}
            className="w-full sm:w-auto rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingTitle ? "Speichere…" : "Titel speichern"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {sortable.items.map((sectionMeta, idx) => {
          const section = document.sections.find((s) => s.id === sectionMeta.id) ?? sectionMeta;

          return (
            <div
              key={section.id}
              {...sortable.bindDropTarget(section.id)}
              className="admin-surface admin-pad"
            >
              <ReorderHeader
                disabled={reorderSaving}
                isFirst={idx === 0}
                isLast={idx === sortable.items.length - 1}
                bindDragHandle={sortable.bindDragHandle(section.id)}
                onUp={() => moveSection(section.id, -1)}
                onDown={() => moveSection(section.id, 1)}
                leftMeta={<div className="text-xs text-zinc-600 dark:text-zinc-300">Position: {idx + 1}</div>}
              />

              <SectionEditor
                section={section}
                onChange={(patch) => updateSection(section.id, patch)}
                onBlocksChange={(blocks) => replaceBlocks(section.id, blocks)}
                onBlockChange={(blockId, patch) => updateBlock(section.id, blockId, patch)}
                onDelete={async () => {
                  try {
                    await removeSection(section.id);
                    onChange({
                      ...document,
                      sections: document.sections.filter((s) => s.id !== section.id),
                    });
                  } catch (err: unknown) {
                    onError(getErrorMessage(err));
                  }
                }}
                onError={onError}
              />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function SectionEditor({
  section,
  onChange,
  onBlocksChange,
  onBlockChange,
  onDelete,
  onError,
}: {
  section: LegalSectionDTO;
  onChange: (patch: Partial<LegalSectionDTO>) => void;
  onBlocksChange: (blocks: LegalBlockDTO[]) => void;
  onBlockChange: (blockId: string, patch: Partial<LegalBlockDTO>) => void;
  onDelete: () => void;
  onError: (message: string) => void;
}) {
  const [savingHeading, setSavingHeading] = useState(false);
  const [addingBlock, setAddingBlock] = useState<"idle" | "paragraph" | "list">("idle");
  const [reorderSaving, setReorderSaving] = useState(false);

  const blocksSorted = useMemo(() => sortBlocks(section.blocks), [section.blocks]);

  const sortable = useSortableList<LegalBlockDTO>({
    items: blocksSorted,
    onReorderPersist: async (next) => {
      const idToIndex = new Map(next.map((item) => [item.id, item.sortOrder]));
      const ordered = blocksSorted
        .slice()
        .sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0));

      const updatedBlocks = ordered.map((block, idx) => ({ ...block, sortOrder: idx }));
      onBlocksChange(updatedBlocks);

      setReorderSaving(true);
      try {
        await persistBlocksOrder({
          sectionId: section.id,
          order: updatedBlocks.map((block, idx) => ({ id: block.id, sortOrder: idx })),
        });
      } catch (err: unknown) {
        onError(getErrorMessage(err));
      } finally {
        setReorderSaving(false);
      }
    },
  });

  useEffect(() => {
    sortable.setLocalOrder(blocksSorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksSorted.map((b) => `${b.id}:${b.sortOrder}`).join("|")]);

  async function moveBlock(id: string, dir: -1 | 1) {
    if (reorderSaving) return;
    const items = sortable.items;
    const idx = items.findIndex((item) => item.id === id);
    if (idx < 0) return;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= items.length) return;

    const next = items.slice();
    const [moved] = next.splice(idx, 1);
    next.splice(nextIdx, 0, moved);

    sortable.setLocalOrder(next);
    const updated = next.map((block, i) => ({ ...block, sortOrder: i }));
    onBlocksChange(updated);

    setReorderSaving(true);
    try {
      await persistBlocksOrder({
        sectionId: section.id,
        order: updated.map((block, i) => ({ id: block.id, sortOrder: i })),
      });
    } catch (err: unknown) {
      onError(getErrorMessage(err));
    } finally {
      setReorderSaving(false);
    }
  }

  async function handleSaveHeading() {
    setSavingHeading(true);
    try {
      await saveSection({ id: section.id, heading: section.heading });
      onChange({ heading: section.heading.trim() });
    } catch (err: unknown) {
      onError(getErrorMessage(err));
    } finally {
      setSavingHeading(false);
    }
  }

  async function handleAddBlock(type: "PARAGRAPH" | "LIST") {
    setAddingBlock(type === "PARAGRAPH" ? "paragraph" : "list");
    try {
      const nextSort =
        section.blocks.length > 0 ? Math.max(...section.blocks.map((b) => b.sortOrder)) + 1 : 0;
      const created = await addBlock({
        sectionId: section.id,
        type,
        sortOrder: nextSort,
        text: type === "PARAGRAPH" ? "Neuer Absatz" : null,
        items: type === "LIST" ? [""] : undefined,
      });
      onBlocksChange([...section.blocks, created]);
    } catch (err: unknown) {
      onError(getErrorMessage(err));
    } finally {
      setAddingBlock("idle");
    }
  }

  return (
    <div className="space-y-4 min-w-0">
      {/* ✅ Button auf Höhe des Eingabefelds (nicht Label) */}
      <div className="grid gap-3 sm:grid-cols-[1fr,auto] sm:items-end">
        <div>
          <FieldLabel>Überschrift</FieldLabel>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={section.heading}
            onChange={(e) => onChange({ heading: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleSaveHeading}
            disabled={savingHeading}
            className="w-full sm:w-auto rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingHeading ? "Speichere…" : "Überschrift speichern"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-full sm:w-auto rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800/60 dark:text-red-200 dark:hover:bg-red-900/30"
          >
            Sektion löschen
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleAddBlock("PARAGRAPH")}
          disabled={addingBlock !== "idle"}
          className="w-full sm:w-auto rounded-md border border-emerald-200 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
        >
          {addingBlock === "paragraph" ? "Füge hinzu…" : "Absatz hinzufügen"}
        </button>
        <button
          type="button"
          onClick={() => handleAddBlock("LIST")}
          disabled={addingBlock !== "idle"}
          className="w-full sm:w-auto rounded-md border border-emerald-200 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
        >
          {addingBlock === "list" ? "Füge hinzu…" : "Liste hinzufügen"}
        </button>
      </div>

      <div className="space-y-4">
        {sortable.items.map((meta, idx) => {
          // ✅ Cursor-Fix: immer Block aus section.blocks holen (source of truth)
          const block = section.blocks.find((b) => b.id === meta.id) ?? meta;

          return (
            <div
              key={block.id}
              {...sortable.bindDropTarget(block.id)}
              className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/30 p-3"
            >
              <ReorderHeader
                disabled={reorderSaving}
                isFirst={idx === 0}
                isLast={idx === sortable.items.length - 1}
                bindDragHandle={sortable.bindDragHandle(block.id)}
                onUp={() => moveBlock(block.id, -1)}
                onDown={() => moveBlock(block.id, 1)}
                leftMeta={
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    {block.type === "LIST" ? "Liste" : "Absatz"}
                  </div>
                }
              />

              <BlockEditor
                block={block}
                onChange={(patch) => onBlockChange(block.id, patch)}
                onDelete={async () => {
                  try {
                    await removeBlock(block.id);
                    onBlocksChange(section.blocks.filter((b) => b.id !== block.id));
                  } catch (err: unknown) {
                    onError(getErrorMessage(err));
                  }
                }}
                onSave={async () => {
                  try {
                    await saveBlock({
                      id: block.id,
                      type: block.type,
                      text: block.text,
                      items: block.items,
                    });
                  } catch (err: unknown) {
                    onError(getErrorMessage(err));
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onDelete,
  onSave,
}: {
  block: LegalBlockDTO;
  onChange: (patch: Partial<LegalBlockDTO>) => void;
  onDelete: () => void;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {block.type === "PARAGRAPH" ? (
        <div>
          <FieldLabel>Text</FieldLabel>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={block.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
          />
        </div>
      ) : (
        <div>
          <FieldLabel>Listenpunkte</FieldLabel>
          <div className="mt-2 space-y-2">
            {block.items.map((item, idx) => (
              <div key={`${block.id}-item-${idx}`} className="flex flex-wrap gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                  value={item}
                  onChange={(e) => {
                    const items = block.items.map((val, i) => (i === idx ? e.target.value : val));
                    onChange({ items });
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const items = block.items.filter((_, i) => i !== idx);
                    onChange({ items });
                  }}
                  className="w-full sm:w-auto rounded-md border border-red-200 px-2 py-2 sm:py-0 text-xs text-red-700 hover:bg-red-50 dark:border-red-800/60 dark:text-red-200 dark:hover:bg-red-900/30"
                >
                  Entfernen
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange({ items: [...block.items, ""] })}
              className="w-full sm:w-auto rounded-md border border-emerald-200 px-3 py-2 sm:py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
            >
              + Punkt hinzufügen
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Speichere…" : "Block speichern"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-full sm:w-auto rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800/60 dark:text-red-200 dark:hover:bg-red-900/30"
        >
          Block löschen
        </button>
      </div>
    </div>
  );
}
