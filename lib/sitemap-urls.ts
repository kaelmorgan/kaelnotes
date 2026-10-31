import { getAllGuides, getAllReviews } from "@/lib/content";
import { guideUrl, pageUrl, reviewUrl } from "@/lib/site";

const staticPaths = [
  "/",
  "/reviews",
  "/about",
  "/faq",
  "/guides",
] as const;

/** Absolute URLs for every indexable marketing page (matches sitemap.xml). */
export function getAllIndexableUrls(): string[] {
  const reviews = getAllReviews();
  const guides = getAllGuides();

  const staticUrls = staticPaths.map((path) => pageUrl(path));
  const reviewUrls = reviews.map((review) => reviewUrl(review.slug));
  const guideUrls = guides.map((guide) => guideUrl(guide.slug));

  return [...staticUrls, ...reviewUrls, ...guideUrls];
}
