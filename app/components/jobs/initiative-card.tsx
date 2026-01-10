// app/components/jobs/initiative-card.tsx
"use client";

export function InitiativeCard() {
  const mail =
    process.env.NEXT_PUBLIC_MAIL_TO ||
    process.env.MAIL_TO ||
    "info@backschmiede-koelker.de";

  return (
    <section
      id="initiativ"
      data-initiativ="true"
      className="mt-10 relative w-full rounded-2xl overflow-hidden border
        bg-gradient-to-r from-emerald-600/15 via-emerald-500/10 to-emerald-600/15
        backdrop-blur
        shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/5
        dark:from-emerald-300/15 dark:via-emerald-300/10
        dark:shadow-none dark:ring-0"
    >
      {/* Accent line + glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/16 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-amber-400/16 blur-3xl" />
      </div>

      <div className="relative p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-700/15
            bg-gradient-to-r from-emerald-50/80 to-amber-50/70 px-3 py-1 text-[11px] font-medium
            text-zinc-900 dark:border-white/10 dark:from-emerald-900/20 dark:to-amber-900/15 dark:text-zinc-100"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Initiativbewerbung
          </div>

          <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-xl">
            Nichts Passendes dabei?
          </h3>

          <p className="text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-sm">
            Bewirb dich initiativ als <strong>Bäcker/in</strong>, <strong>Verkauf</strong>,{" "}
            <strong>Aushilfe</strong> oder <strong>Azubi</strong>. Schreib kurz,{" "}
            <span className="font-medium">wo</span> du arbeiten möchtest (Mettingen/Recke) und{" "}
            <span className="font-medium">ab wann</span> du verfügbar bist.
          </p>

          <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
            {["📍 Mettingen & Recke", "💬 Schnelle Antwort", "💶 Faire Bezahlung"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-zinc-400/70 bg-white/70 px-2.5 py-1
                  text-zinc-800 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="pt-1">
            <a
              href={`mailto:${mail}?subject=${encodeURIComponent("Initiativbewerbung")}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl
                bg-gradient-to-r from-emerald-600 to-emerald-700
                px-4 py-2.5 text-sm font-semibold text-white
                shadow-lg shadow-emerald-600/20 transition
                hover:from-emerald-700 hover:to-emerald-800
                active:translate-y-[1px] active:shadow-md
                focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
                sm:w-auto"
            >
              E-Mail senden
              <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90" fill="none">
                <path
                  d="M13 5l7 7-7 7M5 12h15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
