import type { Metadata } from "next";
import {
  absoluteAssetUrl,
  author,
  defaultSocialImage,
  pageUrl,
  siteName,
} from "./site";
import type { Review } from "./types";

type StoryKind = "review" | "guide";

function socialImageUrl(path?: string) {
  return absoluteAssetUrl(path || defaultSocialImage);
}

export function storyMetadata(
  story: Review,
  url: string,
  options: { keywords?: boolean } = {},
): Metadata {
  const title = story.seoTitle ?? story.title;
  const description = story.seoDescription ?? story.excerpt;
  const image = socialImageUrl(story.coverImage);

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
      locale: "en_SG",
      publishedTime: story.publishedAt.toISOString(),
      modifiedTime: (story.updatedAt ?? story.publishedAt).toISOString(),
      images: [{ url: image, alt: title }],
      authors: [author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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
  const socialImage = socialImageUrl(image);

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
      locale: "en_SG",
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
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
