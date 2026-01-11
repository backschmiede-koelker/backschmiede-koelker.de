// /app/api/collect/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";
import { auth } from "@/auth";

export const runtime = "nodejs";

// ---------- Helpers ----------
type CollectBody = {
  path?: unknown;
  utm?: {
    source?: unknown;
    medium?: unknown;
    campaign?: unknown;
  };
};
function dailyPepper(secret: string, day: string) {
  return crypto.createHmac("sha256", secret).update(day).digest("base64url");
}

function dailyIpHash(ip: string | null) {
  if (!ip) return null;
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const secret = process.env.IP_SALT ?? "";
  const pepper = dailyPepper(secret, day);
  return crypto.createHash("sha256").update(`${ip}|${day}|${pepper}`).digest("base64url");
}

function getClientIP(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return null;
  return xff.split(",")[0]?.trim() || null;
}

function deviceFromUA(ua: string | null) {
  const s = (ua || "").toLowerCase();
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobile|iphone|android/.test(s)) return "mobile";
  return "desktop";
}

function browserFromUA(ua: string | null) {
  const u = ua || "";
  const m =
    /edg\/(\d+)/i.exec(u) ||
    /chrome\/(\d+)/i.exec(u) ||
    /firefox\/(\d+)/i.exec(u);
  if (/edg\//i.test(u) && m) return `Edge ${m[1]}`;
  if (/chrome\//i.test(u) && m) return `Chrome ${m[1]}`;
  if (/firefox\//i.test(u) && m) return `Firefox ${m[1]}`;
  if (/safari/i.test(u) && !/chrome|crios|android/i.test(u)) return "Safari";
  return "Other";
}

function primaryLang(al: string | null) {
  const raw = (al || "").split(",")[0]?.trim() || "";
  const m = /^[a-z]{2}/i.exec(raw);
  return m ? m[0].toLowerCase() : undefined;
}

function refHostFromHeader(ref: string | null) {
  try {
    if (!ref) return undefined;
    return new URL(ref).host;
  } catch {
    return undefined;
  }
}

function isLikelyBot(ua: string | null) {
  const s = (ua || "").toLowerCase();
  return /(bot|crawl|spider|headless|puppeteer|monitor|curl|wget|python-requests|cfnetwork)/i.test(s);
}

function countryFromHeaders(req: Request) {
  const h = req.headers;
  const cand =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country-code") ||
    h.get("x-geo-country");
  if (!cand) return undefined;
  const cc = cand.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(cc) ? cc : undefined;
}

function cookieValue(req: Request, name: string) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// ---------- Handler ----------
export async function POST(req: Request) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    const ua = req.headers.get("user-agent");
    const lang = primaryLang(req.headers.get("accept-language"));
    const refHost = refHostFromHeader(req.headers.get("referer"));
    const country = countryFromHeaders(req);
    const sid = cookieValue(req, "sid");
    const ip = getClientIP(req);
    const ipHash = dailyIpHash(ip);
    const bot = isLikelyBot(ua);

    const body = (await req.json().catch(() => ({}))) as CollectBody;
    const path = typeof body.path === "string" ? body.path : "/";
    const utm = body.utm ?? {};
    const utmSource = typeof utm.source === "string" ? utm.source : undefined;
    const utmMedium = typeof utm.medium === "string" ? utm.medium : undefined;
    const utmCampaign = typeof utm.campaign === "string" ? utm.campaign : undefined;

    await getPrisma().pageview.create({
      data: {
        path,
        referrerHost: refHost,
        utmSource,
        utmMedium,
        utmCampaign,
        lang,
        device: deviceFromUA(ua),
        browser: browserFromUA(ua),
        country,
        sessionId: sid,
        ipHash,
        isBot: bot,
        isAdmin,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
