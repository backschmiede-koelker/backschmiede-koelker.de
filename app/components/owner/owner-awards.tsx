// File: /app/components/owner/owner-awards.tsx
"use client";
import { Medal } from "lucide-react";
import { InViewReveal } from "../animations/in-view";
import { motion as m } from "motion/react";

const awards = [
  { year: "2023", name: "Bestes Sauerteigbrot (Region)", org: "Brotpreis Mittelrhein" },
  { year: "2022", name: "Innovation Handwerk", org: "Handwerkskammer" },
  { year: "2020", name: "Kund*innenliebling", org: "Stadt Bruchhausen" },
];

export default function OwnerAwards() {
  return (
    <InViewReveal className="rounded-3xl bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-8" y={35}>
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Medal className="h-5 w-5 text-emerald-600" />
        Auszeichnungen
      </h3>
      <ul className="mt-6 grid gap-4">
        {awards.map((a, i) => (
          <InViewReveal
            key={a.name}
            y={12}
            delay={i * 0.06}
            className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
            visibility={{ amountEnter: 0.08, amountLeave: 0 }}
          >
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm opacity-70">{a.org}</div>
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">{a.year}</div>
          </InViewReveal>
        ))}
      </ul>
    </InViewReveal>
  );
}
