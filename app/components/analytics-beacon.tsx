// /app/components/analytics-beacon.tsx
"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function pickUTM(sp: URLSearchParams) {
  const m: Record<string, string> = {};
  const get = (k: string) => sp.get(k) || undefined;
  const source = get("utm_source");
  const medium = get("utm_medium");
  const campaign = get("utm_campaign");
  if (source) m.source = source;
  if (medium) m.medium = medium;
  if (campaign) m.campaign = campaign;
  return m;
}

export default function AnalyticsBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const body = {
      path: pathname || "/",
      utm: pickUTM(searchParams as unknown as URLSearchParams),
    };

    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });

    // sendBeacon ist non-blocking; Fallback auf fetch(keepalive) für alte Browser
    if (!navigator.sendBeacon || !navigator.sendBeacon("/api/collect", blob)) {
      fetch("/api/collect", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, searchParams]);

  return null;
}
