// app/lib/google-business/sync.ts
import "server-only";

const REQUIRED_ENV = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "GOOGLE_BUSINESS_ACCOUNT_ID",
  "GOOGLE_BUSINESS_LOCATION_ID_RECKE",
  "GOOGLE_BUSINESS_LOCATION_ID_METTINGEN",
] as const;

export async function syncBusinessHoursOrThrow(diffPayload: unknown): Promise<void> {
  void diffPayload;
  if (process.env.GOOGLE_BUSINESS_SYNC_ENABLED !== "1") {
    throw new Error(
      "Google-Sync ist nicht konfiguriert (GOOGLE_BUSINESS_SYNC_ENABLED=1 fehlt).",
    );
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Google-Sync ist nicht konfiguriert (fehlende Variablen: ${missing.join(", ")}).`,
    );
  }

  throw new Error("Google-Sync ist noch nicht implementiert (TODO: Business Profile API).");
}
