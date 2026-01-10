// /app/admin/analytics/filters.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FaInfoCircle } from "react-icons/fa";
import SelectBox from "@/app/components/select-box";

type Props = {
  initial: {
    range: string;
    device?: string;
    lang?: string;
    browser?: string;
    country?: string;
    path?: string;
    ref?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    bots: boolean;
    admin: boolean;
  };
  options: {
    devices: string[];
    langs: string[];
    countries: string[];
    browsers: string[];
    paths: string[];
    referrers: string[];
    utmSources: string[];
    utmMediums: string[];
    utmCampaigns: string[];
  };
};

export default function AnalyticsFilters({ initial, options }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const ALL = "Alle";

  // State
  const [range, setRange] = useState(initial.range ?? "30d");
  const [device, setDevice] = useState(toDisplayDevice(initial.device || "")); // Desktop/Mobile/Tablet/Alle
  const [browser, setBrowser] = useState(initial.browser || ALL);
  const [lang, setLang] = useState(initial.lang || ALL);
  const [country, setCountry] = useState(initial.country || ALL);
  const [path, setPath] = useState(initial.path || ALL);
  const [ref, setRef] = useState(initial.ref || ALL);
  const [utmSource, setUtmSource] = useState(initial.utmSource || ALL);
  const [utmMedium, setUtmMedium] = useState(initial.utmMedium || ALL);
  const [utmCampaign, setUtmCampaign] = useState(initial.utmCampaign || ALL);
  const [bots, setBots] = useState(initial.bots ?? false);
  const [admin, setAdmin] = useState(initial.admin ?? false);

  function apply() {
    const q = new URLSearchParams();
    q.set("range", range);
    const dRaw = toDbDevice(device);
    if (dRaw) q.set("device", dRaw);
    if (browser !== ALL) q.set("browser", browser);
    if (lang !== ALL) q.set("lang", lang);
    if (country !== ALL) q.set("country", country);
    if (path !== ALL) q.set("path", path);
    if (ref !== ALL) q.set("ref", ref);
    if (utmSource !== ALL) q.set("utm_source", utmSource);
    if (utmMedium !== ALL) q.set("utm_medium", utmMedium);
    if (utmCampaign !== ALL) q.set("utm_campaign", utmCampaign);
    if (bots) q.set("bots", "1");
    if (admin) q.set("admin", "1");
    startTransition(() => router.push(`/admin/analytics?${q.toString()}`));
  }

  function resetAll() {
    // UI zurücksetzen
    setRange("30d");
    setDevice("Alle");
    setBrowser(ALL);
    setLang(ALL);
    setCountry(ALL);
    setPath(ALL);
    setRef(ALL);
    setUtmSource(ALL);
    setUtmMedium(ALL);
    setUtmCampaign(ALL);
    setBots(false);
    setAdmin(false);
    // URL zurücksetzen
    startTransition(() => router.push(`/admin/analytics?range=30d`));
  }

  // Optionen (mit "Alle")
  const deviceOptionsDisp = [ALL, ...options.devices.map(toDisplayDevice)];
  const browserOptions = [ALL, ...options.browsers];
  const langOptions = [ALL, ...options.langs];
  const countryOptions = [ALL, ...options.countries];
  const pathOptions = [ALL, ...options.paths];
  const refOptions = [ALL, "(direct)", ...options.referrers];
  const utmSourceOptions = [ALL, ...options.utmSources];
  const utmMediumOptions = [ALL, ...options.utmMediums];
  const utmCampaignOptions = [ALL, ...options.utmCampaigns];

  return (
    <div className="relative z-10 overflow-visible rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-4 shadow-sm">
      <div className="flex items-start gap-2 mb-3">
        <h2 className="text-sm font-semibold">Filter</h2>
        <div className="text-xs opacity-80 flex items-center gap-1">
          <FaInfoCircle />
          <span>Zeitraum wählen und nach Bedarf eingrenzen. „Admin“ & „Bots“ sind standardmäßig ausgeblendet.</span>
        </div>
      </div>

      {/* Zeiträume */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip label="7 Tage" active={range === "7d"} onClick={() => setRange("7d")} />
        <Chip label="30 Tage" active={range === "30d"} onClick={() => setRange("30d")} />
        <Chip label="90 Tage" active={range === "90d"} onClick={() => setRange("90d")} />
        <Chip label="365 Tage" active={range === "365d"} onClick={() => setRange("365d")} />
        <Chip label="Gesamter Zeitraum" active={range === "all"} onClick={() => setRange("all")} />
      </div>

      {/* Schalter */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-emerald-600" checked={bots} onChange={e => setBots(e.target.checked)} />
          Bots einbeziehen
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-emerald-600" checked={admin} onChange={e => setAdmin(e.target.checked)} />
          Admin einbeziehen
        </label>
      </div>

      {/* Zeile 1: Gerät → Browser → Sprache → Land */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Gerät">
          <SelectBox value={device} onChange={setDevice} options={deviceOptionsDisp} ariaLabel="Gerät" />
        </Field>
        <Field label="Browser">
          <SelectBox value={browser} onChange={setBrowser} options={browserOptions} ariaLabel="Browser" />
        </Field>
        <Field label="Sprache">
          <SelectBox value={lang} onChange={setLang} options={langOptions} ariaLabel="Sprache" />
        </Field>
        <Field label="Land">
          <SelectBox value={country} onChange={setCountry} options={countryOptions} ariaLabel="Land" />
        </Field>
      </div>

      {/* Zeile 2: Beginnt mit Seitenpfad → Quelle (woher) */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Beginnt mit Seitenpfad">
          <SelectBox value={path} onChange={setPath} options={pathOptions} ariaLabel="Seitenpfad" />
        </Field>
        <Field label="Quelle (woher)">
          <SelectBox value={ref} onChange={setRef} options={refOptions} ariaLabel="Quelle" />
        </Field>
      </div>

      {/* Zeile 3: UTM */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="UTM - Quelle">
          <SelectBox value={utmSource} onChange={setUtmSource} options={utmSourceOptions} ariaLabel="UTM Quelle" />
        </Field>
        <Field label="UTM - Medium">
          <SelectBox value={utmMedium} onChange={setUtmMedium} options={utmMediumOptions} ariaLabel="UTM Medium" />
        </Field>
        <Field label="UTM - Kampagne">
          <SelectBox value={utmCampaign} onChange={setUtmCampaign} options={utmCampaignOptions} ariaLabel="UTM Kampagne" />
        </Field>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          onClick={apply}
          disabled={isPending}
          className={[
            "w-full rounded-xl px-4 py-2.5 text-white font-semibold shadow-sm transition",
            isPending ? "bg-emerald-400 cursor-wait" : "bg-emerald-600 hover:bg-emerald-500",
          ].join(" ")}
        >
          {isPending ? "Filter werden angewendet…" : "Filter anwenden"}
        </button>
        <button
          onClick={resetAll}
          disabled={isPending}
          className={[
            "w-full sm:w-auto rounded-xl px-4 py-2.5 font-medium border transition",
            "border-zinc-300/70 dark:border-zinc-700/60",
            "hover:ring-1 hover:ring-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
            "active:scale-[0.98]"
          ].join(" ")}
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm block">
      <span className="block mb-1 opacity-80">{label}</span>
      {children}
    </label>
  );
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-lg text-sm border transition",
        active
          ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200"
          : "border-zinc-300/70 dark:border-zinc-700/60 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function toDisplayDevice(v: string) {
  if (!v) return "Alle";
  return v === "desktop" ? "Desktop" : v === "mobile" ? "Mobile" : v === "tablet" ? "Tablet" : v;
}
function toDbDevice(v: string) {
  const s = v.toLowerCase();
  if (s === "desktop") return "desktop";
  if (s === "mobile") return "mobile";
  if (s === "tablet") return "tablet";
  return "";
}
