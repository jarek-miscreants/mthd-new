import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: deployed as plain assets on Cloudflare Workers (see wrangler.jsonc).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
