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
import { formatDate, getAllReviews, getReviewBySlug } from "@/lib/content";
import { author, pageUrl, reviewUrl } from "@/lib/site";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllReviews().map((review) => ({ slug: review.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const review = getReviewBySlug(slug);
  if (!review) {
    return { title: "Review" };
  }

  const title = review.seoTitle ?? review.title;
  const description = review.seoDescription ?? review.excerpt;
  const url = reviewUrl(review.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Kael Notes",
      publishedTime: review.publishedAt.toISOString(),
      modifiedTime: (review.updatedAt ?? review.publishedAt).toISOString(),
      images: review.coverImage ? [{ url: review.coverImage }] : undefined,
      authors: [author.name],
    },
    twitter: {
      card: review.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: review.coverImage ? [review.coverImage] : undefined,
    },
    authors: [{ name: author.name, url: pageUrl(author.url) }],
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = getReviewBySlug(slug);

  if (!review) {
    notFound();
  }

  const [stats, comments] = await Promise.all([
    getStats(review.slug),
    getComments(review.slug),
  ]);

  return (
    <article className="mx-auto w-full max-w-[680px] px-5 py-12 sm:px-0 sm:py-16">
      <p className="font-sans text-xs tracking-[0.16em] text-accent uppercase">
        {review.category}
      </p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight sm:text-[2.6rem]">
        {review.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">{review.excerpt}</p>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <AuthorByline>
          <time dateTime={review.publishedAt.toISOString()}>
            {formatDate(review.publishedAt)}
          </time>
          <ViewCount slug={review.slug} initialCount={stats.views} />
        </AuthorByline>
        <div className="flex items-center gap-3">
          <LikeButton slug={review.slug} initialCount={stats.likes} />
          <ShareButton
            title={review.title}
            url={reviewUrl(review.slug)}
            excerpt={review.excerpt}
          />
        </div>
      </div>
      {review.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2 font-sans text-xs text-muted">
          {review.tags.map((tag) => (
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
          source={review.content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <AuthorByline />
        <ShareButton
          title={review.title}
          url={reviewUrl(review.slug)}
          excerpt={review.excerpt}
          align="end"
          menuSide="top"
        />
      </div>
      <CommentSection slug={review.slug} initialComments={comments} />
    </article>
  );
}
