// Where the app is served from. The deploy workflow sets both from the repo's
// GitHub Pages settings; locally the site runs at http://localhost:3000/.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000${basePath}`).replace(/\/+$/, "");

/** Absolute URL for an in-app path, e.g. appUrl("/share/?uid=x"). Browser only. */
export function appUrl(path: string) {
  return `${window.location.origin}${basePath}${path}`;
}
