// /app/components/news.tsx
import Image from "next/image";
import Link from "next/link";

type NewsItem = {
  id: string;
  date: string; // ISO oder YYYY-MM-DD
  title: string;
  body: string;
  image?: string; // public/… Pfad
  tag?: string;
  cta?: { label: string; href: string };
};

const DEFAULT_ITEMS: NewsItem[] = [
  {
    id: "jobs-baeckerei",
    date: "2025-09-01",
    title: "Wir suchen Verstärkung in der Backstube (m/w/d)",
    body:
      "Du liebst gutes Brot und möchtest mit ehrlichen Zutaten arbeiten? Wir suchen motivierte Menschen in Voll- oder Teilzeit. Alle Details findest du auf unserer Jobs-Seite.",
    tag: "Jobs",
    cta: { label: "Zu den Jobs", href: "/jobs" },
    image: "/Cafe.jpg",
  },
  {
    id: "kuerbisbrot-zurueck",
    date: "2025-09-05",
    title: "Saisonal zurück: Unser Kürbisbrot",
    body:
      "Fein-nussig und saftig - ab sofort wieder jeden Freitag & Samstag frisch aus dem Ofen. Solange der Vorrat reicht!",
    tag: "Aktion",
    image: "/Logo3-2.png",
  },
  {
    id: "recke-zeiten",
    date: "2025-08-20",
    title: "Neue Öffnungszeiten in Recke",
    body:
      "Wir haben die Zeiten leicht angepasst. Schau gerne unten bei den Öffnungszeiten vorbei – dort sind alle Filialen aktuell aufgeführt.",
    tag: "Info",
  },
];

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return d;
  }
}

function TagBadge({ tag }: { tag?: NewsItem["tag"] }) {
  if (!tag) return null;

  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset";

  const styles =
    tag === "Jobs"
      ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-amber-600/30"
      : tag === "Aktion"
      ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 ring-emerald-600/30"
      : tag === "Event"
      ? "bg-teal-500/20 text-teal-900 dark:text-teal-200 ring-teal-600/30"
      : tag === "Info"
      ? "bg-sky-500/20 text-sky-900 dark:text-sky-200 ring-sky-600/30"
      : "bg-slate-500/20 dark:bg-slate-300/20 text-slate-900 dark:text-slate-100 ring-slate-600/35 dark:ring-slate-400/35";

  return <span className={`${base} ${styles}`}>{tag}</span>;
}

export default function News({ items }: { items?: NewsItem[] }) {
  const data = items?.length ? items : DEFAULT_ITEMS;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.map((n) => (
        <article
          key={n.id}
          className="overflow-hidden rounded-2xl border border-emerald-800/10 bg-white/80 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/5"
        >
          {/* Bild */}
          {n.image && (
            <div className="relative aspect-[16/9] w-full">
              <Image src={n.image} alt={n.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <TagBadge tag={n.tag} />
              <time className="text-xs text-zinc-600 dark:text-zinc-400">{formatDate(n.date)}</time>
            </div>

            <h3 className="mt-2 text-lg font-semibold leading-tight">{n.title}</h3>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{n.body}</p>

            {n.cta && (
              <div className="mt-3">
                <Link
                href={n.cta.href}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/10 dark:border-emerald-300/15 bg-white/80 px-3 py-2 text-sm shadow-sm
                            hover:bg-emerald-50 dark:bg-white/10 dark:hover:bg-emerald-900/30
                            transition active:scale-[0.98] active:shadow-none
                            active:bg-emerald-100/70 dark:active:bg-emerald-900/50
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                {n.cta.label}
                </Link>
              </div>
            )}
          </div>
        </article>
      ))}

      {!data.length && (
        <div className="rounded-xl border border-zinc-200/60 p-4 text-sm text-zinc-600 dark:border-zinc-800/60 dark:text-zinc-300">
          Momentan keine Neuigkeiten.
        </div>
      )}
    </div>
  );
}
