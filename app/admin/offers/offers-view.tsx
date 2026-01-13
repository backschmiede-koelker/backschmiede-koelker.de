// app/admin/offers/offers-view.tsx
"use client";

import SectionCard from "@/app/components/ui/section-card";
import FieldLabel from "@/app/components/ui/field-label";
import OfferTypeSelector from "@/app/admin/offers/components/offer-type-selector";
import ScheduleSelector from "@/app/admin/offers/components/schedule-selector";
import LocationPriorityRow from "@/app/admin/offers/components/location-priority-row";
import MinSpendField from "@/app/admin/offers/components/min-spend-field";
import ActionsBar from "@/app/admin/offers/components/actions-bar";
import ProductDiscountForm from "@/app/admin/offers/components/product-discount-form";

import OfferBaseFields from "@/app/components/offer-base-fields";
import MultiBuyForm from "@/app/components/multibuy-form";
import ProductPicker from "@/app/components/product-picker";

import { OfferType, Location } from "@/app/types/offers";

import { useOffers } from "./hooks/use-offers";
import { useOfferUnits } from "./hooks/use-offer-units";
import { useOfferForm } from "./hooks/use-offer-form";
import OfferList from "./components/offer-list";
import AdminPageHeader from "../components/admin-page-header";
import TgtgAdminPanel from "./components/tgtg-admin-panel";

export default function AdminOffersView() {
  const { items, loading, reload } = useOffers();
  const allUnits = useOfferUnits();

  const form = useOfferForm({ allUnits, onCreated: reload });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-clip">
      <AdminPageHeader
        title="Angebote"
        subtitle="Wähle unten einen Typ und fülle nur die wenigen Felder aus. Fertig."
      /> 

      <TgtgAdminPanel />
          
      <SectionCard className="relative z-30 overflow-visible">
        {/* Typ-Auswahl */}
        <OfferTypeSelector
          type={form.type}
          onChange={(t: OfferType) => form.setType(t)}
        />

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
          onToggleLocation={(l: Location) => {
            const includes = form.locations.includes(l);
            form.setLocations(
              includes
                ? form.locations.filter((x) => x !== l)
                : [...form.locations, l],
            );
          }}
          priority={form.priority}
          onPriorityChange={(v) => form.setPriority(v)}
        />

        {/* Ab Einkaufswert */}
        <MinSpendField value={form.minSpend} onChange={form.setMinSpend} />

        {/* TYP-SPEZIFISCHE FELDER */}
        <div className="mt-6 grid gap-4">
          {form.type === OfferType.GENERIC && (
            <SectionCard muted>
              <div className="font-medium">Allgemein</div>
              <p className="mt-1 text-sm text-zinc-600">
                Für Hinweise, Aktionen oder Platzhalter ohne Produktbezug. Bild + Titel + Beschreibung werden verwendet.
              </p>
            </SectionCard>
          )}

          {form.type === OfferType.PRODUCT_NEW && (
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
                    onChange={(e) =>
                      form.setPNew((s) => ({ ...s, label: e.target.value }))
                    }
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {form.type === OfferType.PRODUCT_DISCOUNT && (
            <ProductDiscountForm
              value={form.pDisc}
              onChange={form.setPDisc}
              allUnits={allUnits}
              preview={
                form.discPreview
                  ? {
                      old: form.discPreview.origCents,
                      now: form.discPreview.newCents,
                    }
                  : null
              }
            />
          )}

          {form.type === OfferType.MULTIBUY_PRICE && (
            <MultiBuyForm
              value={form.pMulti}
              onChange={form.setPMulti}
              allUnits={allUnits}
              preview={form.multiPreview}
            />
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
