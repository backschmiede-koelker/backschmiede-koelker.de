// app/admin/about/about-view.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutPersonDTO, AboutSectionDTO } from "./types";
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

  const hero = useMemo(() => sections.find((s) => s.type === "HERO"), [sections]);
  const teamSection = useMemo(() => sections.find((s) => s.type === "TEAM"), [sections]);

  const editableSections = useMemo(
    () => sections.filter((s) => s.type !== "HERO" && s.type !== "TEAM"),
    [sections]
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-3.5 sm:px-6 md:px-8 py-6 md:py-10 min-w-0 space-y-8">
      <AdminHeader
        title="Über uns"
        subtitle="Beschreibe hier die verschiedenen Abschnitte der 'Über uns'-Seite."
      />

      <SectionBox
        title="Hero Bereich"
        collapsible
        defaultOpen={false}
        summary={
          hero ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
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
        <div className="space-y-5">
          <SectionCreate
            sections={editableSections}
            onCreated={(created) => setSections((prev) => [...prev, created])}
          />

          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden bg-white/60 dark:bg-zinc-950/30">
            <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
              {editableSections.map((s) => (
                <div key={s.id} className="p-4">
                  <SectionEditor
                    section={s}
                    canDelete={true}
                    onUpdated={(next) =>
                      setSections((prev) => prev.map((x) => (x.id === next.id ? next : x)))
                    }
                    onDeleted={() => setSections((prev) => prev.filter((x) => x.id !== s.id))}
                  />
                </div>
              ))}
              {editableSections.length === 0 && (
                <div className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Noch keine Bereiche.
                </div>
              )}
            </div>
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
