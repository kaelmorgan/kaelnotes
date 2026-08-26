import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { LikeButton } from "@/components/LikeButton";
import { formatDate, getAllReviews, getReviewBySlug } from "@/lib/content";
import { formatCount } from "@/lib/format";

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

  return {
    title: review.seoTitle ?? review.title,
    description: review.seoDescription ?? review.excerpt,
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

  return (
    <article className="mx-auto w-full max-w-[680px] px-5 py-12 sm:px-0 sm:py-16">
      <p className="font-sans text-xs tracking-[0.16em] text-accent uppercase">
        {review.category}
      </p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight sm:text-[2.6rem]">
        {review.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">{review.excerpt}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4 font-sans text-sm text-muted">
        <time dateTime={review.publishedAt.toISOString()}>
          {formatDate(review.publishedAt)}
        </time>
        <span>{formatCount(review.viewCount)} views</span>
        <LikeButton slug={review.slug} initialCount={review.likeCount} />
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
    </article>
  );
}
