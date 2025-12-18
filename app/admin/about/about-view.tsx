// app/admin/about/about-view.tsx
"use client";

import { useMemo, useState } from "react";
import type {
  AboutPersonDTO,
  AboutSectionDTO,
  AboutSectionType,
} from "./types";
import AdminHeader from "./components/admin-header";
import SectionBox from "./components/section-box";
import HeroEditor from "./components/hero-editor";
import SectionCreate from "./components/section-create";
import SectionEditor from "./components/section-editor";
import PeopleEditor from "./components/items/people-editor";

export default function AboutView({
  initialSections,
  initialPeople,
}: {
  initialSections: AboutSectionDTO[];
  initialPeople: AboutPersonDTO[];
}) {
  const [sections, setSections] = useState<AboutSectionDTO[]>(initialSections);
  const [people, setPeople] = useState<AboutPersonDTO[]>(initialPeople);

  const hero = useMemo(
    () => sections.find((s) => s.type === "HERO"),
    [sections]
  );

  const otherSections = useMemo(
    () => sections.filter((s) => s.type !== "HERO"),
    [sections]
  );

  const countsByType = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of otherSections) m.set(s.type, (m.get(s.type) ?? 0) + 1);
    return m;
  }, [otherSections]);

  // Typen, die i.d.R. nur 1x Sinn machen (du kannst die Liste jederzeit erweitern).
  const uniqueTypes = useMemo<Set<AboutSectionType>>(
    () => new Set(["VALUES", "STATS", "TIMELINE", "TEAM", "GALLERY", "FAQ"] as any),
    []
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-3.5 sm:px-6 md:px-8 py-6 md:py-10 min-w-0 space-y-8">
      <AdminHeader
        title="Über uns"
        subtitle="Hero ist fest (genau 1x). Weitere Bereiche + Personen/Team verwalten."
      />

      {/* HERO (immer vorhanden, nicht löschbar, nicht erstellbar) */}
      <SectionBox title="Hero (immer genau 1)">
        {hero ? (
          <HeroEditor
            section={hero}
            onUpdated={(next) =>
              setSections((prev) => prev.map((s) => (s.id === next.id ? next : s)))
            }
          />
        ) : (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Hero wird beim Laden automatisch angelegt. Reload, falls er hier gerade fehlt.
          </div>
        )}
      </SectionBox>

      {/* SECTIONS */}
      <SectionBox
        title="Bereiche"
        right={
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Reihenfolge über „SortOrder“ (kleiner = weiter oben)
          </div>
        }
      >
        <div className="space-y-5">
          <SectionCreate
            sections={otherSections}
            countsByType={countsByType}
            uniqueTypes={uniqueTypes}
            onCreated={(created) => setSections((prev) => [...prev, created])}
          />

          <div className="space-y-4">
            {otherSections.map((s) => (
              <SectionEditor
                key={s.id}
                section={s}
                canDelete={s.type !== "HERO"}
                onUpdated={(next) =>
                  setSections((prev) => prev.map((x) => (x.id === next.id ? next : x)))
                }
                onDeleted={() =>
                  setSections((prev) => prev.filter((x) => x.id !== s.id))
                }
              />
            ))}
            {otherSections.length === 0 && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Noch keine Bereiche (außer Hero).
              </div>
            )}
          </div>
        </div>
      </SectionBox>

      {/* PEOPLE */}
      <SectionBox title="Personen & Team">
        <PeopleEditor
          people={people}
          onChange={(next) => setPeople(next)}
        />
      </SectionBox>
    </main>
  );
}
