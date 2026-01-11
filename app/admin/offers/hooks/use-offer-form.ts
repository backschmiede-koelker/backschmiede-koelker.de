// app/admin/offers/hooks/use-offer-form.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { PRICE_RE, parseEuroToCents } from "@/app/lib/format";
import { OfferKind, Weekday, Location, OfferType } from "../../../types/offers";

export type ProductLite = { id: string; name: string; priceCents: number; unit: string };

type OfferBasePayload = {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  tags: string[];
  isActive: boolean;
  kind: OfferKind;
  locations: Location[];
  priority: number;
  minBasketCents: number | null;
  weekday?: Weekday;
  date?: string;
  startDate?: string;
  endDate?: string;
};

type EmptyPayload = Record<string, never>;
type OfferPayload =
  | EmptyPayload
  | { body: string; ctaLabel: string | null; ctaHref: string | null }
  | { productId: string; highlightLabel: string }
  | { productId: string; priceCents: number; originalPriceCents: number | null; unit: string | null }
  | {
      productId: string;
      packQty: number;
      packPriceCents: number;
      comparePackQty: number | null;
      comparePriceCents: number | null;
      unit: string | null;
    };

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export function useOfferForm({ allUnits, onCreated }: { allUnits: string[]; onCreated?: () => void }) {
  const [creating, setCreating] = useState(false);

  const [type, setType] = useState<OfferType>(OfferType.GENERIC);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [kind, setKindState] = useState<OfferKind>(OfferKind.DATE_RANGE);
  const [weekday, setWeekday] = useState<Weekday>(Weekday.MONDAY);
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [locations, setLocations] = useState<Location[]>([Location.RECKE, Location.METTINGEN]);
  const [priority, setPriority] = useState<number>(0);
  const [minSpend, setMinSpend] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [pNew, setPNew] = useState<{ product: ProductLite | null; label: string }>({ product: null, label: "NEU" });
  const [pDisc, setPDisc] = useState<{ product: ProductLite | null; price: string; original: string; unit: string }>({
    product: null,
    price: "",
    original: "",
    unit: "",
  });
  const [pMulti, setPMulti] = useState<{ product: ProductLite | null; qty: string; price: string; compareQty: string; comparePrice: string; unit: string }>({
    product: null,
    qty: "",
    price: "",
    compareQty: "",
    comparePrice: "",
    unit: "",
  });

  // Default Zeitraum
  useEffect(() => {
    if (startDate || endDate) return;
    const now = new Date();
    const start = toYMD(now);
    const endD = new Date(now);
    endD.setDate(now.getDate() + 6);
    setStartDate(start);
    setEndDate(toYMD(endD));
  }, [startDate, endDate]);

  function setKind(k: OfferKind) {
    setKindState(k);
    if (k === OfferKind.ONE_DAY && !date) setDate(toYMD(new Date()));
    if (k === OfferKind.DATE_RANGE && !(startDate && endDate)) {
      const now = new Date();
      setStartDate((s) => s || toYMD(now));
      const e = new Date(now);
      e.setDate(now.getDate() + 6);
      setEndDate((en) => en || toYMD(e));
    }
  }

  // Standard-Einheit aus allUnits
  useEffect(() => {
    const def = allUnits.includes("pro Stück") ? "pro Stück" : allUnits[0] || "";
    if (!pDisc.unit) setPDisc((s) => ({ ...s, unit: def }));
    if (!pMulti.unit) setPMulti((s) => ({ ...s, unit: def }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUnits]);

  const validBase =
    title.trim() &&
    ((kind === "DATE_RANGE" && startDate && endDate) || (kind === "ONE_DAY" && date) || (kind === "RECURRING_WEEKDAY" && weekday));

  const discPreview = useMemo(() => {
    if (!pDisc.product || !PRICE_RE.test(pDisc.price)) return null;
    const newCents = parseEuroToCents(pDisc.price);
    const origCents = pDisc.original && PRICE_RE.test(pDisc.original) ? parseEuroToCents(pDisc.original) : null;
    return { newCents, origCents };
  }, [pDisc]);

  const multiPreview = useMemo(() => {
    const qtyNum = Number(pMulti.qty);
    const hasQty = Number.isFinite(qtyNum) && qtyNum > 0;
    if (!pMulti.product || !PRICE_RE.test(pMulti.price) || !hasQty) return null;
    const packCents = parseEuroToCents(pMulti.price);
    const cQty = pMulti.compareQty && Number.isFinite(Number(pMulti.compareQty)) ? Number(pMulti.compareQty) : null;
    const cPrice = pMulti.comparePrice && PRICE_RE.test(pMulti.comparePrice) ? parseEuroToCents(pMulti.comparePrice) : null;
    return { packCents, qtyNum, cQty, cPrice };
  }, [pMulti]);

  async function create() {
    if (!validBase) {
      alert("Bitte Titel und Zeitraum ausfüllen.");
      return;
    }
    setCreating(true);
    try {
      const base: OfferBasePayload = {
        title: title.trim(),
        subtitle: description.trim() || null,
        imageUrl: imageUrl || null,
        tags: [],
        isActive,
        kind,
        locations,
        priority: Number.isFinite(Number(priority)) ? Number(priority) : 0,
        minBasketCents: minSpend ? parseEuroToCents(minSpend) : null,
      };
      if (kind === "RECURRING_WEEKDAY") base.weekday = weekday;
      if (kind === "ONE_DAY") base.date = date;
      if (kind === "DATE_RANGE") {
        base.startDate = startDate;
        base.endDate = endDate;
      }

      let payload: OfferPayload = {};
      if (type === "GENERIC") payload = { body: description || "", ctaLabel: null, ctaHref: null };

      if (type === "PRODUCT_NEW") {
        if (!pNew.product) return alert("Bitte Produkt auswählen.");
        payload = { productId: pNew.product.id, highlightLabel: pNew.label || "NEU" };
      }

      if (type === "PRODUCT_DISCOUNT") {
        if (!pDisc.product) return alert("Bitte Produkt auswählen.");
        if (!PRICE_RE.test(pDisc.price)) return alert("Bitte gültigen Preis eingeben.");
        const finalUnit = (pDisc.unit || "").trim();
        payload = {
          productId: pDisc.product.id,
          priceCents: parseEuroToCents(pDisc.price),
          originalPriceCents: pDisc.original && PRICE_RE.test(pDisc.original) ? parseEuroToCents(pDisc.original) : null,
          unit: finalUnit || null,
        };
      }

      if (type === "MULTIBUY_PRICE") {
        if (!pMulti.product) return alert("Bitte Produkt auswählen.");
        const qty = Number(pMulti.qty);
        if (!Number.isFinite(qty) || qty <= 0) return alert("Bitte eine gültige Menge eingeben.");
        if (!PRICE_RE.test(pMulti.price)) return alert("Bitte gültigen Set-Preis eingeben.");
        const finalUnit = (pMulti.unit || "").trim();
        payload = {
          productId: pMulti.product.id,
          packQty: Math.max(1, qty),
          packPriceCents: parseEuroToCents(pMulti.price),
          comparePackQty: pMulti.compareQty && Number.isFinite(Number(pMulti.compareQty)) ? Number(pMulti.compareQty) : null,
          comparePriceCents: pMulti.comparePrice && PRICE_RE.test(pMulti.comparePrice) ? parseEuroToCents(pMulti.comparePrice) : null,
          unit: finalUnit || null,
        };
      }

      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, base, payload }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "Fehler beim Anlegen");
        return;
      }

      // Reset
      setTitle("");
      setDescription("");
      setImageUrl("");
      setKindState(OfferKind.DATE_RANGE);
      setWeekday(Weekday.MONDAY);
      setDate("");
      setStartDate("");
      setEndDate("");
      setLocations([Location.RECKE, Location.METTINGEN]);
      setPriority(0);
      setMinSpend("");
      setIsActive(true);
      setPNew({ product: null, label: "NEU" });
      setPDisc({ product: null, price: "", original: "", unit: "" });
      setPMulti({ product: null, qty: "", price: "", compareQty: "", comparePrice: "", unit: "" });

      onCreated?.();
    } finally {
      setCreating(false);
    }
  }

  return {
    // state
    type,
    title,
    description,
    imageUrl,
    kind,
    weekday,
    date,
    startDate,
    endDate,
    locations,
    priority,
    minSpend,
    isActive,
    pNew,
    pDisc,
    pMulti,
    // setters
    setType,
    setTitle,
    setDescription,
    setImageUrl,
    setKind,
    setWeekday,
    setDate,
    setStartDate,
    setEndDate,
    setLocations,
    setPriority,
    setMinSpend,
    setIsActive,
    setPNew,
    setPDisc,
    setPMulti,
    // helpers
    discPreview,
    multiPreview,
    validBase,
    // actions
    create,
    creating,
  } as const;
}
