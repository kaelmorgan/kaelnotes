import type { Metadata } from "next";
import {
  absoluteAssetUrl,
  author,
  defaultSocialImage,
  ogLocale,
  pageUrl,
  siteName,
} from "./site";
import type { Review } from "./types";

type StoryKind = "review" | "guide";

function socialImageType(path: string) {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  return undefined;
}

function socialImage(path?: string, alt?: string) {
  const relative = path || defaultSocialImage;
  return {
    url: absoluteAssetUrl(relative),
    alt,
    type: socialImageType(relative),
  };
}

function socialImageUrl(path?: string) {
  return socialImage(path).url;
}

export function storyMetadata(
  story: Review,
  url: string,
  options: { keywords?: boolean } = {},
): Metadata {
  const title = story.seoTitle ?? story.title;
  const description = story.seoDescription ?? story.excerpt;
  const image = socialImage(story.coverImage, title);

  return {
    title,
    description,
    ...(options.keywords && story.tags.length > 0
      ? { keywords: story.tags }
      : {}),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName,
      locale: ogLocale,
      publishedTime: story.publishedAt.toISOString(),
      modifiedTime: (story.updatedAt ?? story.publishedAt).toISOString(),
      images: [image],
      authors: [author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    authors: [{ name: author.name, url: pageUrl(author.url) }],
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = pageUrl(path);
  const imageMeta = socialImage(image, title);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName,
      locale: ogLocale,
      images: [imageMeta],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageMeta.url],
    },
  };
}

export function articleJsonLd(story: Review, url: string) {
  const headline = story.seoTitle ?? story.title;
  const description = story.seoDescription ?? story.excerpt;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    name: story.title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished: story.publishedAt.toISOString(),
    dateModified: (story.updatedAt ?? story.publishedAt).toISOString(),
    inLanguage: "en-SG",
    image: socialImageUrl(story.coverImage),
    author: {
      "@type": "Person",
      name: author.name,
      url: pageUrl(author.url),
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: pageUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: pageUrl("/logo.png"),
      },
    },
    keywords: story.tags.join(", "),
  };
}

export function breadcrumbJsonLd(
  kind: StoryKind,
  story: Review,
  url: string,
) {
  const section =
    kind === "guide"
      ? { name: "Guides", path: "/guides" }
      : { name: "Reviews", path: "/reviews" };

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: pageUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: section.name,
        item: pageUrl(section.path),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: story.title,
        item: url,
      },
    ],
  };
}

export function faqJsonLd(story: { faqs: { question: string; answer: string }[] }) {
  if (story.faqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: story.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data);
}
