// next.config.ts
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.backschmiede-koelker.de", pathname: "/**" },
      ...(isDev ? [{ protocol: "http" as const, hostname: "cdn.backschmiede-koelker.lan", pathname: "/**" }] : []),
    ],
  },
  ...(isDev ? { allowedDevOrigins: ["backschmiede-koelker.lan", "cdn.backschmiede-koelker.lan"] } : {}),
};

export default nextConfig;
