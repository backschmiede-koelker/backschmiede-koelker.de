// File: /app/components/owner/owner-values.tsx
"use client";
import { Leaf, Wheat, Timer, Handshake } from "lucide-react";
import { InViewReveal } from "../animations/in-view";

const values = [
  { icon: Wheat, title: "Regionale Mehle", desc: "Kurze Wege, volle Transparenz und partnerschaftliche Landwirtschaft." },
  { icon: Timer, title: "Zeit als Zutat", desc: "Lange Gare statt Zusatzstoffe." },
  { icon: Leaf, title: "Natürlichkeit", desc: "Fermentation, Geschmack, Bekömmlichkeit." },
  { icon: Handshake, title: "Fairness", desc: "Ehrliche Preise & fairer Umgang im Team." },
];

export default function OwnerValues() {
  return (
    <InViewReveal className="rounded-3xl bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-8" y={50}>
      <h3 className="text-xl font-semibold">Werte</h3>
      <div className="mt-6 grid md:grid-cols-4 gap-6">
        {values.map(({ icon: Icon, title, desc }, i) => (
          <InViewReveal
            key={title}
            y={8}
            delay={i * 0.07}
            className="rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800"
            visibility={{ amountEnter: 0.08, amountLeave: 0 }}
          >
            <Icon className="h-6 w-6 text-emerald-600" />
            <div className="mt-3 font-medium">{title}</div>
            <p className="mt-1 text-sm opacity-90">{desc}</p>
          </InViewReveal>
        ))}
      </div>
    </InViewReveal>
  );
}
