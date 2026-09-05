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
import {
  articleJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
  storyMetadata,
} from "@/lib/seo";
import { reviewUrl } from "@/lib/site";
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

  return storyMetadata(review, reviewUrl(review.slug), { keywords: true });
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

  const url = reviewUrl(review.slug);

  return (
    <article className="mx-auto w-full max-w-[680px] px-5 py-12 sm:px-0 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            articleJsonLd(review, url),
            breadcrumbJsonLd("review", review, url),
          ]),
        }}
      />
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
