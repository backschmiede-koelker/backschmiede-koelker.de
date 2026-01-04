// app/components/about/sections/people-section.tsx
import type { AboutPersonDTO, AboutSectionDTO } from "@/app/about/types";
import { publicAssetUrl } from "@/app/lib/uploads";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

function kindLabel(kind: AboutPersonDTO["kind"]) {
  switch (kind) {
    case "OWNER":
      return "Inhaber:in";
    case "MANAGER":
      return "Leitung";
    default:
      return "Team";
  }
}

function initials(name?: string | null) {
  return String(name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function safeInstagram(handle: string) {
  return handle.replace(/^@/, "").trim();
}

function PersonCard({
  p,
  variant = "default",
}: {
  p: AboutPersonDTO;
  variant?: "default" | "lead";
}) {
  const avatar = p.avatarUrl ? publicAssetUrl(p.avatarUrl) : null;
  const isLead = variant === "lead";

  return (
    <article className="group relative min-w-0 h-full">
      {/* Frame */}
      <div
        className={[
          "rounded-3xl p-[1px] h-full",
          // LIGHT: kräftigerer Rahmen
          "bg-gradient-to-br from-emerald-300/95 via-zinc-300/70 to-amber-300/90",
          // DARK: dauerhaftes Grün etwas leichter
          "dark:from-emerald-700/14 dark:via-zinc-800/40 dark:to-amber-700/12",
        ].join(" ")}
      >
        <div
          className={[
            "relative overflow-hidden rounded-3xl h-full",
            "bg-white dark:bg-zinc-900/60 backdrop-blur",
            // neutral ring
            "ring-1 ring-zinc-300/90 dark:ring-zinc-800/70",
            // shadow tuned (no banding)
            "shadow-[0_14px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.38)]",
            "p-4 sm:p-5",
          ].join(" ")}
        >
          {/* Stronger LIGHT hover accents (orange stays) */}
          <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-emerald-300/40 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:bg-emerald-500/10" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-amber-300/34 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:bg-amber-500/10" />

          {/* Crisper hover ring (LIGHT only) */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent group-hover:ring-emerald-300/70 dark:group-hover:ring-transparent transition" />

          <div className="relative flex h-full flex-col">
            {/* Header */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={[
                  "relative flex-none overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-1 ring-black/10 dark:ring-white/10",
                  // ✅ Leitung: nutzt vorhandenen Platz besser (ohne Card größer zu machen)
                  isLead
                    ? "h-16 w-16 sm:h-[84px] sm:w-[84px] rounded-3xl"
                    : "h-14 w-14 sm:h-16 sm:w-16 rounded-2xl",
                ].join(" ")}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <span
                      className={[
                        "font-semibold text-zinc-700 dark:text-zinc-200",
                        isLead ? "text-base sm:text-xl" : "text-base sm:text-lg",
                      ].join(" ")}
                    >
                      {initials(p.name)}
                    </span>
                  </div>
                )}

                {/* top highlight line (light only) */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-80 dark:opacity-0" />
              </div>

              {/* Name / role */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <h3
                    className={[
                      "min-w-0 font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-normal break-words",
                      // ✅ Leitung: minimal größer, aber kein Layout-Wachstum
                      isLead ? "text-sm sm:text-[17px]" : "text-sm sm:text-base",
                    ].join(" ")}
                  >
                    {p.name}
                  </h3>

                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      // LIGHT: kräftiger + klarer
                      "bg-zinc-100 text-zinc-800 ring-1 ring-zinc-300/80",
                      "dark:bg-zinc-800/70 dark:text-zinc-200 dark:ring-zinc-700/60",
                      "whitespace-normal break-words",
                    ].join(" ")}
                  >
                    {kindLabel(p.kind)}
                  </span>
                </div>

                {p.roleLabel && (
                  <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300 whitespace-normal break-words">
                    {p.roleLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {p.shortBio && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-normal break-words">
                {p.shortBio}
              </p>
            )}

            {/* Spacer so actions stick to bottom -> equal-height rows look clean */}
            <div className="mt-auto" />

            {/* Actions */}
            {(p.email || p.phone || p.instagramHandle) && (
              <div className="pt-4 flex flex-wrap items-center gap-2">
                {p.email && (
                  <a
                    href={`mailto:${p.email}`}
                    className={[
                      "inline-flex items-center justify-center",
                      "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                      // LIGHT: stronger hover + stronger border
                      "bg-white ring-1 ring-zinc-300/90 text-zinc-800",
                      "hover:ring-emerald-400/90 hover:text-emerald-900 transition",
                      // ✅ DARK: weniger grün/auffällig beim Hover
                      "dark:bg-zinc-900/40 dark:ring-zinc-700/70 dark:text-zinc-200 dark:hover:ring-emerald-400/22 dark:hover:text-emerald-200",
                      "min-w-0 max-w-full whitespace-normal break-words text-center",
                      "outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      "dark:focus-visible:ring-emerald-400/25 dark:focus-visible:ring-offset-zinc-950",
                    ].join(" ")}
                  >
                    Mail
                  </a>
                )}

                {p.phone && (
                  <a
                    href={`tel:${p.phone}`}
                    className={[
                      "inline-flex items-center justify-center",
                      "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                      "text-white shadow-[0_10px_22px_rgba(0,0,0,0.18)]",
                      "bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700",
                      "hover:from-emerald-800 hover:via-emerald-700 hover:to-emerald-800 transition",
                      // ✅ DARK: weniger „neon“
                      "dark:from-emerald-500/70 dark:via-emerald-400/58 dark:to-emerald-500/70",
                      "min-w-0 max-w-full whitespace-normal break-words text-center",
                      "outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      "dark:focus-visible:ring-emerald-400/25 dark:focus-visible:ring-offset-zinc-950",
                    ].join(" ")}
                  >
                    Anrufen
                  </a>
                )}

                {p.instagramHandle && (
                  <a
                    href={`https://instagram.com/${safeInstagram(p.instagramHandle)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={[
                      "inline-flex items-center justify-center",
                      "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                      // LIGHT: stronger hover + border (orange stays)
                      "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-300/80",
                      "hover:bg-zinc-200 hover:ring-amber-300/80 transition",
                      "dark:bg-zinc-800/70 dark:text-zinc-100 dark:ring-zinc-700/60 dark:hover:bg-zinc-700/70",
                      "min-w-0 max-w-full whitespace-normal break-words text-center",
                      "outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      "dark:focus-visible:ring-emerald-400/25 dark:focus-visible:ring-offset-zinc-950",
                    ].join(" ")}
                  >
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function bySortThenName(a: AboutPersonDTO, b: AboutPersonDTO) {
  const sa = Number.isFinite(a.sortOrder) ? (a.sortOrder as number) : 0;
  const sb = Number.isFinite(b.sortOrder) ? (b.sortOrder as number) : 0;
  if (sa !== sb) return sa - sb; // ASC
  const na = String(a.name ?? "").trim().toLowerCase();
  const nb = String(b.name ?? "").trim().toLowerCase();
  if (na < nb) return -1;
  if (na > nb) return 1;
  return String(a.id).localeCompare(String(b.id));
}

function SectionLabel({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-normal break-words">
        {title}
      </h3>
      <span className="flex-none rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/80 dark:ring-zinc-700/60">
        {count}
      </span>
    </div>
  );
}

export default function AboutPeopleSection({
  section,
  persons,
}: {
  section: AboutSectionDTO;
  persons: AboutPersonDTO[];
}) {
  const visible = persons.filter((p) => p.isShownOnAbout);
  if (!visible.length) return null;

  const lead = visible
    .filter((p) => p.kind === "OWNER" || p.kind === "MANAGER")
    .sort(bySortThenName);

  const staff = visible
    .filter((p) => p.kind === "TEAM_MEMBER")
    .sort(bySortThenName);

  return (
    <AboutCard className="relative overflow-hidden">
      {/* subtle inner accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/22 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-amber-200/18 blur-3xl dark:bg-amber-500/10" />

      <div className="relative">
        <AboutSectionHeading
          title={section.title ?? "Unser Team"}
          subtitle={
            section.subtitle ??
            "Menschen, die jeden Morgen Teige kneten, Brote backen und Gäste beraten."
          }
        />

        {lead.length > 0 && (
          <div className="mt-5">
            <SectionLabel title="Verantwortung & Leitung" count={lead.length} />

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-stretch">
              {lead.map((p) => (
                <PersonCard key={p.id} p={p} variant="lead" />
              ))}
            </div>
          </div>
        )}

        {staff.length > 0 && (
          <div className="mt-8">
            {/* Divider */}
            <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-zinc-300/90 to-transparent dark:via-zinc-800/70" />

            <SectionLabel title="Mitarbeiter" count={staff.length} />

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 items-stretch">
              {staff.map((p) => (
                <PersonCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AboutCard>
  );
}
