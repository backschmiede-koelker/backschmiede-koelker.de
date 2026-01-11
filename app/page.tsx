// app/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { FaWheatAwn, FaLeaf, FaHeart } from "react-icons/fa6";

import HeroScrollCta from "./components/hero-scroll-cta";
import Hours from "./components/hours";
import TgtgCta from "./components/tgtg-cta";
import News from "./components/news/news";
import TodayOffersSection from "./components/offers/today-offers-section";
import UpcomingOffersSection from "./components/offers/upcoming-offers-section";
import { getPrisma } from "@/lib/prisma";

/** Prüft serverseitig via DB, ob mindestens eine aktive News existiert */
async function getNewsPresence() {
  try {
    const count = await getPrisma().news.count({ where: { isActive: true } });
    return count > 0;
  } catch {
    // Fallback: lieber anzeigen als fälschlich verstecken
    return true;
  }
}

export const metadata: Metadata = {
  title: "Backschmiede Kölker - Handwerk aus Recke & Mettingen",
  description:
    "In Recke und Mettingen backt die Backschmiede Kölker Brote, Brötchen und Kuchen mit langer Teigführung, Sauerteig und regionalen Zutaten.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Backschmiede Kölker - Handwerk aus Recke & Mettingen",
    description:
      "In Recke und Mettingen backt die Backschmiede Kölker Brote, Brötchen und Kuchen mit langer Teigführung, Sauerteig und regionalen Zutaten.",
    url: "/",
    type: "website",
  },
};

export default async function Page() {
  const hasNews = await getNewsPresence();

  return (
    <>
      {/* HERO */}
      <section
        aria-labelledby="hero-title"
        className={[
          "relative",
          "-mt-14 pt-14",
          "isolate overflow-hidden",
          "bg-gradient-to-b from-emerald-100 via-amber-100/50 to-emerald-200/70",
          "dark:from-green-950 dark:via-zinc-900/80 dark:to-green-900",
        ].join(" ")}
      >
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-[68vh] grid-cols-1 items-center gap-8 py-10 sm:py-14 xl:min-h-[72vh] xl:grid-cols-[1fr,0.95fr]">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/15 bg-white/75 dark:bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Frisch gebacken in Mettingen &amp; Recke
              </div>

              <h1
                id="hero-title"
                className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl"
              >
                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent dark:from-emerald-300 dark:via-teal-200 dark:to-amber-300">
                  Backschmiede Kölker
                </span>
                <br />
                <span className="text-zinc-900 dark:text-zinc-100">
                  Handwerk. Zeit. Gute Zutaten.
                </span>
              </h1>

              <p className="mt-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
                Brote, Brötchen und Kuchen mit langer Teigführung, eigenem
                Sauerteig und viel Liebe. Komm vorbei - wir freuen uns auf dich!
              </p>

              {/* CTA: Öffnungszeiten & Angebote */}
              <HeroScrollCta
                angebotId="angebote"
                zeitenId="oeffnungszeiten"
                className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start"
              />

              <ul className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm lg:justify-start">
                <li className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/10 bg-white/60 dark:bg-white/10 px-3 py-1.5 text-zinc-800 dark:text-zinc-200">
                  <FaWheatAwn aria-hidden className="text-[14px]" />
                  Eigener Sauerteig
                </li>
                <li className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/10 bg-white/60 dark:bg-white/10 px-3 py-1.5 text-zinc-800 dark:text-zinc-200">
                  <FaLeaf aria-hidden className="text-[14px]" />
                  Regional &amp; ehrlich
                </li>
                <li className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/10 bg-white/60 dark:bg-white/10 px-3 py-1.5 text-zinc-800 dark:text-zinc-200">
                  <FaHeart aria-hidden className="text-[14px]" />
                  Mit Liebe gebacken
                </li>
              </ul>
            </div>

            {/* Postkarten (xl sichtbar) */}
            <div className="relative hidden xl:block">
              <div className="relative h-[440px] w-full">
                {/* Mettingen */}
                <div className="absolute left-0 top-8 w-[58%] rotate-[-3.5deg]">
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-800/10 bg-white/60 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/5">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src="/mettingen-draussen-alt.png"
                        alt="Mettingen"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/85 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur dark:bg-zinc-900/70 dark:text-zinc-200 border border-emerald-800/10 dark:border-emerald-300/10">
                      Mettingen
                    </div>
                  </div>
                </div>
                {/* Recke */}
                <div className="absolute right-0 top-0 w-[58%] rotate-[4deg]">
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-800/10 bg-white/60 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/5">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src="/recke-tuer-ballons.jpg"
                        alt="Recke"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/85 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur dark:bg-zinc-900/70 dark:text-zinc-200 border border-emerald-800/10 dark:border-emerald-300/10">
                      Recke
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Karten */}
            <div className="xl:hidden mt-8">
              <div className="relative mx-auto h-[300px] sm:h-[330px] md:h-[360px] w-full max-w-[420px]">
                {/* Mettingen */}
                <div
                  className="
                  absolute left-0
                  top-8 md:top-10
                  w-[70%] sm:w-[72%] md:w-[74%]
                  rotate-[-3deg] sm:rotate-[-3.5deg] lg:rotate-[-4deg]
                "
                >
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-800/10 bg-white/60 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/5">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src="/mettingen-draussen-alt.png"
                        alt="Mettingen"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/85 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur dark:bg-zinc-900/70 dark:text-zinc-200 border border-emerald-800/10 dark:border-emerald-300/10">
                      Mettingen
                    </div>
                  </div>
                </div>

                {/* Recke */}
                <div
                  className="
                  absolute right-0
                  top-0
                  w-[70%] sm:w-[72%] md:w-[74%]
                  rotate-[3deg] sm:rotate-[3.5deg] lg:rotate-[4.5deg]
                "
                >
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-800/10 bg-white/60 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/5">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src="/recke-tuer-ballons.jpg"
                        alt="Recke"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white/85 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur dark:bg-zinc-900/70 dark:text-zinc-200 border border-emerald-800/10 dark:border-emerald-300/10">
                      Recke
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waves */}
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 1440 140"
            className="block h-[56px] sm:h-[84px] lg:h-[110px] w-full"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              className="text-white dark:text-zinc-900 opacity-70 sm:opacity-80"
              d="M0,80 C220,130 360,20 540,50 C720,80 900,160 1080,120 C1260,80 1360,70 1440,100 L1440,200 L0,200 Z"
            />
            <path
              fill="currentColor"
              className="text-white dark:text-zinc-900"
              d="M0,95 C200,140 360,30 540,55 C720,80 900,165 1080,130 C1260,95 1360,85 1440,110 L1440,200 L0,200 Z"
            />
          </svg>
          <div className="h-12 sm:h-16 lg:h-20 bg-white dark:bg-zinc-900" />
        </div>
      </section>

      {/* AKTUELLES - unabhängig von Angeboten */}
      {hasNews && (
        <section
          id="aktuelles"
          className="mx-auto mt-0 w-full max-w-5xl px-4 scroll-mt-20"
          aria-labelledby="aktuelles-title"
        >
          <h2
            className="mb-4 text-center text-3xl font-bold"
            id="aktuelles-title"
          >
            Aktuelles
          </h2>

          <div
            className="
              relative overflow-hidden rounded-3xl
              border border-amber-500/25
              bg-gradient-to-br from-amber-50/70 via-white/90 to-emerald-50/65
              p-3 shadow-sm
              dark:border-amber-300/25 dark:from-amber-900/18 dark:via-zinc-900/75 dark:to-emerald-900/25
              sm:p-6
            "
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -right-12 h-32 w-32 rounded-full bg-amber-300/25 blur-[60px] dark:bg-amber-400/20"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-emerald-300/18 blur-[60px] dark:bg-emerald-500/15"
            />
            <div className="relative z-10 min-w-0">
              <News />
            </div>
          </div>
        </section>
      )}

      {/* ANGEBOTE */}
      <section
        id="angebote"
        className="mx-auto mt-10 w-full max-w-5xl px-4 scroll-mt-20"
        aria-labelledby="angebote-title"
      >
        <header className="mb-4 text-center">
          <h2
            className="text-3xl font-bold"
            id="angebote-title"
          >
            Angebote
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Hier findest du unsere aktuellen Spezialpreise und Aktionen - heute
            und für die nächsten Tage.
          </p>
        </header>

        {/* HEUTE - zeigt nur etwas, wenn auch wirklich Angebote existieren */}
        <Suspense fallback={null}>
          <TodayOffersSection />
        </Suspense>

        {/* DEMNÄCHST - wird automatisch ausgeblendet, wenn leer */}
        <Suspense fallback={null}>
          <UpcomingOffersSection />
        </Suspense>

        {/* To Good To Go - immer sichtbar, sorgt dafür dass die Section nie „leer“ wirkt */}
        <div className="mt-8">
          <TgtgCta />
        </div>
      </section>

      {/* ÖFFNUNGSZEITEN */}
      <section
        id="oeffnungszeiten"
        className="mx-auto mt-12 w-full max-w-5xl px-4 scroll-mt-20"
        aria-labelledby="oeffnungszeiten-title"
      >
        <h2
          className="mb-4 text-center text-3xl font-bold"
          id="oeffnungszeiten-title"
        >
          Öffnungszeiten
        </h2>
        <div className="rounded-3xl border border-emerald-800/10 bg-white/70 p-4 shadow-sm dark:border-emerald-300/15 dark:bg-white/5 sm:p-6">
          <Hours />
        </div>
      </section>
    </>
  );
}
