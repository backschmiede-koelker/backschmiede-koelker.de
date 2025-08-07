import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // output has to standalone for prod 
  output: "standalone",

  /*output: 'export',
  images: {
    unoptimized: true, 
  },*/

  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.178.163:3000'],
};

export default nextConfig;
