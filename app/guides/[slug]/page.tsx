import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { AuthorByline } from "@/components/AuthorByline";
import { CommentSection } from "@/components/CommentSection";
import { LikeButton } from "@/components/LikeButton";
import { ShareButton } from "@/components/ShareButton";
import { ViewCount } from "@/components/ViewCount";
import { getComments } from "@/lib/comments";
import { formatDate, getAllGuides, getGuideBySlug } from "@/lib/content";
import { author, guideUrl, pageUrl } from "@/lib/site";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return { title: "Guide" };
  }

  const title = guide.seoTitle ?? guide.title;
  const description = guide.seoDescription ?? guide.excerpt;
  const url = guideUrl(guide.slug);

  return {
    title,
    description,
    keywords: guide.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Kael Notes",
      publishedTime: guide.publishedAt.toISOString(),
      modifiedTime: (guide.updatedAt ?? guide.publishedAt).toISOString(),
      images: guide.coverImage ? [{ url: guide.coverImage }] : undefined,
      authors: [author.name],
    },
    twitter: {
      card: guide.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: guide.coverImage ? [guide.coverImage] : undefined,
    },
    authors: [{ name: author.name, url: pageUrl(author.url) }],
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const [stats, comments] = await Promise.all([
    getStats(guide.slug),
    getComments(guide.slug),
  ]);

  const url = guideUrl(guide.slug);
  const headline = guide.seoTitle ?? guide.title;
  const description = guide.seoDescription ?? guide.excerpt;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    name: guide.title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished: guide.publishedAt.toISOString(),
    dateModified: (guide.updatedAt ?? guide.publishedAt).toISOString(),
    inLanguage: "en-SG",
    author: {
      "@type": "Person",
      name: author.name,
      url: pageUrl(author.url),
    },
    publisher: {
      "@type": "Organization",
      name: "Kael Notes",
      url: pageUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: pageUrl("/logo.png"),
      },
    },
    keywords: guide.tags.join(", "),
  };

  const breadcrumbJsonLd = {
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
        name: "Guides",
        item: pageUrl("/guides"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: url,
      },
    ],
  };

  const faqJsonLd =
    guide.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <article className="mx-auto w-full max-w-[680px] px-5 py-12 sm:px-0 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [articleJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean),
          ),
        }}
      />
      <p className="font-sans text-xs tracking-[0.16em] text-accent uppercase">
        {guide.category}
      </p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight sm:text-[2.6rem]">
        {guide.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">{guide.excerpt}</p>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <AuthorByline>
          <time dateTime={guide.publishedAt.toISOString()}>
            {formatDate(guide.publishedAt)}
          </time>
          <ViewCount slug={guide.slug} initialCount={stats.views} />
        </AuthorByline>
        <div className="flex items-center gap-3">
          <LikeButton slug={guide.slug} initialCount={stats.likes} />
          <ShareButton
            title={guide.title}
            url={url}
            excerpt={guide.excerpt}
          />
        </div>
      </div>
      {guide.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2 font-sans text-xs text-muted">
          {guide.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-2.5 py-1"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="article-prose mt-12">
        <MDXRemote
          source={guide.content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
      {guide.faqs.length > 0 ? (
        <section className="mt-14 border-t border-line pt-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {guide.faqs.map((item) => (
              <div key={item.question} className="py-6">
                <dt className="text-lg font-semibold tracking-tight">
                  {item.question}
                </dt>
                <dd className="mt-2 leading-relaxed text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <AuthorByline />
        <ShareButton
          title={guide.title}
          url={url}
          excerpt={guide.excerpt}
          align="end"
          menuSide="top"
        />
      </div>
      <CommentSection slug={guide.slug} initialComments={comments} />
    </article>
  );
}
