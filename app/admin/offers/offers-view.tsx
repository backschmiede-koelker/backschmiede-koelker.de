"use client";

import SectionCard from "app/components/ui/section-card";
import FieldLabel from "app/components/ui/field-label";
import OfferTypeSelector from "app/admin/offers/components/offer-type-selector";
import ScheduleSelector from "app/admin/offers/components/schedule-selector";
import LocationPriorityRow from "app/admin/offers/components/location-priority-row";
import MinSpendField from "app/admin/offers/components/min-spend-field";
import ActionsBar from "app/admin/offers/components/actions-bar";
import ProductDiscountForm from "app/admin/offers/components/product-discount-form";

import OfferBaseFields from "@/app/components/offer-base-fields";
import MultiBuyForm from "@/app/components/multibuy-form";
import ProductPicker from "@/app/components/product-picker";

import { OfferKind, Weekday, Location } from "@prisma/client";
import { euro } from "@/app/lib/format";

import { useOffers } from "./hooks/use-offers";
import { useOfferUnits } from "./hooks/use-offer-units";
import { useOfferForm } from "./hooks/use-offer-form";
import OfferList from "./components/offer-list";

export default function AdminOffersView() {
  const { items, loading, reload } = useOffers();
  const allUnits = useOfferUnits();

  const form = useOfferForm({ allUnits, onCreated: reload });

  return (
    <main className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-8 py-6 lg:py-10 min-w-0">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Angebote</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Wähle unten einen <b>Typ</b> und fülle nur die wenigen Felder aus. Fertig.
        </p>
      </header>

      <SectionCard className="relative z-30 overflow-visible">
        {/* Typ-Auswahl */}
        <OfferTypeSelector type={form.type} onChange={form.setType} />

        {/* Basisfelder */}
        <div className="mt-4">
          <OfferBaseFields
            title={form.title}
            setTitle={form.setTitle}
            description={form.description}
            setDescription={form.setDescription}
            imageUrl={form.imageUrl}
            setImageUrl={form.setImageUrl}
          />
        </div>

        {/* Zeitraum / Wochentag */}
        <div className="mt-4">
          <ScheduleSelector
            kind={form.kind}
            onKindChange={form.setKind}
            date={form.date}
            onDateChange={form.setDate}
            startDate={form.startDate}
            onStartDateChange={form.setStartDate}
            endDate={form.endDate}
            onEndDateChange={form.setEndDate}
            weekday={form.weekday}
            onWeekdayChange={form.setWeekday}
          />
        </div>

        {/* Filialen + Priorität */}
        <LocationPriorityRow
          locations={form.locations}
          onToggleLocation={(l) => {
            const includes = form.locations.includes(l);
            form.setLocations(includes ? form.locations.filter((x) => x !== l) : [...form.locations, l]);
          }}
          priority={form.priority}
          onPriorityChange={(v) => form.setPriority(v)}
        />

        {/* Ab Einkaufswert */}
        <MinSpendField value={form.minSpend} onChange={form.setMinSpend} />

        {/* TYP-SPEZIFISCHE FELDER */}
        <div className="mt-6 grid gap-4">
          {form.type === "GENERIC" && (
            <SectionCard muted>
              <div className="font-medium">Allgemein</div>
              <p className="mt-1 text-sm text-zinc-600">
                Für Hinweise, Aktionen oder Platzhalter ohne Produktbezug. Bild + Titel + Beschreibung werden verwendet.
              </p>
            </SectionCard>
          )}

          {form.type === "PRODUCT_NEW" && (
            <SectionCard>
              <div className="grid gap-3">
                <div>
                  <ProductPicker
                    value={form.pNew.product}
                    onChange={(p) => form.setPNew((s) => ({ ...s, product: p }))}
                  />
                </div>
                <div>
                  <FieldLabel>Label</FieldLabel>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                    value={form.pNew.label}
                    onChange={(e) => form.setPNew((s) => ({ ...s, label: e.target.value }))}
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {form.type === "PRODUCT_DISCOUNT" && (
            <ProductDiscountForm
              value={form.pDisc}
              onChange={form.setPDisc}
              allUnits={allUnits}
              preview={form.discPreview ? { old: form.discPreview.origCents, now: form.discPreview.newCents } : null}
            />
          )}

          {form.type === "MULTIBUY_PRICE" && (
            <MultiBuyForm value={form.pMulti} onChange={form.setPMulti} allUnits={allUnits} preview={form.multiPreview} />
          )}
        </div>

        {/* Aktionen */}
        <ActionsBar
          isActive={form.isActive}
          onToggleActive={() => form.setIsActive((a) => !a)}
          creating={form.creating}
          onCreate={form.create}
        />
      </SectionCard>

      <div className="h-16 lg:h-24" />

      <OfferList items={items} loading={loading} onReload={reload} />
    </main>
  );
}
