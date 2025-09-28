// File: /app/components/owner/owner-cta.tsx
"use client";
import { ArrowRight } from "lucide-react";
import { InViewReveal } from "../animations/in-view";
import { motion as m } from "motion/react";

export default function OwnerCTA() {
  return (
    <InViewReveal
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-950 dark:to-emerald-900 text-white p-5 md:p-12 shadow"
      y={35}
      visibility={{ amountEnter: 0.08, amountLeave: 0 }}
    >
      <div className="absolute inset-0 bg-[url('/owner/grain.png')] opacity-10 pointer-events-none" />
      <div className="relative">
        <m.h3 className="text-xl md:text-3xl font-bold tracking-tight" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          Lust auf Backkurs mit Josua?
        </m.h3>
        <m.p className="mt-2 text-white/90 max-w-prose text-sm md:text-base" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
          Lerne Sauerteigführung, Wirken & Backen direkt am Ofen. Kleine Gruppen, große Wirkung.
        </m.p>
        <m.a
          href="/kurse"
          className="mt-4 md:mt-5 inline-flex items-center gap-2 rounded-full bg-white text-emerald-700 px-4 md:px-5 py-2.5 font-medium shadow hover:bg-emerald-50 transition"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Zu den Terminen <ArrowRight className="h-4 w-4" />
        </m.a>
      </div>
    </InViewReveal>
  );
}
