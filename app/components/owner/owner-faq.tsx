// File: /app/components/owner/owner-faq.tsx
"use client";
import { useState } from "react";
import { motion as m, AnimatePresence } from "motion/react";
import { InViewReveal } from "../animations/in-view";

const faqs = [
  { q: "Warum sind lange Teigführungen wichtig?", a: "Sie bauen Säuren ab, fördern Aroma & Bekömmlichkeit und sorgen für Stabilität im Teig." },
  { q: "Verwendet ihr Zusatzstoffe?", a: "Nein – Zeit, Temperatur, gute Rohstoffe. Mehr braucht es nicht." },
  { q: "Bietet ihr Kurse an?", a: "Ja, regelmäßig am Samstag. Termine im Laden & auf Instagram." },
];

function Disclosure({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <InViewReveal y={10} className="group rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left font-medium flex items-center justify-between">
        {q}
        <m.span
          aria-hidden
          className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          +
        </m.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
            <m.p className="mt-3 text-sm opacity-90" initial={{ y: -6 }} animate={{ y: 0 }}>
              {a}
            </m.p>
          </m.div>
        )}
      </AnimatePresence>
    </InViewReveal>
  );
}

export default function OwnerFAQ() {
  return (
    <InViewReveal className="rounded-3xl bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-8" y={30}>
      <h3 className="text-xl font-semibold">Fragen an den Inhaber</h3>
      <div className="mt-6 grid gap-4">
        {faqs.map((f) => (
          <Disclosure key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </InViewReveal>
  );
}
