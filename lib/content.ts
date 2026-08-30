import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { FaqItem, Guide, GuideSummary, Review, ReviewSummary } from "./types";

const reviewsDirectory = path.join(process.cwd(), "content/reviews");
const guidesDirectory = path.join(process.cwd(), "content/guides");

type ReviewFrontmatter = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags?: string[];
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount?: number;
  likeCount?: number;
  publishedAt: string;
  updatedAt?: string;
  faqs?: FaqItem[];
};

function parseMdxArticle(directory: string, filename: string): {
  article: Review;
  faqs: FaqItem[];
} {
  const fullPath = path.join(directory, filename);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as ReviewFrontmatter;

  return {
    article: {
      title: frontmatter.title,
      slug: frontmatter.slug,
      excerpt: frontmatter.excerpt,
      content: content.trim(),
      category: frontmatter.category,
      tags: frontmatter.tags ?? [],
      coverImage: frontmatter.coverImage,
      seoTitle: frontmatter.seoTitle,
      seoDescription: frontmatter.seoDescription,
      viewCount: frontmatter.viewCount ?? 0,
      likeCount: frontmatter.likeCount ?? 0,
      publishedAt: new Date(frontmatter.publishedAt),
      updatedAt: frontmatter.updatedAt
        ? new Date(frontmatter.updatedAt)
        : undefined,
    },
    faqs: (frontmatter.faqs ?? []).filter(
      (item) => item.question?.trim() && item.answer?.trim(),
    ),
  };
}

function parseReviewFile(filename: string): Review {
  return parseMdxArticle(reviewsDirectory, filename).article;
}

function parseGuideFile(filename: string): Guide {
  const { article, faqs } = parseMdxArticle(guidesDirectory, filename);
  return { ...article, faqs };
}

function listReviewFilenames() {
  return listMdxFilenames(reviewsDirectory);
}

export function getAllReviews(): Review[] {
  return listReviewFilenames()
    .map(parseReviewFile)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getReviewSummaries(): ReviewSummary[] {
  return getAllReviews().map((review) => ({
    title: review.title,
    slug: review.slug,
    excerpt: review.excerpt,
    category: review.category,
    tags: review.tags,
    coverImage: review.coverImage,
    seoTitle: review.seoTitle,
    seoDescription: review.seoDescription,
    viewCount: review.viewCount,
    likeCount: review.likeCount,
    publishedAt: review.publishedAt,
    updatedAt: review.updatedAt,
  }));
}

export function getReviewBySlug(slug: string): Review | undefined {
  return getAllReviews().find((review) => review.slug === slug);
}

function listMdxFilenames(directory: string) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((filename) => filename.endsWith(".mdx"));
}

function listGuideFilenames() {
  return listMdxFilenames(guidesDirectory);
}

export function getAllGuides(): Guide[] {
  return listGuideFilenames()
    .map(parseGuideFile)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getGuideSummaries(): GuideSummary[] {
  return getAllGuides().map((guide) => ({
    title: guide.title,
    slug: guide.slug,
    excerpt: guide.excerpt,
    category: guide.category,
    tags: guide.tags,
    coverImage: guide.coverImage,
    seoTitle: guide.seoTitle,
    seoDescription: guide.seoDescription,
    viewCount: guide.viewCount,
    likeCount: guide.likeCount,
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
    faqs: guide.faqs,
  }));
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return getAllGuides().find((guide) => guide.slug === slug);
}

export function isKnownReviewSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return false;
  }
  if (getReviewBySlug(slug) || getGuideBySlug(slug)) {
    return true;
  }
  // On Vercel the API lambda may not include MDX files; don't 404 real slugs.
  return listReviewFilenames().length === 0 && listGuideFilenames().length === 0;
}

export function getLatestReviews(limit = 9): ReviewSummary[] {
  return getReviewSummaries().slice(0, limit);
}

export function getCategories(reviews: ReviewSummary[] = getReviewSummaries()) {
  return [...new Set(reviews.map((review) => review.category))].sort();
}

function matchesQuery(
  item: Pick<ReviewSummary, "title" | "excerpt" | "category" | "tags">,
  needle: string,
) {
  const haystack = [item.title, item.excerpt, item.category, ...item.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function searchReviews(query: string): ReviewSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  return getReviewSummaries().filter((review) => matchesQuery(review, needle));
}

export function searchGuides(query: string): GuideSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  return getGuideSummaries().filter((guide) => matchesQuery(guide, needle));
}

export type ReviewSort = "latest" | "views" | "likes";

export function filterAndSortReviews(
  reviews: ReviewSummary[],
  options: {
    category?: string;
    sort?: ReviewSort;
  },
): ReviewSummary[] {
  let result = reviews;

  if (options.category) {
    result = result.filter((review) => review.category === options.category);
  }

  const sort = options.sort ?? "latest";
  result = [...result].sort((a, b) => {
    if (sort === "views") {
      return b.viewCount - a.viewCount;
    }
    if (sort === "likes") {
      return b.likeCount - a.likeCount;
    }
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });

  return result;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
