// File: /app/components/owner/owner-stats.tsx
"use client";
import { InViewReveal } from "../animations/in-view";
import { motion as m } from "motion/react";

export default function OwnerStats() {
  const stats = [
    { k: "Jahre im Handwerk", v: "18+" },
    { k: "Teigruhe (Std.)", v: "24–48" },
    { k: "Sorten im Sortiment", v: "30+" },
    { k: "Auszeichnungen", v: "7" },
  ];
  return (
    <InViewReveal className="rounded-3xl bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-5 md:p-10" y={40}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <InViewReveal
            key={s.k}
            y={10}
            delay={i * 0.06}
            duration={0.5}
            className="text-center"
            visibility={{ amountEnter: 0.08, amountLeave: 0 }}
          >
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-600">{s.v}</div>
            <div className="mt-1 text-xs md:text-sm opacity-80">{s.k}</div>
          </InViewReveal>
        ))}
      </div>
    </InViewReveal>
  );
}
