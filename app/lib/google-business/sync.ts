// app/lib/google-business/sync.ts
import "server-only";

type LocationKey = "METTINGEN" | "RECKE";
type WeekdayKey =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

type TimeInterval = { start: string; end: string };

type WeeklyEntry = { weekday: WeekdayKey; intervals: TimeInterval[] };
type ExceptionEntry = { date: string; closed: boolean; intervals: TimeInterval[] };

type AfterSnapshot = {
  weekly: Record<LocationKey, WeeklyEntry[]>;
  exceptions: Record<LocationKey, ExceptionEntry[]>;
};

type GoogleDate = { year: number; month: number; day: number };

type BusinessHoursPeriod = {
  openDay: WeekdayKey;
  openTime: string; // "HH:MM"
  closeDay: WeekdayKey;
  closeTime: string; // "HH:MM"
};

type BusinessHours = { periods: BusinessHoursPeriod[] };

type SpecialHourPeriod =
  | { startDate: GoogleDate; endDate: GoogleDate; closed: true }
  | {
      startDate: GoogleDate;
      endDate: GoogleDate;
      closed?: false;
      openTime: string; // "HH:MM"
      closeTime: string; // "HH:MM"
    };

type SpecialHours = { specialHourPeriods: SpecialHourPeriod[] };

type LocationsPatchBody = {
  regularHours: BusinessHours;
  specialHours: SpecialHours;
};

type OAuthTokenResponse = {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

const REQUIRED_ENV = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "GOOGLE_BUSINESS_ACCOUNT_ID",
  "GOOGLE_BUSINESS_LOCATION_ID_RECKE",
  "GOOGLE_BUSINESS_LOCATION_ID_METTINGEN",
] as const;

const GBP_INFO_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

function mustEnv(name: (typeof REQUIRED_ENV)[number]): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function isAfterSnapshot(x: unknown): x is AfterSnapshot {
  if (!x || typeof x !== "object") return false;
  const obj = x as Partial<AfterSnapshot>;

  const hasLoc = (r: unknown): r is Record<LocationKey, unknown> =>
    !!r && typeof r === "object" && "METTINGEN" in (r as object) && "RECKE" in (r as object);

  return !!obj.weekly && !!obj.exceptions && hasLoc(obj.weekly) && hasLoc(obj.exceptions);
}

function coerceLocationName(envValue: string): string {
  return envValue.startsWith("locations/") ? envValue : `locations/${envValue}`;
}

function parseYmd(ymd: string): GoogleDate {
  const [y, m, d] = ymd.split("-").map((n) => Number(n));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error(`Ungültiges Datum (YYYY-MM-DD erwartet): ${ymd}`);
  }
  return { year: y, month: m, day: d };
}

function buildRegularHours(weekly: WeeklyEntry[]): BusinessHours {
  const periods: BusinessHoursPeriod[] = [];

  for (const day of weekly) {
    for (const it of day.intervals ?? []) {
      if (!it.start || !it.end) continue;
      periods.push({
        openDay: day.weekday,
        closeDay: day.weekday,
        openTime: it.start,
        closeTime: it.end,
      });
    }
  }

  return { periods };
}

function buildSpecialHours(exceptions: ExceptionEntry[]): SpecialHours {
  const specialHourPeriods: SpecialHourPeriod[] = [];

  for (const ex of exceptions ?? []) {
    const date = parseYmd(ex.date);

    if (ex.closed) {
      specialHourPeriods.push({
        startDate: date,
        endDate: date,
        closed: true,
      });
      continue;
    }

    const intervals = ex.intervals ?? [];
    // defensiv: "nicht closed" aber keine Intervalle => als closed behandeln
    if (!intervals.length) {
      specialHourPeriods.push({
        startDate: date,
        endDate: date,
        closed: true,
      });
      continue;
    }

    for (const it of intervals) {
      if (!it.start || !it.end) continue;
      specialHourPeriods.push({
        startDate: date,
        endDate: date,
        openTime: it.start,
        closeTime: it.end,
      });
    }
  }

  return { specialHourPeriods };
}

function isOAuthTokenResponse(x: unknown): x is OAuthTokenResponse {
  if (!x || typeof x !== "object") return false;
  const obj = x as Partial<OAuthTokenResponse>;
  return typeof obj.access_token === "string" && obj.access_token.length > 0;
}

async function fetchAccessToken(): Promise<string> {
  const body = new URLSearchParams({
    client_id: mustEnv("GOOGLE_OAUTH_CLIENT_ID"),
    client_secret: mustEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
    refresh_token: mustEnv("GOOGLE_OAUTH_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`OAuth token refresh failed (${res.status}): ${JSON.stringify(json)}`);
  }
  if (!isOAuthTokenResponse(json)) {
    throw new Error(`OAuth token response missing access_token: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function patchLocationHours(params: {
  accessToken: string;
  locationName: string; // "locations/123"
  body: LocationsPatchBody;
}): Promise<void> {
  const validateOnly = process.env.GOOGLE_BUSINESS_SYNC_VALIDATE_ONLY === "1";

  // Wichtig: specialHours niemals ohne regularHours patchen -> immer beide + updateMask beide.
  const updateMask = "regularHours,specialHours";

  const url = new URL(`${GBP_INFO_BASE}/${params.locationName}`);
  url.searchParams.set("updateMask", updateMask);
  if (validateOnly) url.searchParams.set("validateOnly", "true");

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${params.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(params.body),
    });

    const text = await res.text();

    if (res.ok) return;

    const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);
    if (!retryable || attempt === maxAttempts) {
      throw new Error(`GBP patch failed for ${params.locationName} (${res.status}): ${text}`);
    }

    await new Promise((r) => setTimeout(r, 400 * attempt));
  }
}

export async function syncBusinessHoursOrThrow(diffPayload: unknown): Promise<void> {
  if (process.env.GOOGLE_BUSINESS_SYNC_ENABLED !== "1") {
    throw new Error("Google-Sync ist nicht aktiv (GOOGLE_BUSINESS_SYNC_ENABLED=1 fehlt).");
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Google-Sync ist nicht konfiguriert (fehlend: ${missing.join(", ")}).`);
  }

  if (!isAfterSnapshot(diffPayload)) {
    throw new Error(
      "syncBusinessHoursOrThrow: diffPayload hat nicht das erwartete Format (after snapshot).",
    );
  }

  const accessToken = await fetchAccessToken();

  const locationByKey: Record<LocationKey, string> = {
    METTINGEN: coerceLocationName(mustEnv("GOOGLE_BUSINESS_LOCATION_ID_METTINGEN")),
    RECKE: coerceLocationName(mustEnv("GOOGLE_BUSINESS_LOCATION_ID_RECKE")),
  };

  for (const loc of ["METTINGEN", "RECKE"] as const) {
    const regularHours = buildRegularHours(diffPayload.weekly[loc]);
    const specialHours = buildSpecialHours(diffPayload.exceptions[loc]);

    await patchLocationHours({
      accessToken,
      locationName: locationByKey[loc],
      body: { regularHours, specialHours },
    });
  }
}
