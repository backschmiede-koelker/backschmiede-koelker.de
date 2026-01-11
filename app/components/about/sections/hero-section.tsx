// app/components/about/sections/hero-section.tsx
import type { AboutPersonDTO, AboutSectionDTO } from "@/app/about/types";
import { publicAssetUrl } from "@/app/lib/uploads";
import AboutSectionHeading from "../section-heading";

function pickHeroImage(section: AboutSectionDTO, persons: AboutPersonDTO[]) {
  const fromSection = section.imageUrl ? publicAssetUrl(section.imageUrl) : null;
  if (fromSection) return fromSection;

  const anyAvatar = persons.find((p) => !!p.avatarUrl)?.avatarUrl ?? null;
  const fromAvatar = anyAvatar ? publicAssetUrl(anyAvatar) : null;
  return fromAvatar ?? "/mettingen-und-recke.png";
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={[
        "inline-flex max-w-full items-center rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium whitespace-normal break-words",
        // WHITE: etwas dunkler + klarere Outline für Kontrast
        "bg-white/85 text-zinc-800 ring-1 ring-zinc-300/70 shadow-[0_1px_0_rgba(0,0,0,0.03)]",
        // DARK: wie gehabt
        "dark:bg-zinc-900/60 dark:text-zinc-200 dark:ring-zinc-800 dark:shadow-none",
        "backdrop-blur",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default function AboutHeroSection({
  section,
  persons,
}: {
  section: AboutSectionDTO;
  persons: AboutPersonDTO[];
}) {
  const img = pickHeroImage(section, persons);

  const eyebrow = (section.subtitle ?? "Über uns").trim() || "Über uns";
  const title = (section.title ?? "Backschmiede Kölker").trim() || "Backschmiede Kölker";
  const subtitle =
    (section.body ?? "").trim() ||
    "Handwerk, Teamgeist und gute Zutaten - jeden Tag frisch in Recke & Mettingen.";

  return (
    <section className="relative overflow-hidden rounded-3xl ring-1 ring-zinc-200/70 dark:ring-zinc-800 shadow-sm">
      {/* Background */}
      <div className="absolute inset-0">
        {/* WHITE: mehr Tiefe, weniger “flach weiß” */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-white to-zinc-50/60 dark:from-emerald-950/40 dark:via-zinc-950/20 dark:to-zinc-900" />

        {/* WHITE: kräftigere Premium-Blobs (DARK bleibt dezent) */}
        <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-emerald-200/70 blur-3xl dark:bg-emerald-500/15" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-amber-200/60 blur-3xl dark:bg-amber-500/10" />

        {/* WHITE: zarter “Paper Grain / Pattern” stärker sichtbar */}
        <div
          className="absolute inset-0 text-zinc-900 opacity-[0.08] dark:text-white dark:opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      <div className="relative p-4 sm:p-5 md:p-10">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            {/* Eyebrow pill: WHITE edler + schärfer */}
            <div
              className={[
                "mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                // WHITE
                "bg-white/85 text-emerald-900 ring-1 ring-emerald-200/70 shadow-sm",
                // DARK
                "dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800/50 dark:shadow-none",
                "backdrop-blur",
              ].join(" ")}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-300" />
              {eyebrow}
            </div>

            {/* Heading: WHITE bekommt mehr Kontrast über Wrapper */}
            <div className="rounded-3xl bg-white/55 dark:bg-transparent backdrop-blur-[2px] p-0">
              <AboutSectionHeading title={title} subtitle={subtitle} />
            </div>

            {/* Chips */}
            <div className="mt-4 flex flex-wrap gap-2 min-w-0">
              <Chip>Recke</Chip>
              <Chip>Mettingen</Chip>
              <Chip>Tradition & Handwerk</Chip>
              <Chip>Frisch gebacken</Chip>
            </div>
          </div>

          {/* Right (Image) */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Premium ambient accents (behind the card) */}
              <div className="pointer-events-none absolute -inset-10 rounded-[44px] dark:hidden">
                <div className="absolute -left-10 top-6 h-56 w-56 rounded-full bg-emerald-300/55 blur-3xl" />
                <div className="absolute -right-10 bottom-6 h-56 w-56 rounded-full bg-amber-300/45 blur-3xl" />
              </div>

              {/* DARK: controlled emerald glow */}
              <div className="pointer-events-none absolute -inset-8 hidden dark:block rounded-[40px] bg-emerald-500/18 blur-2xl" />
              <div className="pointer-events-none absolute -inset-14 hidden dark:block rounded-[48px] bg-emerald-400/10 blur-3xl" />

              {/* Accent frame (gradient border) */}
              <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-emerald-200/80 via-white/60 to-amber-200/70 dark:from-emerald-700/35 dark:via-zinc-900/30 dark:to-amber-700/25">
                <div
                  className={[
                    "relative overflow-hidden rounded-3xl",
                    "bg-white dark:bg-zinc-900",
                    "ring-1 ring-zinc-200/60 dark:ring-zinc-800/80",
                    // WHITE: depth shadow + subtle accent tint shadows
                    "shadow-[0_26px_70px_rgba(0,0,0,0.26),0_10px_24px_rgba(0,0,0,0.14),0_18px_70px_rgba(16,185,129,0.18),0_18px_70px_rgba(245,158,11,0.12)]",
                    // DARK: shadow tighter (glow handles the lift)
                    "dark:shadow-[0_18px_55px_rgba(0,0,0,0.55)]",
                  ].join(" ")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={title}
                    className="h-[280px] md:h-[460px] w-full object-cover"
                    loading="eager"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent dark:from-black/35 dark:via-black/10 dark:to-transparent" />

                  {/* Bottom label */}
                  <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-4 sm:bottom-4">
                    <div className="flex items-start gap-3 rounded-2xl backdrop-blur px-3 sm:px-4 py-2.5 sm:py-3 ring-1 ring-white/10 bg-zinc-950/70 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] dark:bg-zinc-900/60 dark:shadow-sm">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white whitespace-normal break-words">
                          Seit Generationen in der Region
                        </div>
                        <div className="text-[11px] text-white/80 whitespace-normal break-words">
                          Gute Zutaten · Zeit · Handwerk · Herz
                        </div>
                      </div>

                      <div className="ml-auto flex-none rounded-full bg-emerald-600 text-white text-[11px] font-semibold px-2.5 sm:px-3 py-1 shadow-sm">
                        Frisch
                      </div>
                    </div>
                  </div>

                  {/* Optional highlight line (now actually visible) */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 dark:opacity-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
