import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // output has to standalone for prod 
  output: "standalone"

  /*output: 'export',
  images: {
    unoptimized: true, 
  },*/
};

export default nextConfig;
