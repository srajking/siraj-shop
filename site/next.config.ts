import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,     // cached parts are prerendered, the rest streams (chapter 7)
  partialPrefetching: true,
};

export default nextConfig;
