import type { NextConfig } from "next";

// For GitHub Pages project sites the app is served from /<repo-name>/,
// so basePath must match the repo name. Set NEXT_PUBLIC_BASE_PATH in the
// GitHub Actions workflow (see .github/workflows/deploy.yml) to your repo name,
// e.g. "/ucl-predictor". Leave empty for a custom domain or a *.github.io user page.
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
