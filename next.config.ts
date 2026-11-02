import type { NextConfig } from "next";

// For GitHub Pages project sites the app is served from /<repo-name>/, so
// basePath must match. The deploy workflow sets NEXT_PUBLIC_BASE_PATH from the
// repo's Pages settings (empty for a custom domain or a *.github.io user page).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
