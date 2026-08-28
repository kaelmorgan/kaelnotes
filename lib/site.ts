export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kaelnotes.com"
).replace(/\/$/, "");

export const siteName = "Kael Notes";

export const siteDescription =
  "Neutral, professional reviews and considered notes on everyday subjects, by Kael Morgan.";

export function pageUrl(path = "/") {
  if (path === "/") {
    return siteUrl;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function reviewUrl(slug: string) {
  return pageUrl(`/reviews/${slug}`);
}

export function absoluteAssetUrl(path: string) {
  return path.startsWith("http") ? path : pageUrl(path);
}
