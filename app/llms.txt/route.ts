import { getAllGuides, getAllReviews } from "@/lib/content";
import {
  guideUrl,
  pageUrl,
  reviewUrl,
  siteDescription,
  siteName,
} from "@/lib/site";

export function GET() {
  const reviews = getAllReviews();
  const guides = getAllGuides();

  const lines = [
    `# ${siteName}`,
    "",
    `> ${siteDescription}`,
    "",
    "A reading-focused personal blog from Singapore. Primary content is practical, neutral reviews — especially travel — with longer guides on method and judgement.",
    "",
    "## Site",
    "",
    `- [Home](${pageUrl("/")}): Latest reviews in a reading-focused layout`,
    `- [All reviews](${pageUrl("/reviews")}): Full archive with category filters`,
    `- [About](${pageUrl("/about")}): About Kael Morgan and the site`,
    `- [FAQ](${pageUrl("/faq")}): What gets reviewed and how the work is approached`,
    `- [Guides](${pageUrl("/guides")}): Longer practical pieces on review method`,
    "",
    "## Reviews",
    "",
    ...reviews.map(
      (review) =>
        `- [${review.title}](${reviewUrl(review.slug)}): ${review.excerpt}`,
    ),
    "",
    "## Guides",
    "",
    ...guides.map(
      (guide) =>
        `- [${guide.title}](${guideUrl(guide.slug)}): ${guide.excerpt}`,
    ),
    "",
    "## Machine-readable",
    "",
    `- [Sitemap](${pageUrl("/sitemap.xml")})`,
    `- [Robots](${pageUrl("/robots.txt")})`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
