// /app/components/events/faq.tsx
"use client";

export default function Faq() {
  const items = [
    { q: "Wie melde ich mich an?", a: "Über den Button „Jetzt anmelden“ in der jeweiligen Eventkarte – oder vor Ort." },
    { q: "Gibt es Wartelisten?", a: "Ja. Wenn ein Kurs ausgebucht ist, setzen wir dich auf die Warteliste und melden uns." },
    { q: "Kann ich stornieren?", a: "Bis 48h vorher kostenlos. Danach nach Rücksprache." },
    { q: "Barrierefreiheit?", a: "Unsere Filiale ist ebenerdig. Bitte melde besondere Bedürfnisse an." },
  ];

  return (
    <section className="rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900/60 p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Fragen & Antworten</h3>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {items.map((it, i) => (
          <li key={i} className="py-3">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{it.q}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{it.a}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
