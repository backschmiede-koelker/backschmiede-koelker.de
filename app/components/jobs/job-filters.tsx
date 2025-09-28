// /app/components/jobs/job-filters.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SelectBox from "@/app/components/select-box";
import { InViewReveal } from "@/app/components/animations";

/**
 * Sofortiges Filtern:
 * - SelectBox: sofort router.replace(...)
 * - Suchfeld: debounce (400ms) während der Eingabe
 * Stacking:
 * - Header z-50 (extern)
 * - Filter z-40 (eigener Stacking-Context via `isolate`)
 * - Obere SelectBox z-30, untere z-20 → Dropdowns überlagern sich korrekt auf Mobile
 */

export function JobFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initial = useMemo(
    () => ({
      q: searchParams.get("q") ?? "",
      loc: searchParams.get("loc") ?? "Beide",
      role: searchParams.get("role") ?? "Alle",
    }),
    [searchParams]
  );

  const [q, setQ] = useState(initial.q);
  const [loc, setLoc] = useState(initial.loc);
  const [role, setRole] = useState(initial.role);

  const applyToUrl = (next: { q?: string; loc?: string; role?: string }) => {
    const params = new URLSearchParams();
    const _q = next.q ?? q;
    const _loc = next.loc ?? loc;
    const _role = next.role ?? role;

    if (_q) params.set("q", _q);
    if (_loc && _loc !== "Beide") params.set("loc", _loc);
    if (_role && _role !== "Alle") params.set("role", _role);

    router.replace(`${pathname}?${params.toString()}`);
  };

  // Debounce fürs Suchfeld (400ms)
  useEffect(() => {
    const t = setTimeout(() => {
      // nur URL updaten, wenn sich der Wert tatsächlich von initial unterscheidet
      applyToUrl({ q });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // SelectBox-Änderungen: sofort anwenden
  const onChangeLoc = (v: string) => {
    setLoc(v);
    applyToUrl({ loc: v });
  };
  const onChangeRole = (v: string) => {
    setRole(v);
    applyToUrl({ role: v });
  };

  return (
    <InViewReveal
      // unter Header (z-50), über Cards (z-10)
      className="sticky top-0 isolate z-40 md:static rounded-2xl border bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-3 md:p-4 shadow-sm mt-4"
      y={12}
      opacityFrom={0}
      visibility={{ amountEnter: 0.1, amountLeave: 0 }}
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-950 text-sm md:text-base outline-none ring-emerald-300 focus:ring-2 transition"
          placeholder="Suche (Titel, Stichwort)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // Enter → sofortiges Anwenden ohne Debounce
              applyToUrl({ q: (e.target as HTMLInputElement).value });
            }
          }}
          aria-label="Jobsuche"
        />

        {/* oberer Select (Ort) hat höheren Layer als der darunterliegende */}
        <div className="relative z-30">
          <SelectBox
            value={loc}
            onChange={onChangeLoc}
            options={["Beide", "Mettingen", "Recke"]}
            ariaLabel="Ort wählen"
            className="text-sm md:text-base"
          />
        </div>

        <div className="relative z-20">
          <SelectBox
            value={role}
            onChange={onChangeRole}
            options={["Alle", "Bäcker/in", "Verkäufer/in", "Azubi", "Aushilfe"]}
            ariaLabel="Rolle wählen"
            className="text-sm md:text-base"
          />
        </div>
      </div>
    </InViewReveal>
  );
}
