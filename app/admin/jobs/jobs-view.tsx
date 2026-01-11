// app/admin/jobs/jobs-view.tsx
"use client";

import { useMemo, useState } from "react";
import { useJobs } from "./components/use-jobs";
import NewJobForm from "./components/new-job-form";
import JobEditorCard from "./components/job-editor-card";
import {
  categoryLabel,
  employmentLabel,
  locationLabel,
} from "@/app/components/jobs/formatters";
import AdminPageHeader from "../components/admin-page-header";
import type { JobCategory } from "@/app/lib/jobs/types";

export default function JobsView() {
  const { items, loading, reload, remove } = useJobs();

  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState<JobCategory | "ALLE">("ALLE");

  const highestPriority = useMemo(() => {
    if (!items.length) return null;
    const sorted = [...items].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
    const top = sorted[0];
    return { value: top.priority ?? 0, title: top.title };
  }, [items]);

  const categories = useMemo(() => {
    const s = new Set<JobCategory>();
    items.forEach((j) => s.add(j.category));
    return Array.from(s);
  }, [items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    const base = items.filter((j) => {
      const matchesCat = filterCat === "ALLE" || j.category === filterCat;
      if (!matchesCat) return false;

      if (!qq) return true;

      const haystack = [
        j.title,
        j.teaser,
        j.description ?? "",
        ...(j.responsibilities ?? []),
        ...(j.qualifications ?? []),
        ...(j.benefits ?? []),
        ...(j.locations ?? []).map(locationLabel),
        ...(j.employmentTypes ?? []).map(employmentLabel),
        j.shift ?? "",
        j.workloadNote ?? "",
        j.applyEmail ?? "",
        j.applyUrl ?? "",
        j.contactPhone ?? "",
        String(j.priority ?? 0),
      ]
        .join(" • ")
        .toLowerCase();

      return haystack.includes(qq);
    });

    const collator = new Intl.Collator("de-DE", { sensitivity: "base" });
    return base.sort((a, b) => {
      const pa = a.priority ?? 0;
      const pb = b.priority ?? 0;
      if (pb !== pa) return pb - pa;
      return collator.compare(a.title, b.title);
    });
  }, [items, q, filterCat]);

  const filterChipBase =
    "inline-flex max-w-full min-w-0 items-center rounded-full px-3 py-2 text-xs ring-1 transition " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-clip">
      <AdminPageHeader
        title="Jobs"
        subtitle="Erstelle, bearbeite und veröffentliche offene Stellen."
      /> 

      <NewJobForm onCreated={reload} highestPriority={highestPriority} />

      {/* ✅ Bereichs-Trenner + Titel */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Aktuelle Stellenausschreibungen
        </h2>
      </div>

      <div className="h-3 sm:h-4" />

      <div className="space-y-4 min-w-0">
        <div className="rounded-2xl border border-zinc-300/80 bg-white/90 p-3 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/10 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0 sm:p-4 min-w-0 overflow-x-hidden">
          <div className="flex flex-col gap-3 min-w-0">
            <input
              className="w-full min-w-0 rounded-xl border border-zinc-300/90 px-3 py-2.5 bg-white text-sm text-zinc-900 shadow-sm
                outline-none transition
                focus-visible:ring-2 focus-visible:ring-emerald-500/40
                dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100"
              placeholder="Suche (alles)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="flex flex-wrap gap-2 min-w-0 px-1 py-1 overflow-visible">
              <button
                type="button"
                onClick={() => setFilterCat("ALLE")}
                className={[
                  filterChipBase,
                  filterCat === "ALLE"
                    ? "bg-amber-100 ring-amber-300 text-amber-950 hover:bg-amber-200 " +
                      "dark:bg-amber-900/35 dark:ring-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/50"
                    : "bg-zinc-100 ring-zinc-300 text-zinc-900 hover:bg-zinc-200 " +
                      "dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700/70",
                ].join(" ")}
              >
                <span className="min-w-0 truncate">Alle</span>
              </button>

              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilterCat(c)}
                  className={[
                    filterChipBase,
                    filterCat === c
                      ? "bg-amber-100 ring-amber-300 text-amber-950 hover:bg-amber-200 " +
                        "dark:bg-amber-900/35 dark:ring-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/50"
                      : "bg-zinc-100 ring-zinc-300 text-zinc-900 hover:bg-zinc-200 " +
                        "dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700/70",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate">{categoryLabel(c)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <ul className="space-y-3 min-w-0">
          <li className="text-sm text-zinc-500 dark:text-zinc-400 min-h-[1.5rem] flex items-center">
            {loading ? "Lade…" : filtered.length === 0 ? "Keine Jobs gefunden." : null}
          </li>

          {filtered.map((job) => (
            <JobEditorCard
              key={job.id}
              job={job}
              onSaved={reload}
              onDelete={() => remove(job.id)}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
