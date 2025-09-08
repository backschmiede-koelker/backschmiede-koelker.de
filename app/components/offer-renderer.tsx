// app/components/offer-renderer.tsx
"use client";

import React from "react";
import { euro } from "../lib/format";

type ProductLite = { id: string; name: string; priceCents: number; unit: string };
type Weekday = "MONDAY"|"TUESDAY"|"WEDNESDAY"|"THURSDAY"|"FRIDAY"|"SATURDAY"|"SUNDAY";

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
  locations: ("RECKE"|"METTINGEN")[];
  priority: number;
  minBasketCents?: number | null;

  generic?: { body?: string | null; ctaLabel?: string | null; ctaHref?: string | null };
  productNew?: { product: ProductLite; highlightLabel?: string | null };
  productDiscount?: { product: ProductLite; priceCents: number; originalPriceCents?: number | null; unit?: string | null };
  multibuyPrice?: { product: ProductLite; packQty: number; packPriceCents: number; comparePackQty?: number | null; comparePriceCents?: number | null; unit?: string | null };
};

function dateBadge(o: OfferDTO) {
  const dd = (iso?: string | null) => (iso ? new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso)) : "");
  const dm = (iso?: string | null) => (iso ? new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(new Date(iso)) : "");
  const weekdayMap: Record<NonNullable<OfferDTO["weekday"]>, string> = {
    MONDAY: "Montag", TUESDAY: "Dienstag", WEDNESDAY: "Mittwoch",
    THURSDAY: "Donnerstag", FRIDAY: "Freitag", SATURDAY: "Samstag", SUNDAY: "Sonntag",
  };
  if (o.kind === "ONE_DAY") return `Nur am ${dm(o.date)}`;
  if (o.kind === "RECURRING_WEEKDAY" && o.weekday) return `Jeden ${weekdayMap[o.weekday]}`;
  return `Gültig ${dd(o.startDate)} - ${dd(o.endDate)}`;
}

export default function OfferRenderer({ item }: { item: OfferDTO }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white/90 dark:bg-zinc-900/70 ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
      {item.imageUrl && (
        <div className="aspect-[5/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] ring-1 ring-amber-500/20">{dateBadge(item)}</span>
          {typeof item.minBasketCents === "number" && item.minBasketCents > 0 && (
            <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-[10px] ring-1 ring-black/10">
              ab {(item.minBasketCents / 100).toFixed(2).replace(".", ",")} € Einkaufswert
            </span>
          )}
          {item.locations?.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-[10px] ring-1 ring-black/10">
              {item.locations.map(l => l === "RECKE" ? "Recke" : "Mettingen").join(" · ")}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <h4 className="text-lg font-semibold leading-tight">{item.title}</h4>

          {/* Preis-Ecke – je Typ unterschiedlich */}
          <div className="shrink-0 text-right">
            {item.type === "PRODUCT_DISCOUNT" && item.productDiscount && (
              <>
                {typeof item.productDiscount.originalPriceCents === "number" && item.productDiscount.originalPriceCents > 0 && (
                  <div className="text-xs line-through text-zinc-500 tabular-nums">
                    {euro(item.productDiscount.originalPriceCents)}{item.productDiscount.unit ? ` / ${item.productDiscount.unit}` : ""}
                  </div>
                )}
                <div className="text-base font-bold tabular-nums">
                  {euro(item.productDiscount.priceCents)}{item.productDiscount.unit ? ` / ${item.productDiscount.unit}` : ""}
                </div>
              </>
            )}
            {item.type === "MULTIBUY_PRICE" && item.multibuyPrice && (
              <div className="text-base font-bold tabular-nums">
                {item.multibuyPrice.packQty} Stk · {euro(item.multibuyPrice.packPriceCents)}{item.multibuyPrice.unit ? ` / ${item.multibuyPrice.unit}` : ""}
              </div>
            )}
          </div>
        </div>

        {item.subtitle && <p className="mt-1 text-sm opacity-90">{item.subtitle}</p>}

        {/* Typ-spezifische Inhalte */}
        {item.type === "GENERIC" && item.generic && (
          <div className="mt-2 text-sm">
            {item.generic.body}
            {item.generic.ctaLabel && item.generic.ctaHref && (
              <div className="mt-2">
                <a href={item.generic.ctaHref} className="inline-block rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
                  {item.generic.ctaLabel}
                </a>
              </div>
            )}
          </div>
        )}

        {item.type === "PRODUCT_NEW" && item.productNew && (
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 ring-1 ring-emerald-500/20">{item.productNew.highlightLabel || "NEU"}</span>
            <span>{item.productNew.product.name} · {euro(item.productNew.product.priceCents)} / {item.productNew.product.unit}</span>
          </div>
        )}

        {item.type === "PRODUCT_DISCOUNT" && item.productDiscount && (
          <div className="mt-1 text-sm">
            {item.productDiscount.product.name}
          </div>
        )}

        {item.type === "MULTIBUY_PRICE" && item.multibuyPrice && (
          <div className="mt-1 text-sm">
            {item.multibuyPrice.product.name}
            {typeof item.multibuyPrice.comparePackQty === "number" && typeof item.multibuyPrice.comparePriceCents === "number" && (
              <div className="text-xs text-zinc-500">
                statt {item.multibuyPrice.comparePackQty} für {euro(item.multibuyPrice.comparePriceCents)}
              </div>
            )}
          </div>
        )}

        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 6).map(t => (
              <span key={t} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
