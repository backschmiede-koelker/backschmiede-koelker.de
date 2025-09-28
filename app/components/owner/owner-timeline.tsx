// File: /app/components/owner/owner-timeline.tsx
"use client";
import { Award, BookOpen, Hammer, Landmark } from "lucide-react";
import { InViewReveal } from "../animations/in-view";

const milestones = [
  { year: "2007", title: "Lehre begonnen", desc: "Erste Schritte am Ofen.", icon: Hammer },
  { year: "2014", title: "Meisterbrief", desc: "Bäckermeister mit Leidenschaft.", icon: Landmark },
  { year: "2019", title: "Backschmiede gegründet", desc: "Eigene Rezepturen & Sortiment.", icon: BookOpen },
  { year: "2023", title: "Preis für Bestes Sauerteigbrot", desc: "Regionale Auszeichnung.", icon: Award },
];

export default function OwnerTimeline() {
  return (
    <InViewReveal className="rounded-3xl bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-8" y={45}>
      <h3 className="text-xl font-semibold">Meilensteine</h3>
      <div className="mt-6 grid md:grid-cols-4 gap-6">
        {milestones.map(({ year, title, desc, icon: Icon }, i) => (
          <InViewReveal
            key={year}
            y={12}
            delay={i * 0.08}
            className="rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800"
            visibility={{ amountEnter: 0.08, amountLeave: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm opacity-70">{year}</div>
                <div className="font-medium">{title}</div>
              </div>
            </div>
            <p className="mt-3 text-sm opacity-90">{desc}</p>
          </InViewReveal>
        ))}
      </div>
    </InViewReveal>
  );
}
