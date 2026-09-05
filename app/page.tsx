import Link from "next/link";
import { ReviewCard } from "@/components/ReviewCard";
import { getLatestReviews } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { siteDescription, siteName } from "@/lib/site";
import { attachStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const reviews = await attachStats(getLatestReviews(9));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-2xl">
        <p className="font-sans text-xs tracking-[0.16em] text-accent uppercase">
          Reviews
        </p>
        <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Close reading of ordinary things
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Neutral, professional notes — on anything happening around the world.
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-16 text-muted">Nothing published yet.</p>
      ) : (
        <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </section>
      )}

      <p className="mt-12 font-sans text-sm">
        <Link href="/reviews" className="text-accent hover:underline">
          Browse all reviews
        </Link>
      </p>
    </div>
  );
}
