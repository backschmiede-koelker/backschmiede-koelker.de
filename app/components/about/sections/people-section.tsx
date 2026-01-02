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

function PersonCard({ p }: { p: AboutPersonDTO }) {
  const hasAvatar = !!p.avatarUrl;
  const avatar = hasAvatar ? publicAssetUrl(p.avatarUrl) : null;

  return (
    <article className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/60 dark:bg-white/5">
      <div className="flex gap-3">
        <div className="h-16 w-16 flex-none rounded-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 bg-zinc-100 dark:bg-zinc-800 grid place-items-center">
          {avatar ? (
            <img src={avatar} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
              {String(p.name ?? "?")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((x) => x[0]?.toUpperCase())
                .join("")}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm md:text-base font-semibold leading-tight">{p.name}</h3>
            <span className="text-[11px] rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5">
              {kindLabel(p.kind)}
            </span>
          </div>
          {p.roleLabel && <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">{p.roleLabel}</p>}
        </div>
      </div>

      {p.shortBio && (
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          {p.shortBio}
        </p>
      )}

      {(p.email || p.phone || p.instagramHandle) && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {p.email && (
            <a
              href={`mailto:${p.email}`}
              className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 hover:border-emerald-400 hover:text-emerald-700 transition"
            >
              Mail
            </a>
          )}
          {p.phone && (
            <a
              href={`tel:${p.phone}`}
              className="inline-flex items-center rounded-full bg-emerald-600 text-white px-3 py-1 shadow-sm hover:bg-emerald-700 transition"
            >
              Anrufen
            </a>
          )}
          {p.instagramHandle && (
            <a
              href={`https://instagram.com/${p.instagramHandle.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Instagram
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function bySortThenName(a: AboutPersonDTO, b: AboutPersonDTO) {
  const sa = Number.isFinite(a.sortOrder) ? (a.sortOrder as number) : 0;
  const sb = Number.isFinite(b.sortOrder) ? (b.sortOrder as number) : 0;
  if (sb !== sa) return sb - sa; // DESC
  const na = String(a.name ?? "").trim().toLowerCase();
  const nb = String(b.name ?? "").trim().toLowerCase();
  if (na < nb) return -1;
  if (na > nb) return 1;
  return String(a.id).localeCompare(String(b.id));
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
    <AboutCard>
      <AboutSectionHeading
        title={section.title ?? "Unser Team"}
        subtitle={
          section.subtitle ??
          "Menschen, die jeden Morgen Teige kneten, Brote backen und Gäste beraten."
        }
      />

      {lead.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Verantwortung & Leitung
          </h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {lead.map((p) => (
              <PersonCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}

      {staff.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Mitarbeiter
          </h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((p) => (
              <PersonCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </AboutCard>
  );
}
