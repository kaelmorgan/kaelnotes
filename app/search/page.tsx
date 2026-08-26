import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { ReviewCard } from "@/components/ReviewCard";
import { searchReviews } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search reviews on Kael Notes.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const results = searchReviews(query);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageIntro kicker="Search" title={query ? `Results for “${query}”` : "Search reviews"}>
        {query ? (
          <p>
            {results.length === 0
              ? "No reviews matched that phrase."
              : `${results.length} ${results.length === 1 ? "review" : "reviews"} found.`}
          </p>
        ) : (
          <p>Use the search field in the header to look through titles, excerpts, categories, and tags.</p>
        )}
      </PageIntro>

      {results.length > 0 ? (
        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
