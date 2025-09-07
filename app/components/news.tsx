// /app/components/news.tsx
import Image from "next/image";
import Link from "next/link";

type ApiNews = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  tag?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  publishedAt: string; // ISO
};

function formatDateISO(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function TagBadge({ tag }: { tag?: string | null }) {
  if (!tag) return null;

  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset";

  let styles =
    "bg-slate-500/20 dark:bg-slate-300/20 text-slate-900 dark:text-slate-100 ring-slate-600/35 dark:ring-slate-400/35";

  const t = tag.trim().toLowerCase();
  if (t === "jobs") {
    styles =
      "bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-amber-600/30";
  } else if (t === "aktion") {
    styles =
      "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 ring-emerald-600/30";
  } else if (t === "event") {
    styles =
      "bg-teal-500/20 text-teal-900 dark:text-teal-200 ring-teal-600/30";
  } else if (t === "info") {
    styles =
      "bg-sky-500/20 text-sky-900 dark:text-sky-200 ring-sky-600/30";
  }

  return <span className={`${base} ${styles}`}>{tag}</span>;
}

// Server Component – lädt Top-4 aktive News
export default async function News() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/news?active=1&limit=4`,
    { cache: "no-store" }
  );
  const items: ApiNews[] = res.ok ? await res.json() : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((n) => (
        <article
          key={n.id}
          className="overflow-hidden rounded-2xl border border-emerald-800/10 bg-white/80 shadow-sm backdrop-blur dark:border-emerald-300/15 dark:bg-white/5"
        >
          {n.imageUrl && (
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={n.imageUrl}
                alt={n.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <TagBadge tag={n.tag} />
              <time className="text-xs text-zinc-600 dark:text-zinc-400">
                {formatDateISO(n.publishedAt)}
              </time>
            </div>

            <h3 className="mt-2 text-lg font-semibold leading-tight">
              {n.title}
            </h3>
            {/* Zeilenumbrüche aus dem Text übernehmen */}
            <p className="mt-2 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">
              {n.body}
            </p>

            {n.ctaHref && n.ctaLabel && (
              <div className="mt-3">
                <Link
                  href={n.ctaHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/10 dark:border-emerald-300/15 bg-white/80 px-3 py-2 text-sm shadow-sm
                             hover:bg-emerald-50 dark:bg-white/10 dark:hover:bg-emerald-900/30
                             transition active:scale-[0.98] active:shadow-none
                             active:bg-emerald-100/70 dark:active:bg-emerald-900/50
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                  {n.ctaLabel}
                </Link>
              </div>
            )}
          </div>
        </article>
      ))}

      {!items.length && (
        <div className="rounded-xl border border-zinc-200/60 p-4 text-sm text-zinc-600 dark:border-zinc-800/60 dark:text-zinc-300">
          Momentan keine Neuigkeiten.
        </div>
      )}
    </div>
  );
}
