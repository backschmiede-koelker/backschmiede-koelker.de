// app/admin/about/about-view.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { AboutPersonDTO, AboutSectionDTO } from "./types";
import SectionBox from "./components/section-box";
import HeroEditor from "./components/hero-editor";
import SectionEditor from "./components/section-editor";
import PeopleEditor from "./components/items/people-editor";
import SectionAddPicker from "./components/section-add-picker";
import { reorderMiddleSections } from "./actions";

import { useSortableList } from "./components/dnd/use-sortable-list";
import { AnimatePresence, motion } from "framer-motion";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import AdminPageHeader from "../components/admin-page-header";

function sectionAnchorId(id: string) {
  return `admin-about-section-${id}`;
}

export default function AboutView({
  initialSections,
  initialPeople,
}: {
  initialSections: AboutSectionDTO[];
  initialPeople: AboutPersonDTO[];
}) {
  const [sections, setSections] = useState<AboutSectionDTO[]>(initialSections);
  const [people, setPeople] = useState<AboutPersonDTO[]>(initialPeople);

  const hero = useMemo(() => sections.find((s) => s.type === "HERO"), [sections]);
  const teamSection = useMemo(() => sections.find((s) => s.type === "TEAM"), [sections]);

  const middleSectionsSorted = useMemo(() => {
    return sections
      .filter((s) => s.type !== "HERO" && s.type !== "TEAM")
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id));
  }, [sections]);

  function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionAnchorId(sectionId));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const [savingOrder, setSavingOrder] = useState(false);
  const [orderErr, setOrderErr] = useState<string | null>(null);

  async function persistMiddleOrder(idsInOrder: string[]) {
    setOrderErr(null);
    setSavingOrder(true);
    try {
      const res = await reorderMiddleSections({ idsInOrder });
      if (res?.sections) setSections(res.sections as any);
    } catch (e: any) {
      setOrderErr(e?.message || "Fehler beim Sortieren");
    } finally {
      setSavingOrder(false);
    }
  }

  async function persistOrderFromLocal(nextLocal: AboutSectionDTO[]) {
    const idsInOrder = nextLocal.map((s) => s.id);
    await persistMiddleOrder(idsInOrder);
  }

  const sortable = useSortableList({
    items: middleSectionsSorted,
    onReorderPersist: async (next) => {
      const idToIndex = new Map(next.map((n: any) => [n.id, n.sortOrder]));
      const nextLocal = middleSectionsSorted
        .slice()
        .sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0));

      setSections((prev) => {
        const keep = prev.filter((s) => s.type === "HERO" || s.type === "TEAM");
        const updatedMiddle = nextLocal.map((s, i) => ({ ...s, sortOrder: i }));
        return [...keep, ...updatedMiddle];
      });

      await persistOrderFromLocal(nextLocal);
    },
  });

  useEffect(() => {
    sortable.setLocalOrder(middleSectionsSorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [middleSectionsSorted.map((s) => `${s.id}:${s.sortOrder ?? 0}`).join("|"), sections.length]);

  async function moveByArrow(id: string, dir: -1 | 1) {
    if (savingOrder) return;

    const items = sortable.items as AboutSectionDTO[];
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const j = idx + dir;
    if (j < 0 || j >= items.length) return;

    const nextLocal = items.slice();
    const [moved] = nextLocal.splice(idx, 1);
    nextLocal.splice(j, 0, moved);

    sortable.setLocalOrder(nextLocal);
    setSections((prev) => {
      const keep = prev.filter((s) => s.type === "HERO" || s.type === "TEAM");
      const updatedMiddle = nextLocal.map((s, i) => ({ ...s, sortOrder: i }));
      return [...keep, ...updatedMiddle];
    });

    await persistOrderFromLocal(nextLocal);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 min-w-0 overflow-x-clip">
      <AdminPageHeader
        title="Über uns"
        subtitle="Verwalte Inhalte, Texte und Informationen der Über uns Seite."
      />

      <SectionBox
        title="Hero Bereich"
        collapsible
        defaultOpen={false}
        summary={
          hero ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400 min-w-0">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {hero.title || "—"}
              </div>
              <div className="truncate">{hero.subtitle || "—"}</div>
            </div>
          ) : null
        }
      >
        {hero ? (
          <HeroEditor
            section={hero}
            onUpdated={(next) => setSections((prev) => prev.map((s) => (s.id === next.id ? next : s)))}
          />
        ) : (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Hero wird beim Laden automatisch angelegt. Reload, falls er fehlt.
          </div>
        )}
      </SectionBox>

      <SectionBox title="Bereiche">
        <div className="space-y-5 min-w-0">
          <SectionAddPicker
            sections={sections as any}
            onCreated={(created) => setSections((prev) => [...prev, created])}
            onScrollToSection={scrollToSection}
          />

          {orderErr && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {orderErr}
            </div>
          )}

          <div className="admin-surface overflow-hidden min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-zinc-200/70 dark:border-zinc-800/80 min-w-0">
              <div className="text-sm font-semibold">Reihenfolge (Mitte)</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {savingOrder ? "Speichert Sortierung…" : "Drag & Drop oder Pfeile nutzen"}
              </div>
            </div>

            {(sortable.items as AboutSectionDTO[]).length === 0 ? (
              <div className="p-3 sm:p-4 text-sm text-zinc-600 dark:text-zinc-400">
                Noch keine Bereiche in der Mitte.
              </div>
            ) : (
              <motion.div layout transition={{ duration: 0.22 }} className="p-2 sm:p-3 space-y-3 min-w-0">
                <AnimatePresence initial={false}>
                  {(sortable.items as AboutSectionDTO[]).map((s, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === (sortable.items as AboutSectionDTO[]).length - 1;

                    return (
                      <motion.div
                        key={s.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        id={sectionAnchorId(s.id)}
                        className="admin-surface admin-pad min-w-0"
                        {...sortable.bindDropTarget(s.id)}
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 min-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              {...sortable.bindDragHandle(s.id)}
                              className="
                                cursor-grab active:cursor-grabbing select-none rounded-lg p-2
                                border border-zinc-300 bg-zinc-50 hover:bg-zinc-100
                                dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
                              "
                              title="Ziehen zum Sortieren"
                            >
                              <GripVertical size={18} />
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Position: {idx + 1}
                              </div>
                              <div className="font-semibold truncate">{s.title || "(ohne Titel)"}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isFirst || savingOrder}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                void moveByArrow(s.id, -1);
                              }}
                              className="
                                w-10 h-10 flex items-center justify-center rounded-lg
                                border border-zinc-300 bg-white hover:bg-zinc-100
                                dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
                                disabled:opacity-30 disabled:cursor-not-allowed
                              "
                              title="Nach oben"
                            >
                              <ArrowUp size={16} />
                            </button>

                            <button
                              type="button"
                              disabled={isLast || savingOrder}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                void moveByArrow(s.id, 1);
                              }}
                              className="
                                w-10 h-10 flex items-center justify-center rounded-lg
                                border border-zinc-300 bg-white hover:bg-zinc-100
                                dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
                                disabled:opacity-30 disabled:cursor-not-allowed
                              "
                              title="Nach unten"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 min-w-0">
                          <SectionEditor
                            section={s}
                            canDelete={true}
                            onUpdated={(next) =>
                              setSections((prev) => prev.map((x) => (x.id === next.id ? next : x)))
                            }
                            onDeleted={() =>
                              setSections((prev) => prev.filter((x) => x.id !== s.id))
                            }
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </SectionBox>

      <SectionBox title="Personen & Team">
        <PeopleEditor
          people={people}
          teamSection={teamSection ?? null}
          onTeamSectionChange={(nextTeamOrNull) => {
            setSections((prev) => {
              const without = prev.filter((s) => s.type !== "TEAM");
              return nextTeamOrNull ? [...without, nextTeamOrNull] : without;
            });
          }}
          onChange={(nextPeople) => setPeople(nextPeople)}
        />
      </SectionBox>
    </main>
  );
}
