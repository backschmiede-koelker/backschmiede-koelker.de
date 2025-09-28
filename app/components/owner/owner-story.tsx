// File: /app/components/owner/owner-story.tsx
"use client";
import { InViewReveal, StaggerContainer, StaggerItem } from "../animations/in-view";

export default function OwnerStory() {
  return (
    <section className="grid md:grid-cols-2 gap-10 items-start">
      <InViewReveal className="rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-8" y={50}>
        <StaggerContainer>
          <StaggerItem>
            <h2 className="text-2xl font-bold tracking-tight">Meine Philosophie</h2>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-4 leading-7 text-zinc-700 dark:text-zinc-300">
              Seit der Kindheit zwischen Mehl und Sauerteig: Für mich zählt echtes
              Handwerk, natürliche Fermentation und der Respekt vor Rohstoffen.
              Lange Teigführungen sind kein Trend, sondern Grundhaltung – sie schenken
              Geschmack, Bekömmlichkeit und eine unverwechselbare Kruste.
            </p>
          </StaggerItem>
          <StaggerItem>
            <ul className="mt-6 grid gap-3 text-sm">
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"/>100% natürliche Vorteige & Sauerteige</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"/>Mehle von Höfen aus der Region</li>
              <li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"/>Kein Schnickschnack: Wasser, Mehl, Salz – Zeit macht den Rest</li>
            </ul>
          </StaggerItem>
        </StaggerContainer>
      </InViewReveal>

      <InViewReveal className="rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950/30 dark:to-zinc-900 shadow ring-1 ring-emerald-200/60 dark:ring-emerald-900/30 p-8" y={-40}>
        <blockquote className="text-xl font-medium leading-relaxed">
          „Gutes Brot ist wie Musik: wenige Noten, aber perfekt gespielt.“
        </blockquote>
        <div className="mt-4 text-sm opacity-70">— Josua Kölker</div>
      </InViewReveal>
    </section>
  );
}
