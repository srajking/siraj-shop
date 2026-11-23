import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,     // cached parts are prerendered, the rest streams (chapter 7)
  partialPrefetching: true,
  output: "standalone",      // .next/standalone: server.js and only the modules it needs (chapter 18)
  outputFileTracingRoot: __dirname, // site/ is the app — not the whole repository above it
  turbopack: { root: __dirname },
};

export default nextConfig;
