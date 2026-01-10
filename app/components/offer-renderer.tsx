// app/components/offer-renderer.tsx
"use client";

import React from "react";
import Image from "next/image";
import { euro } from "../lib/format";
import { publicAssetUrl } from "@/app/lib/uploads";

type ProductLite = {
  id: string;
  name: string;
  priceCents: number;
  unit: string;
};

type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type OfferDTO = {
  id: string;
  type: "GENERIC" | "PRODUCT_NEW" | "PRODUCT_DISCOUNT" | "MULTIBUY_PRICE";
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  tags: string[];
  isActive: boolean;

  kind: "RECURRING_WEEKDAY" | "ONE_DAY" | "DATE_RANGE";
  weekday?: Weekday | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  locations: ("RECKE" | "METTINGEN")[];
  priority: number;
  minBasketCents?: number | null;

  priceCents?: number | null;
  originalPriceCents?: number | null;
  unit?: string | null;

  generic?: {
    body?: string | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
  };
  productNew?: { product: ProductLite; highlightLabel?: string | null };
  productDiscount?: {
    product: ProductLite;
    priceCents: number;
    originalPriceCents?: number | null;
    unit?: string | null;
  };
  multibuyPrice?: {
    product: ProductLite;
    packQty: number;
    packPriceCents: number;
    comparePackQty?: number | null;
    comparePriceCents?: number | null;
    unit?: string | null;
  };
};

type Context = "today" | "default";

const TIME_ZONE = "Europe/Berlin";

function dateBadge(o: OfferDTO) {
  const dd = (iso?: string | null) =>
    iso
      ? new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: TIME_ZONE,
        }).format(new Date(iso))
      : "";

  const dm = (iso?: string | null) =>
    iso
      ? new Intl.DateTimeFormat("de-DE", {
          day: "2-digit",
          month: "2-digit",
          timeZone: TIME_ZONE,
        }).format(new Date(iso))
      : "";

  const weekdayMap: Record<NonNullable<OfferDTO["weekday"]>, string> = {
    MONDAY: "Montag",
    TUESDAY: "Dienstag",
    WEDNESDAY: "Mittwoch",
    THURSDAY: "Donnerstag",
    FRIDAY: "Freitag",
    SATURDAY: "Samstag",
    SUNDAY: "Sonntag",
  };

  if (o.kind === "ONE_DAY") return `Nur am ${dm(o.date)}`;
  if (o.kind === "RECURRING_WEEKDAY" && o.weekday)
    return `Jeden ${weekdayMap[o.weekday]}`;
  return `Gültig ${dd(o.startDate)} - ${dd(o.endDate)}`;
}

export default function OfferRenderer({
  item,
  context = "default",
}: {
  item: OfferDTO;
  context?: Context;
}) {
  const imgSrc = publicAssetUrl(item.imageUrl || null);
  const hasImage = !!imgSrc;
  const hasBasePrice =
    typeof item.priceCents === "number" && item.priceCents > 0;

  return (
    <article className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/70 dark:ring-white/10">
      {/* Bild nur, wenn vorhanden */}
      {hasImage && (
        <div className="relative aspect-[5/3] w-full overflow-hidden">
          <Image
            src={imgSrc!}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Filiale-Badge */}
        {item.locations?.length > 0 && (
          <div className="mb-1.5">
            <span
              className="
                inline-flex items-center gap-1.5 rounded-full
                bg-emerald-600/10 px-3 py-0.5
                text-xs font-semibold uppercase tracking-wide text-emerald-800
                ring-1 ring-emerald-500/50
                dark:bg-emerald-900/40 dark:text-emerald-50 dark:ring-emerald-700/80
              "
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full bg-emerald-500"
              />
              Filiale:{" "}
              {item.locations
                .map((l) => (l === "RECKE" ? "Recke" : "Mettingen"))
                .join(" · ")}
            </span>
          </div>
        )}

        {/* Datum + Mindest-Einkauf */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] ring-1 ring-amber-500/20">
            {dateBadge(item)}
          </span>

          {typeof item.minBasketCents === "number" &&
            item.minBasketCents > 0 && (
              <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-[10px] ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
                ab{" "}
                {(item.minBasketCents / 100)
                  .toFixed(2)
                  .replace(".", ",")}{" "}
                € Einkaufswert
              </span>
            )}
        </div>

        {/* Titel + Preisblock */}
        <div className="mt-2 flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-snug sm:text-base">
            {item.title}
          </h4>

          <div className="max-w-[7.5rem] shrink-0 text-right sm:max-w-[9rem]">
            {item.type === "PRODUCT_DISCOUNT" && item.productDiscount && (
              <>
                {typeof item.productDiscount.originalPriceCents === "number" &&
                  item.productDiscount.originalPriceCents > 0 && (
                    <div className="text-[11px] line-through text-zinc-500 tabular-nums">
                      {euro(item.productDiscount.originalPriceCents)}
                      {item.productDiscount.unit
                        ? ` / ${item.productDiscount.unit}`
                        : ""}
                    </div>
                  )}
                <div className="text-sm font-bold tabular-nums sm:text-base">
                  {euro(item.productDiscount.priceCents)}
                  {item.productDiscount.unit
                    ? ` / ${item.productDiscount.unit}`
                    : ""}
                </div>
              </>
            )}

            {item.type === "MULTIBUY_PRICE" && item.multibuyPrice && (
              <div className="text-sm font-bold leading-snug tabular-nums sm:text-base">
                {item.multibuyPrice.packQty} Stk ·{" "}
                {euro(item.multibuyPrice.packPriceCents)}
                {item.multibuyPrice.unit
                  ? ` / ${item.multibuyPrice.unit}`
                  : ""}
              </div>
            )}

            {item.type !== "PRODUCT_DISCOUNT" &&
              item.type !== "MULTIBUY_PRICE" &&
              hasBasePrice && (
                <>
                  {typeof item.originalPriceCents === "number" &&
                    item.originalPriceCents > 0 && (
                      <div className="text-[11px] line-through text-zinc-500 tabular-nums">
                        {euro(item.originalPriceCents)}
                        {item.unit ? ` / ${item.unit}` : ""}
                      </div>
                    )}
                  <div className="text-sm font-bold tabular-nums sm:text-base">
                    {euro(item.priceCents!)}
                    {item.unit ? ` / ${item.unit}` : ""}
                  </div>
                </>
              )}
          </div>
        </div>

        {/* Untertitel */}
        {item.subtitle && (
          <p className="mt-1 text-xs text-zinc-700 opacity-90 dark:text-zinc-200 sm:text-sm">
            {item.subtitle}
          </p>
        )}

        {/* Typ-spezifische Inhalte */}
        {item.type === "GENERIC" && item.generic && (
          <div className="mt-2 text-xs sm:text-sm">
            {item.generic.body}
            {item.generic.ctaLabel && item.generic.ctaHref && (
              <div className="mt-2">
                <a
                  href={item.generic.ctaHref}
                  className="inline-block rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 sm:text-sm"
                >
                  {item.generic.ctaLabel}
                </a>
              </div>
            )}
          </div>
        )}

        {item.type === "PRODUCT_NEW" && item.productNew && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-emerald-500/20">
              {item.productNew.highlightLabel || "NEU"}
            </span>
            <span className="truncate">
              {item.productNew.product.name} ·{" "}
              {euro(item.productNew.product.priceCents)} /{" "}
              {item.productNew.product.unit}
            </span>
          </div>
        )}

        {item.type === "PRODUCT_DISCOUNT" && item.productDiscount && (
          <div className="mt-1 text-xs text-zinc-800 dark:text-zinc-100 sm:text-sm">
            {item.productDiscount.product.name}
          </div>
        )}

        {item.type === "MULTIBUY_PRICE" && item.multibuyPrice && (
          <div className="mt-1 text-xs text-zinc-800 dark:text-zinc-100 sm:text-sm">
            {item.multibuyPrice.product.name}
            {typeof item.multibuyPrice.comparePackQty === "number" &&
              typeof item.multibuyPrice.comparePriceCents === "number" && (
                <div className="text-[11px] text-zinc-500">
                  statt {item.multibuyPrice.comparePackQty} für{" "}
                  {euro(item.multibuyPrice.comparePriceCents)}
                </div>
              )}
          </div>
        )}

        {/* Tags */}
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="rounded-full bg-black/5 px-2 py-0.5 text-[9px] uppercase tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
