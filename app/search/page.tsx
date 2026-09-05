import { PageIntro } from "@/components/PageIntro";
import { ReviewCard } from "@/components/ReviewCard";
import { searchGuides, searchReviews } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { attachStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata({
    title: "Search",
    description: "Search reviews and guides on Kael Notes.",
    path: "/search",
  }),
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const [reviews, guides] = await Promise.all([
    attachStats(searchReviews(query)),
    attachStats(searchGuides(query)),
  ]);
  const total = reviews.length + guides.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageIntro kicker="Search" title={query ? `Results for “${query}”` : "Search reviews and guides"}>
        {query ? (
          <p>
            {total === 0
              ? "Nothing matched that phrase."
              : `${total} ${total === 1 ? "result" : "results"} found.`}
          </p>
        ) : (
          <p>Use the search field in the header to look through titles, excerpts, categories, and tags.</p>
        )}
      </PageIntro>

      {reviews.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 font-sans text-xs tracking-[0.16em] text-accent uppercase">
            Reviews
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.slug} review={review} />
            ))}
          </div>
        </section>
      ) : null}

      {guides.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 font-sans text-xs tracking-[0.16em] text-accent uppercase">
            Guides
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <ReviewCard
                key={guide.slug}
                review={guide}
                href={`/guides/${guide.slug}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
