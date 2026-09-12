function resolveSiteUrl() {
  const raw = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kaelnotes.com"
  ).replace(/\/$/, "");

  try {
    const url = new URL(raw);
    if (url.hostname === "kaelnotes.com") {
      url.hostname = "www.kaelnotes.com";
    }
    return url.origin;
  } catch {
    return "https://www.kaelnotes.com";
  }
}

export const siteUrl = resolveSiteUrl();

export const ogLocale = "en_GB";

export const siteName = "Kael Notes";

export const siteDescription =
  "Neutral, professional reviews and considered notes on everyday subjects, by Kael Morgan.";

export const defaultSocialImage = "/logo.png";

export const author = {
  name: "Kael Morgan",
  role: "Writer",
  location: "Singapore",
  bio: "A writer based in Singapore. Neutral, professional reviews of everyday subjects.",
  image: "/kael-morgan.jpg",
  url: "/about",
} as const;

export function pageUrl(path = "/") {
  if (path === "/") {
    return siteUrl;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function reviewUrl(slug: string) {
  return pageUrl(`/reviews/${slug}`);
}

export function guideUrl(slug: string) {
  return pageUrl(`/guides/${slug}`);
}

export function absoluteAssetUrl(path: string) {
  return path.startsWith("http") ? path : pageUrl(path);
}
