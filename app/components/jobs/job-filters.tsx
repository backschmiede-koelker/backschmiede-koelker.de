// app/components/jobs/job-filters.tsx
"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SelectBox from "@/app/components/select-box";
import type { JobFacets } from "./facets";
import { categoryLabel, employmentLabel, locationLabel } from "./formatters";

type Props = { facets: JobFacets };

function parseListParam(v: string | null) {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function JobFilters({ facets }: Props) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initial = useMemo(() => {
    return {
      loc: sp.get("loc") ?? "ALLE",
      cat: sp.get("cat") ?? "ALLE",
      emp: parseListParam(sp.get("emp")),
    };
  }, [sp]);

  const [loc, setLoc] = useState(initial.loc);
  const [cat, setCat] = useState(initial.cat);
  const [emp, setEmp] = useState<string[]>(initial.emp);

  const locOptions = useMemo(
    () => facets.locations.map(locationLabel),
    [facets.locations]
  );
  const catOptions = useMemo(
    () => facets.categories.map(categoryLabel),
    [facets.categories]
  );
  const empOptions = useMemo(
    () => facets.employmentTypes.map(employmentLabel),
    [facets.employmentTypes]
  );

  function apply(next?: Partial<{ loc: string; cat: string; emp: string[] }>) {
    const params = new URLSearchParams();
    const _loc = next?.loc ?? loc;
    const _cat = next?.cat ?? cat;
    const _emp = next?.emp ?? emp;

    if (_loc && _loc !== "ALLE") params.set("loc", _loc);
    if (_cat && _cat !== "ALLE") params.set("cat", _cat);
    if (_emp.length) params.set("emp", _emp.join(","));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleEmp(label: string) {
    setEmp((prev) => {
      const next = prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label];
      apply({ emp: next });
      return next;
    });
  }

  function resetAll() {
    setLoc("ALLE");
    setCat("ALLE");
    setEmp([]);
    router.replace(pathname);
  }

  return (
    <div 
      className="sticky top-0 z-30 rounded-2xl border border-zinc-200/80
        bg-white/95 backdrop-blur p-3 sm:p-4
        shadow-lg shadow-zinc-900/20 ring-1 ring-zinc-900/15
        dark:bg-zinc-900/70 dark:shadow-none dark:ring-0"
    >
      {/* Controls: mobile 1 col, md 2 col (weil Sidebar!), lg 3 col */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <SelectBox
          value={loc === "ALLE" ? "Alle Standorte" : loc}
          onChange={(v) => {
            const next = v === "Alle Standorte" ? "ALLE" : v;
            setLoc(next);
            apply({ loc: next });
          }}
          options={["Alle Standorte", ...locOptions]}
          ariaLabel="Standort"
          className="text-sm md:text-base"
        />

        <SelectBox
          value={cat === "ALLE" ? "Alle Bereiche" : cat}
          onChange={(v) => {
            const next = v === "Alle Bereiche" ? "ALLE" : v;
            setCat(next);
            apply({ cat: next });
          }}
          options={["Alle Bereiche", ...catOptions]}
          ariaLabel="Bereich"
          className="text-sm md:text-base"
        />

        {/* Reset: auf kleinen Screens volle Breite, ab lg rechts */}
        <button
          type="button"
          onClick={resetAll}
          className="w-full rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm
            transition
            hover:bg-zinc-100 hover:text-zinc-900 hover:shadow
            active:translate-y-[1px] active:shadow-sm
            focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30
            dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200
            dark:hover:bg-zinc-800/70 dark:hover:text-white
            lg:w-auto lg:justify-self-end"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Employment pills */}
      <div className="mt-3 flex flex-col gap-2">
        <div className="text-xs font-medium text-zinc-500">
          Beschäftigung
        </div>

        <div className="flex flex-wrap gap-2">
          {empOptions.map((label) => {
            const active = emp.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleEmp(label)}
                className={[
                  "max-w-full rounded-full px-3 py-1 text-xs ring-1 transition",
                  "truncate", // wichtig für 300px, falls label lang ist
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30",
                  active
                    ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 ring-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/70 dark:text-emerald-200 dark:ring-emerald-700"
                    : "bg-zinc-100 text-zinc-800 ring-zinc-300 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-800/50 dark:text-zinc-200 dark:hover:text-white dark:ring-zinc-700",
                ].join(" ")}
                title={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
