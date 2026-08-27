export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kaelnotes.com"
).replace(/\/$/, "");

export function reviewUrl(slug: string) {
  return `${siteUrl}/reviews/${slug}`;
}
