// app/about/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicAssetUrl } from "@/app/lib/uploads";

export const metadata: Metadata = {
  title: "Über uns | Backschmiede Kölker",
  description:
    "Lerne die Backschmiede Kölker kennen: Menschen, Handwerk, Philosophie und Team in Recke & Mettingen.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Über uns | Backschmiede Kölker",
    description:
      "Lerne die Backschmiede Kölker kennen: Menschen, Handwerk, Philosophie und Team in Recke & Mettingen.",
    url: "/about",
    type: "website",
  },
};

async function getAbout() {
  const [sections, persons] = await Promise.all([
    prisma.aboutSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        stats: { orderBy: { sortOrder: "asc" } },
        values: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
        gallery: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.aboutPerson.findMany({
      where: { isShownOnAbout: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return { sections, persons };
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={[
        "rounded-3xl bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-6 md:p-8",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function Heading({ title, subtitle, eyebrow }: { title?: string | null; subtitle?: string | null; eyebrow?: string | null }) {
  return (
    <header className="mb-4 md:mb-5">
      {eyebrow && (
        <span className="mb-2 inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-1 text-[11px] font-medium">
          {eyebrow}
        </span>
      )}
      {title && <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>}
      {subtitle && (
        <p className="mt-1 text-sm md:text-base text-zinc-700 dark:text-zinc-300 max-w-prose">
          {subtitle}
        </p>
      )}
    </header>
  );
}

export default async function AboutPage() {
  const { sections, persons } = await getAbout();

  const owner =
    persons.find((p) => p.isShownInHero && p.kind === "OWNER") ??
    persons.find((p) => p.kind === "OWNER") ??
    null;

  const team = persons.filter((p) => p.kind !== "OWNER");

  return (
    <div className="space-y-12 md:space-y-16">
      {sections.map((s) => {
        switch (s.type) {
          case "HERO": {
            if (!owner) return null;
            const heroImg = publicAssetUrl(s.imageUrl ?? owner.avatarUrl) ?? "/mettingen-und-recke.png";
            return (
              <section
                key={s.id}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-zinc-900 shadow"
              >
                <div className="grid gap-6 md:grid-cols-2 p-5 md:p-10">
                  <div className="flex flex-col justify-center">
                    <Heading
                      eyebrow={s.subtitle ?? owner.roleLabel ?? "Über uns"}
                      title={s.title ?? owner.name}
                      subtitle={s.body ?? owner.shortBio ?? null}
                    />
                    <div className="mt-4 flex flex-wrap gap-2.5 text-sm">
                      {owner.email && (
                        <a
                          href={`mailto:${owner.email}`}
                          className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 hover:border-emerald-400 hover:text-emerald-700 transition"
                        >
                          Kontakt
                        </a>
                      )}
                      {owner.phone && (
                        <a
                          href={`tel:${owner.phone}`}
                          className="inline-flex items-center rounded-full bg-emerald-600 text-white px-3.5 py-1.5 text-sm font-medium shadow hover:bg-emerald-700 transition"
                        >
                          Anrufen
                        </a>
                      )}
                      {owner.instagramHandle && (
                        <a
                          href={`https://instagram.com/${owner.instagramHandle.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <img
                      src={heroImg}
                      alt={owner.name}
                      className="h-full w-full max-h-[360px] md:max-h-none object-cover rounded-2xl shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700"
                    />
                  </div>
                </div>
              </section>
            );
          }

          case "STATS": {
            if (!s.stats.length) return null;
            return (
              <Card key={s.id}>
                <Heading title={s.title ?? "In Zahlen"} subtitle={s.subtitle} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {s.stats.map((it) => (
                    <div key={it.id} className="text-center">
                      <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-600">
                        {it.value}
                      </div>
                      <div className="mt-1 text-xs md:text-sm opacity-80">{it.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          }

          case "STORY":
          case "CUSTOM_TEXT": {
            return (
              <Card key={s.id}>
                <Heading title={s.title} subtitle={s.subtitle} />
                {s.body && (
                  <div className="prose prose-sm md:prose-base prose-zinc dark:prose-invert max-w-none">
                    {s.body.split(/\n{2,}/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
              </Card>
            );
          }

          case "VALUES": {
            if (!s.values.length) return null;
            return (
              <Card key={s.id}>
                <Heading title={s.title ?? "Unsere Werte"} subtitle={s.subtitle} />
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {s.values.map((v) => (
                    <div key={v.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="font-medium">{v.title}</div>
                      {v.description && <p className="mt-1 text-sm opacity-90">{v.description}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            );
          }

          case "TIMELINE": {
            if (!s.timeline.length) return null;
            return (
              <Card key={s.id}>
                <Heading title={s.title ?? "Meilensteine"} subtitle={s.subtitle} />
                <ol className="mt-4 grid gap-4 md:grid-cols-4">
                  {s.timeline.map((t) => (
                    <li key={t.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">{t.year}</div>
                      <div className="mt-1 font-semibold">{t.title}</div>
                      {t.description && <p className="mt-1 text-sm opacity-90">{t.description}</p>}
                    </li>
                  ))}
                </ol>
              </Card>
            );
          }

          case "TEAM": {
            if (!team.length) return null;
            return (
              <Card key={s.id}>
                <Heading
                  title={s.title ?? "Team"}
                  subtitle={s.subtitle ?? "Menschen, die jeden Morgen Teige kneten, Brote backen und Gäste beraten."}
                />
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {team.map((m) => {
                    const avatar = publicAssetUrl(m.avatarUrl) ?? "/mettingen-und-recke.png";
                    return (
                      <article key={m.id} className="flex gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3.5">
                        <img
                          src={avatar}
                          alt={m.name}
                          className="h-16 w-16 flex-none rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold leading-tight">{m.name}</h3>
                          {m.roleLabel && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">{m.roleLabel}</p>
                          )}
                          {m.shortBio && (
                            <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300 line-clamp-3">{m.shortBio}</p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </Card>
            );
          }

          case "GALLERY": {
            if (!s.gallery.length) return null;
            return (
              <section key={s.id}>
                <Heading title={s.title ?? "Einblicke"} subtitle={s.subtitle} />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {s.gallery.map((g) => {
                    const src = publicAssetUrl(g.imageUrl) ?? "/mettingen-und-recke.png";
                    return (
                      <figure
                        key={g.id}
                        className="group relative overflow-hidden rounded-2xl shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-900"
                      >
                        <img
                          src={src}
                          alt={g.alt || ""}
                          className="h-40 sm:h-48 md:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {g.alt && (
                          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6 text-[11px] text-white">
                            {g.alt}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </section>
            );
          }

          case "FAQ": {
            if (!s.faqs.length) return null;
            return (
              <Card key={s.id}>
                <Heading title={s.title ?? "Fragen & Antworten"} subtitle={s.subtitle} />
                <div className="mt-4 space-y-3">
                  {s.faqs.map((f) => (
                    <details key={f.id} className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                        <span>{f.question}</span>
                        <span className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">
                          +
                        </span>
                      </summary>
                      <p className="mt-2 text-sm opacity-90">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </Card>
            );
          }

          case "CTA": {
            const href = s.body?.trim() || "/kontakt";
            const label = s.subtitle?.trim() || "Kontakt aufnehmen";
            return (
              <section
                key={s.id}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-950 dark:to-emerald-900 text-white p-5 md:p-10 shadow"
              >
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">{s.title ?? "Lust auf gutes Brot?"}</h2>
                <a
                  href={href}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-emerald-700 px-4 md:px-5 py-2.5 text-sm font-medium shadow hover:bg-emerald-50 transition"
                >
                  {label}
                </a>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
