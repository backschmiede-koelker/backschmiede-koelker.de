// /app/components/jobs/initiative-card.tsx
"use client";

import Link from "next/link";
import { InViewReveal } from "@/app/components/animations";

export function InitiativeCard() {
  const mail =
    process.env.NEXT_PUBLIC_MAIL_TO ||
    process.env.MAIL_TO ||
    "bewerbung@deine-domain.de";
  return (
    <InViewReveal
      className={[
        "relative w-full rounded-2xl overflow-hidden border",
        "bg-gradient-to-r from-emerald-600/15 via-emerald-500/10 to-emerald-600/15",
        "dark:from-emerald-300/15 dark:via-emerald-300/10",
        "backdrop-blur shadow-sm",
      ].join(" ")}
      y={18}
      opacityFrom={0}
      visibility={{ amountEnter: 0.12, amountLeave: 0 }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-40 blur-3xl">
        <div className="absolute -top-10 left-10 h-40 w-40 rounded-full bg-emerald-400/40" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-emerald-600/30" />
      </div>

      <div className="relative p-4 md:p-6 space-y-3">
        <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
          Initiativ bewerben
        </h3>
        <p className="text-[13px] md:text-sm opacity-85 max-w-3xl">
          Nichts Passendes gefunden? Bewirb dich initiativ als{" "}
          <strong>Bäcker/in</strong>, <strong>Verkäufer/in</strong>,{" "}
          <strong>Aushilfe</strong> oder <strong>Azubi</strong>. Sag uns kurz,
          wo du arbeiten möchtest (Mettingen/Recke) und ab wann du verfügbar
          bist.
        </p>

        <div className="flex flex-wrap gap-2 text-[11px] md:text-xs">
          <span className="rounded-full border px-2 py-1">📍 Mettingen</span>
          <span className="rounded-full border px-2 py-1">📍 Recke</span>
          <span className="rounded-full border px-2 py-1">💬 Schnelle Antwort</span>
          <span className="rounded-full border px-2 py-1">💶 Faire Bezahlung</span>
        </div>

        <div className="pt-1">
          <a
            href={`mailto:${mail}?subject=${encodeURIComponent(
              "Initiativbewerbung"
            )}`}
            className={[
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border",
              "bg-emerald-600 text-white border-emerald-700/40",
              "hover:translate-y-[-1px] hover:shadow-md hover:brightness-105",
              "active:translate-y-[0px] transition",
            ].join(" ")}
          >
            E-Mail senden
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="opacity-90"
              fill="none"
            >
              <path
                d="M13 5l7 7-7 7M5 12h15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <Link
            href="/jobs/initiativ"
            className={[
              "ms-2 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm border",
              "bg-white/70 dark:bg-zinc-900/70",
              "hover:translate-y-[-1px] hover:shadow",
              "transition",
            ].join(" ")}
          >
            Infos zur Initiativbewerbung
          </Link>
        </div>
      </div>
    </InViewReveal>
  );
}
