// app/building/page.tsx
import { Suspense } from "react";
import AnalyticsBeacon from "../components/analytics-beacon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Im Aufbau | Backschmiede Kölker - Handwerk aus Recke & Mettingen",
  description: "Diese Seite befindet sich im Aufbau.",
  alternates: { canonical: "/building" },
  robots: { index: false, follow: false, nocache: true },
};

export default function BuildingPage() {
  return (
    <div className="overflow-hidden fixed inset-0 z-[9999] min-h-dvh w-full bg-zinc-950 text-zinc-100 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <p className="text-xs sm:text-sm text-zinc-400 tracking-widest uppercase">
            Coming soon
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Im Aufbau.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-prose">
            Wir sind bald online da — mit neuen Inhalten und frischem Design.
          </p>

          <div className="mt-8 h-px w-full bg-white/10" />

          <p className="mt-4 text-xs sm:text-sm text-zinc-500">
            Danke für deine Geduld.
          </p>
        </div>

        <p className="mt-5 text-center text-[11px] sm:text-xs text-zinc-600">
          © {new Date().getFullYear()}
        </p>
      </div>
      <Suspense fallback={null}>
        <AnalyticsBeacon />
      </Suspense>
    </div>
  );
}
