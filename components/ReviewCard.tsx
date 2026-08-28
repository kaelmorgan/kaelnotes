import Link from "next/link";
import { AuthorByline } from "@/components/AuthorByline";
import { CardStats } from "@/components/CardStats";
import type { ReviewSummary } from "@/lib/types";

type ReviewCardProps = {
  review: ReviewSummary;
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Link
      href={`/reviews/${review.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-paper-raised transition hover:border-accent/30"
    >
      {review.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.coverImage}
          alt=""
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="h-40 w-full bg-[linear-gradient(135deg,#e8eef2_0%,#f7f4ee_55%,#efe7d8_100%)]" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-sans text-[0.7rem] font-medium tracking-[0.12em] text-accent uppercase">
          {review.category}
        </p>
        <h2 className="text-xl leading-snug font-semibold tracking-tight group-hover:text-accent">
          {review.title}
        </h2>
        <p className="flex-1 text-[0.95rem] leading-relaxed text-muted">
          {review.excerpt}
        </p>
        <AuthorByline size="sm" linked={false}>
          <CardStats
            slug={review.slug}
            views={review.viewCount}
            likes={review.likeCount}
          />
        </AuthorByline>
      </div>
    </Link>
  );
}
