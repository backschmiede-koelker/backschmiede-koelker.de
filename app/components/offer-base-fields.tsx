// app/components/offer-base-fields.tsx
"use client";

import FieldLabel from "@/app/components/ui/field-label";
import ImageUploader from "@/app/components/image-uploader";

export default function OfferBaseFields({
  title,
  setTitle,
  description,
  setDescription,
  imageUrl,
  setImageUrl,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="min-w-0">
          <FieldLabel hint="Kurzer, knackiger Titel - damit Kund:innen sofort verstehen, worum es geht.">
            Titel
          </FieldLabel>
          <input
            className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='z. B. "5 Weizen 1,80 €"'
          />
        </div>
        <div className="min-w-0">
          <FieldLabel hint="Hier kannst du ein paar Worte ergänzen: Was ist besonders? Für wen? Wie lange?">
            Beschreibung (optional)
          </FieldLabel>
          <textarea
            rows={5}
            className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='z. B. "Diese Woche im Angebot"'
          />
        </div>
      </div>

      <div className="min-w-0">
        <FieldLabel hint="Ein Bild macht das Angebot deutlich ansprechender. Zieh eine Datei rein oder klicke auf „Datei wählen“.">
          Bild (optional)
        </FieldLabel>
        <div className="mt-1">
          <ImageUploader folder="offers" imageUrl={imageUrl} onChange={setImageUrl} />
        </div>
      </div>
    </div>
  );
}
