import type { MetadataRoute } from "next";
import { basePath } from "@/lib/site";

// Lets phones "Add to Home Screen" with a proper name, icon and colours.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Matchday Calls — Champions League Predictions",
    short_name: "Matchday Calls",
    description: "Predict every Champions League score and beat your friends in a private league.",
    start_url: `${basePath}/predict/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#0a0f1e",
    theme_color: "#0a0f1e",
    icons: [
      { src: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${basePath}/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
