// /app/api/collect/route.ts
import { NextResponse } from "next/server";
import {
  ANALYTICS_TTL_SECONDS,
  analyticsKeys,
  browserFamilyFromUA,
  dayString,
  deviceClassFromUA,
  getAnalyticsConfig,
  languageFromHeader,
  osFamilyFromUA,
  perfBucketLabel,
  sanitizeDimValue,
  sanitizePath,
  sanitizeReferrerHost,
  uniqueToken,
} from "@/lib/analytics";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";

type CollectBody = {
  path?: unknown;
  utm?: {
    source?: unknown;
    medium?: unknown;
    campaign?: unknown;
  };
};

function getClientIP(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const ip = xff?.split(",")[0]?.trim() || real?.trim() || null;
  return ip || null;
}

export async function POST(req: Request) {
  const start = Date.now();

  try {
    const dnt = req.headers.get("dnt") === "1";
    const gpc = req.headers.get("sec-gpc") === "1";
    if (dnt || gpc) return new NextResponse(null, { status: 204 });

    const { prefix, masterSecret } = getAnalyticsConfig();

    const body = (await req.json().catch(() => ({}))) as CollectBody;
    const path = sanitizePath(body.path ?? "/");
    if (!path) return new NextResponse(null, { status: 204 });

    const ua = req.headers.get("user-agent");
    const deviceClass = deviceClassFromUA(ua);
    const lang = languageFromHeader(req.headers.get("accept-language"));
    const refHost = sanitizeReferrerHost(req.headers.get("referer"));

    // Neu: grobe Familien (ohne Versionen)
    const browserFamily = browserFamilyFromUA(ua);
    const osFamily = osFamilyFromUA(ua);

    const utm = body.utm ?? {};
    const utmSource = sanitizeDimValue(utm.source);
    const utmMedium = sanitizeDimValue(utm.medium);
    const utmCampaign = sanitizeDimValue(utm.campaign);

    const day = dayString(new Date());
    const keys = analyticsKeys(prefix, day);

    const redis = await getRedis();
    const multi = redis.multi();

    // --- Pageview Aggregationen ---
    multi.incr(keys.pv);
    multi.hIncrBy(keys.path, path, 1);
    if (refHost) multi.hIncrBy(keys.ref, refHost, 1);
    if (utmSource) multi.hIncrBy(keys.utmSource, utmSource, 1);
    if (utmMedium) multi.hIncrBy(keys.utmMedium, utmMedium, 1);
    if (utmCampaign) multi.hIncrBy(keys.utmCampaign, utmCampaign, 1);
    multi.hIncrBy(keys.device, deviceClass, 1);
    if (lang) multi.hIncrBy(keys.lang, lang, 1);

    // Neu: Browser/OS Familien (aggregiert)
    multi.hIncrBy(keys.browser, browserFamily, 1);
    multi.hIncrBy(keys.os, osFamily, 1);

    // --- Unique Users / Tag (HLL) ---
    const ip = getClientIP(req);
    if (ip) {
      const token = uniqueToken(masterSecret, day, ip, deviceClass);
      multi.pfAdd(keys.uv, token);
    }

    // --- Performance (serverseitig, aggregiert) ---
    const durMs = Math.max(0, Date.now() - start);
    const bucket = perfBucketLabel(durMs);
    multi.hIncrBy(keys.perfHist, bucket, 1);
    multi.incrBy(keys.perfSumMs, durMs);
    multi.incr(keys.perfCount);

    // Performance pro Path: sum/count -> avg (keine Per-User/Session Daten)
    multi.hIncrBy(keys.perfPathSumMs, path, durMs);
    multi.hIncrBy(keys.perfPathCount, path, 1);

    // TTL auf alles
    const ttlKeys = new Set<string>([
      keys.pv,
      keys.uv,
      keys.path,
      keys.ref,
      keys.utmSource,
      keys.utmMedium,
      keys.utmCampaign,
      keys.device,
      keys.lang,
      keys.browser,
      keys.os,
      keys.perfHist,
      keys.perfSumMs,
      keys.perfCount,
      keys.perfPathSumMs,
      keys.perfPathCount,
    ]);
    ttlKeys.forEach((key) => multi.expire(key, ANALYTICS_TTL_SECONDS));

    await multi.exec();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analytics error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
