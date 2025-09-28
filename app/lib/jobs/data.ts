// /lib/jobs/data.ts
import { slugify } from "../utils/slug";
import type { Job } from "./types";

const RAW: Omit<
  Job,
  "id" | "slug" | "datePosted" | "validThrough"
>[] = [
  {
    title: "Bäckereifachverkäufer/in (m/w/d)",
    role: "Verkäufer/in",
    teaser:
      "Du liebst den Umgang mit Menschen und frische Backwaren? Dann ab an die Theke!",
    descriptionHtml:
      "<p>Als Bäckereifachverkäufer/in berätst du unsere Gäste, bereitest Snacks zu und sorgst für einen einladenden Tresen.</p>",
    responsibilities: [
      "Beratung & Verkauf von Backwaren",
      "Kassenführung & Abrechnung",
      "Snackzubereitung & Warenpräsentation",
      "Hygienestandards (HACCP) einhalten",
    ],
    qualifications: [
      "Freude an Service und Teamarbeit",
      "Deutschkenntnisse",
      "Erfahrung im Verkauf von Vorteil",
    ],
    benefits: ["Mitarbeiterrabatte", "Planbare Schichten", "Team-Events"],
    employmentType: "PART_TIME",
    locations: ["Mettingen", "Recke"],
    shift: "Früh- & Spätschicht",
    salary: { currency: "EUR", min: 13, max: 16, unitText: "HOUR" },
  },
  {
    title: "Bäcker/in (m/w/d)",
    role: "Bäcker/in",
    teaser:
      "Backe mit uns – traditionell & modern, mit natürlichen Zutaten und moderner Technik.",
    descriptionHtml:
      "<p>In unserer Backstube arbeitest du mit Sauerteig, Langzeitführung und moderner Technik.</p>",
    responsibilities: [
      "Teigbereitung & Aufarbeitung",
      "Ofenführung",
      "Qualitätskontrolle",
      "Reinigung & Hygiene",
    ],
    qualifications: [
      "Abgeschlossene Ausbildung als Bäcker/in oder Erfahrung",
      "Zuverlässigkeit & Teamgeist",
    ],
    benefits: ["Schichtzuschläge", "Fortbildungen", "Moderne Backstube"],
    employmentType: "FULL_TIME",
    locations: ["Mettingen"],
    shift: "Nachtschicht",
    salary: { currency: "EUR", min: 2600, max: 3200, unitText: "MONTH" },
  },
  {
    title: "Ausbildung Fachverkäufer/in im Lebensmittelhandwerk",
    role: "Azubi",
    teaser:
      "Starte deine Ausbildung im Verkauf – mit echter Praxis und Übernahmechance.",
    descriptionHtml:
      "<p>Du lernst Beratung, Warenkunde, Snackzubereitung und die Basics der Betriebsabläufe.</p>",
    responsibilities: ["Beratung", "Kasse", "Snacks", "Warenkunde"],
    qualifications: ["Freundlichkeit", "Teamfähigkeit", "Lernbereitschaft"],
    benefits: ["Azubi-Events", "Übernahmechance", "Prämien"],
    employmentType: "APPRENTICESHIP",
    locations: ["Recke", "Mettingen"],
  },
  {
    title: "Aushilfe Verkauf (m/w/d)",
    role: "Aushilfe",
    teaser:
      "Du suchst flexible Stunden neben Schule/Studium? Unterstütze unser Team im Verkauf.",
    descriptionHtml:
      "<p>Du packst dort an, wo es brennt – von der Snackvorbereitung bis zur Kasse.</p>",
    responsibilities: [
      "Unterstützung im Tagesgeschäft",
      "Kasse & Auffüllen",
      "Reinigung nach Plan",
    ],
    qualifications: [
      "Zuverlässig, freundlich, teamfähig",
      "Gern auch Quereinsteiger/innen",
    ],
    benefits: ["Flexible Einsätze", "Rabatte", "Faires Miteinander"],
    employmentType: "MINI_JOB",
    locations: ["Mettingen", "Recke"],
  },
];

const NOW = new Date();
const DATA: Job[] = RAW.map((r, i) => {
  const slug = slugify(`${r.title}-${r.locations[0] || "de"}`);
  const id = `job-${i + 1}`;
  const datePosted = new Date(NOW.getTime() - (i + 1) * 24 * 3600 * 1000);
  const validThrough = new Date(NOW.getTime() + 60 * 24 * 3600 * 1000);
  return { ...r, id, slug, datePosted, validThrough };
});

export async function fetchJobs(filter?: {
  q?: string;
  loc?: string; // "Beide" | "Mettingen" | "Recke"
  role?: string; // "Alle" | Role
}) {
  let res = [...DATA];
  if (filter?.q) {
    const q = filter.q.toLowerCase();
    res = res.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.teaser.toLowerCase().includes(q) ||
        j.descriptionHtml.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q)
    );
  }
  if (filter?.loc && filter.loc !== "Beide") {
    const l = filter.loc.toLowerCase();
    res = res.filter((j) => j.locations.some((x) => x.toLowerCase() === l));
  }
  if (filter?.role && filter.role !== "Alle") {
    res = res.filter((j) => j.role === filter.role);
  }
  return res;
}

export async function getJobBySlug(slug: string) {
  return DATA.find((j) => j.slug === slug);
}

export async function allJobs() {
  return DATA;
}
