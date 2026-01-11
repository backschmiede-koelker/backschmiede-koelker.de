"use client";

import Image from "next/image";
import Link from "next/link";
import { publicAssetUrl } from "@/app/lib/uploads";
import type { ApiNews } from "./types";
import { TagBadge } from "./tag-badge";
import { formatDateISO } from "./utils";
import type { CSSProperties } from "react";

export function NewsCard({ n }: { n: ApiNews }) {
  const img = publicAssetUrl(n.imageUrl);
  const hasImg = !!img;
  const hasCTA = !!(n.ctaHref && n.ctaLabel);
  const scrollStyle: CSSProperties & { scrollbarGutter?: string } = {
    scrollbarGutter: "stable",
  };

  return (
    <article
      className="
        h-[520px] sm:h-[560px]
        w-full min-w-0
        overflow-hidden rounded-2xl
        bg-white/95 ring-1 ring-black/5 shadow-sm
        dark:bg-zinc-900/70 dark:ring-white/10
        flex flex-col
      "
    >
      {/* Header */}
      {hasImg ? (
        <div className="relative h-44 sm:h-48 w-full overflow-hidden">
          <Image
            src={img!}
            alt={n.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="relative h-44 sm:h-48 w-full overflow-hidden">
          {/* Placeholder ohne "Aktuelles" Badge */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200/80 via-emerald-200/55 to-amber-300/70 dark:from-amber-900/25 dark:via-emerald-900/20 dark:to-amber-900/25" />
          <div className="absolute inset-0 opacity-25 dark:opacity-15 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.25)_0,transparent_45%),radial-gradient(circle_at_80%_30%,rgba(0,0,0,0.18)_0,transparent_50%)]" />
        </div>
      )}

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col min-w-0 p-3.5 sm:p-4">
        {/* Tag + Datum */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0 flex flex-wrap items-center gap-1.5">
            <TagBadge tag={n.tag} />
          </div>

          <time className="ml-auto shrink-0 whitespace-nowrap text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
            {formatDateISO(n.publishedAt)}
          </time>
        </div>

        {/* Scrollbarer Textbereich: kein ... und KEIN horizontaler Scroll */}
        <div
          className="
            mt-2 min-h-0 flex-1 min-w-0
            overflow-y-auto overflow-x-hidden
            pr-2
            [scrollbar-width:thin] overscroll-contain
          "
          style={scrollStyle}
        >
          <h3 className="text-sm sm:text-base font-semibold leading-snug break-words hyphens-auto">
            {n.title}
          </h3>

          <p className="mt-2 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 break-words hyphens-auto">
            {n.body}
          </p>
        </div>

        {/* CTA unten fix */}
        <div className="mt-3">
          {hasCTA ? (
            <Link
              href={n.ctaHref!}
              title={n.ctaLabel!}
              className="
                inline-flex w-full min-w-0 items-center justify-center gap-2
                rounded-xl border border-amber-600/30 bg-amber-100/70
                px-3 py-2 text-sm font-semibold text-amber-900 shadow-sm
                transition-colors hover:bg-amber-200/70 hover:border-amber-600/40
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40
                dark:bg-zinc-900/40 dark:text-amber-200 dark:border-amber-300/25
                dark:hover:bg-amber-900/25 dark:hover:border-amber-300/40
              "
              aria-label={n.ctaLabel!}
            >
              <span className="min-w-0 break-words text-center">
                {n.ctaLabel}
              </span>
            </Link>
          ) : (
            <span className="block h-9" />
          )}
        </div>
      </div>
    </article>
  );
}
