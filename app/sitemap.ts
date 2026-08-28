import type { MetadataRoute } from "next";
import { getAllReviews } from "@/lib/content";
import { absoluteAssetUrl, pageUrl } from "@/lib/site";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/reviews", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/guides", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const reviews = getAllReviews();
  const latestReviewUpdate = reviews.reduce<Date | undefined>((latest, review) => {
    const modified = review.updatedAt ?? review.publishedAt;
    if (!latest || modified > latest) {
      return modified;
    }
    return latest;
  }, undefined);

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: pageUrl(route.path),
    lastModified: route.path === "/" ? latestReviewUpdate : undefined,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const reviewPages: MetadataRoute.Sitemap = reviews.map((review) => ({
    url: pageUrl(`/reviews/${review.slug}`),
    lastModified: review.updatedAt ?? review.publishedAt,
    changeFrequency: "monthly",
    priority: 0.8,
    images: review.coverImage
      ? [absoluteAssetUrl(review.coverImage)]
      : undefined,
  }));

  return [...staticPages, ...reviewPages];
}
