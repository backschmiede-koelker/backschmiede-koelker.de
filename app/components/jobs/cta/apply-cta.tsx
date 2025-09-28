// /app/components/jobs/cta/apply-cta.tsx
"use client";

import { useMemo } from "react";
import type { Job } from "../../../lib/jobs/types";

export function ApplyCTA({ job }: { job: Job }) {
  const mailto = useMemo(() => {
    const to = process.env.NEXT_PUBLIC_MAIL_TO || "bewerbung@deine-domain.de";
    const subject = encodeURIComponent(`Bewerbung: ${job.title}`);
    const body = encodeURIComponent(
      `Hallo,\n\nich bewerbe mich auf die Position "${job.title}".\n\nKurzprofil:\n- Name:\n- Telefon:\n- Verfügbarkeit:\n\nBeste Grüße`
    );
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [job.title]);

  return (
    <aside
      className={[
        "rounded-2xl border p-5",
        "bg-gradient-to-br from-emerald-600/15 via-emerald-500/10 to-transparent",
        "backdrop-blur",
      ].join(" ")}
    >
      <h2 className="text-lg font-semibold mb-1">Jetzt bewerben</h2>
      <p className="text-sm opacity-85 mb-4">
        Sende uns deinen Lebenslauf (PDF) und ein paar Zeilen Motivation.
      </p>
      <a
        href={mailto}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border",
          "bg-emerald-600 text-white border-emerald-700/40",
          "hover:translate-y-[-1px] hover:shadow-md hover:brightness-105",
          "active:translate-y-[0px] transition",
          "w-full",
        ].join(" ")}
      >
        Bewerbung per E-Mail senden
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
      <p className="text-[12px] opacity-70 mt-3">
        Hinweis: Später kannst du hier einen Datei-Upload oder Bewerbungs-Wizard
        ergänzen.
      </p>
    </aside>
  );
}
