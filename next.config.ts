import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https" as const, hostname: "cdn.backschmiede-koelker.de" as const },
      ...(isDev ? [{ protocol: "http" as const, hostname: "localhost" as const }] : []),
      ...(isDev ? [{ protocol: "http" as const, hostname: "192.168.178.163" as const }] : []),
    ],
  },
};

export default nextConfig;
