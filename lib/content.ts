import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Review, ReviewSummary } from "./types";

const reviewsDirectory = path.join(process.cwd(), "content/reviews");

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
};

function parseReviewFile(filename: string): Review {
  const fullPath = path.join(reviewsDirectory, filename);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontmatter = data as ReviewFrontmatter;

  return {
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
  };
}

function listReviewFilenames() {
  if (!fs.existsSync(reviewsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(reviewsDirectory)
    .filter((filename) => filename.endsWith(".mdx"));
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

export function isKnownReviewSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return false;
  }
  if (getReviewBySlug(slug)) {
    return true;
  }
  // On Vercel the API lambda may not include MDX files; don't 404 real slugs.
  return listReviewFilenames().length === 0;
}

export function getLatestReviews(limit = 9): ReviewSummary[] {
  return getReviewSummaries().slice(0, limit);
}

export function getCategories(reviews: ReviewSummary[] = getReviewSummaries()) {
  return [...new Set(reviews.map((review) => review.category))].sort();
}

export function getTags(reviews: ReviewSummary[] = getReviewSummaries()) {
  return [...new Set(reviews.flatMap((review) => review.tags))].sort();
}

export function searchReviews(query: string): ReviewSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  return getReviewSummaries().filter((review) => {
    const haystack = [
      review.title,
      review.excerpt,
      review.category,
      ...review.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export type ReviewSort = "latest" | "views" | "likes";

export function filterAndSortReviews(
  reviews: ReviewSummary[],
  options: {
    category?: string;
    tag?: string;
    sort?: ReviewSort;
  },
): ReviewSummary[] {
  let result = reviews;

  if (options.category) {
    result = result.filter((review) => review.category === options.category);
  }

  if (options.tag) {
    result = result.filter((review) => review.tags.includes(options.tag!));
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
