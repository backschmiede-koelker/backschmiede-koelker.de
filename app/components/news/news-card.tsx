// app/components/news/news-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { publicAssetUrl } from "@/app/lib/uploads";
import type { ApiNews } from "./types";
import { TagBadge } from "./tag-badge";
import { formatDateISO } from "./utils";

export function NewsCard({ n }: { n: ApiNews }) {
  const img = publicAssetUrl(n.imageUrl);
  const hasImg = !!img;
  const hasCTA = !!(n.ctaHref && n.ctaLabel);

  // Einheitliche Bildhöhe (keine Sprünge zwischen Cards mit/ohne CTA)
  const imgHeights = "h-48 sm:h-60 lg:h-64";

  // Kartenhöhe:
  // - Basis (Mobile): 600px (stabil)
  // - Ab sm:       660px (dein „normal“)
  // - Ab lg:       740px
  // => Desktop-Höhe ist Standard; auf klein brechen wir ein wenig runter.
  const cardHeights = "h-[600px] sm:h-[660px] lg:h-[740px]";

  // Dynamische Mindesthöhe für die Textbox:
  // Auf Mobile etwas niedriger als auf sm+/lg, damit die Card insgesamt kürzer sein kann.
  const bodyMinHBase =
    hasImg && hasCTA
      ? "min-h-[7rem]"      // mobile
      : hasImg && !hasCTA
      ? "min-h-[8.5rem]"
      : !hasImg && hasCTA
      ? "min-h-[10.5rem]"
      : "min-h-[12.5rem]";
  const bodyMinHSm =
    hasImg && hasCTA
      ? "sm:min-h-[9.5rem]" // sm und größer (deine bisherigen Werte, leicht angepasst)
      : hasImg && !hasCTA
      ? "sm:min-h-[11.5rem]"
      : !hasImg && hasCTA
      ? "sm:min-h-[13.5rem]"
      : "sm:min-h-[15.5rem]";
  const bodyMinHLg =
    hasImg && hasCTA
      ? "lg:min-h-[10.5rem]" // lg und größer
      : hasImg && !hasCTA
      ? "lg:min-h-[12.5rem]"
      : !hasImg && hasCTA
      ? "lg:min-h-[14.5rem]"
      : "lg:min-h-[16.5rem]";

  return (
    <article
      className={`relative grid ${cardHeights} w-full max-w-full
                 grid-rows-[auto,1fr,auto] gap-y-1.5
                 overflow-hidden rounded-3xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur
                 ring-1 ring-black/5 dark:ring-white/10 shadow-sm overflow-x-hidden`}
    >
      {/* Header */}
      {hasImg ? (
        <div className={`relative ${imgHeights} w-full overflow-hidden`}>
          <Image
            src={img!}
            alt={n.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-10 w-full overflow-hidden">
          <div className="h-full w-full bg-[conic-gradient(at_20%_20%,theme(colors.emerald.300)_0%,theme(colors.emerald.500)_35%,theme(colors.emerald.400)_55%,theme(colors.emerald.600)_75%,theme(colors.emerald.300)_100%)] opacity-25 dark:opacity-30" />
        </div>
      )}

      {/* Content */}
      <div className="min-h-0 min-w-0 px-3 sm:px-5 lg:px-7 py-3 sm:py-5 lg:py-6
                      grid grid-rows-[auto,auto,1fr] gap-y-1.5">
        {/* Tag + Datum */}
        <div className="flex items-center gap-2 min-w-0 max-w-full">
          <div className="min-w-0 max-w-[72%] sm:max-w-[60%]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              <TagBadge tag={n.tag} />
            </div>
          </div>
          <time className="ml-auto shrink-0 whitespace-nowrap text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
            {formatDateISO(n.publishedAt)}
          </time>
        </div>

        {/* Titel */}
        <h3
          className="min-w-0 max-w-full text-base sm:text-lg lg:text-xl font-semibold leading-snug
                     wrap-anywhere hyphens-auto line-clamp-3"
          title={n.title}
        >
          {n.title}
        </h3>

        {/* Body: füllt Rest, hat je nach Bild/CTA eine Mindesthöhe (pro Breakpoint abgestuft) */}
        <div
          className={[
            "min-h-0 max-w-full overflow-auto pr-2",
            bodyMinHBase, bodyMinHSm, bodyMinHLg,
            "text-[14px] sm:text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300",
            "[scrollbar-width:thin] overscroll-contain",
            "wrap-anywhere hyphens-auto overflow-x-hidden",
          ].join(" ")}
          style={{ scrollbarGutter: "stable" } as React.CSSProperties}
        >
          <p className="whitespace-pre-line">{n.body}</p>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="flex items-center gap-2 px-3 sm:px-5 lg:px-7 pb-2 pt-0 min-w-0 max-w-full z-10">
        {hasCTA ? (
          <Link
            href={n.ctaHref!}
            title={n.ctaLabel!}
            className="inline-flex w-full min-w-0 max-w-full items-center justify-center gap-2 rounded-xl
                       border border-zinc-300/60 dark:border-zinc-700/60
                       bg-white/90 dark:bg-zinc-900/40
                       px-3 sm:px-4 py-2.5 text-sm font-medium shadow-sm
                       transition-colors
                       hover:bg-emerald-50 hover:border-emerald-400
                       dark:hover:bg-emerald-400/5 dark:hover:border-emerald-500/50
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
                       whitespace-normal text-center leading-tight"
            aria-label={n.ctaLabel!}
          >
            <span className="min-w-0 max-w-full wrap-anywhere break-all">
              {n.ctaLabel}
            </span>
          </Link>
        ) : (
          <span className="block h-9" />
        )}
      </div>
    </article>
  );
}
