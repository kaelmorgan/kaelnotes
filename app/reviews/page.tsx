import type { Metadata } from "next";
import { Pagination } from "@/components/Pagination";
import { PageIntro } from "@/components/PageIntro";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewsToolbar } from "@/components/ReviewsToolbar";
import {
  filterAndSortReviews,
  getCategories,
  getReviewSummaries,
  type ReviewSort,
} from "@/lib/content";
import { attachStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description: "All reviews published on Kael Notes, with filters by category.",
};

const pageSizes = [6, 9, 12, 24];

function parseSort(value: string | undefined): ReviewSort {
  if (value === "views" || value === "likes" || value === "latest") {
    return value;
  }
  return "latest";
}

function parsePerPage(value: string | undefined) {
  const parsed = Number(value);
  return pageSizes.includes(parsed) ? parsed : 9;
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sort = parseSort(typeof params.sort === "string" ? params.sort : undefined);
  const perPage = parsePerPage(
    typeof params.perPage === "string" ? params.perPage : undefined,
  );
  const page = Math.max(
    1,
    Number(typeof params.page === "string" ? params.page : "1") || 1,
  );

  const all = await attachStats(getReviewSummaries());
  const filtered = filterAndSortReviews(all, { category, sort });
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  function hrefForPage(nextPage: number) {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (sort !== "latest") query.set("sort", sort);
    if (perPage !== 9) query.set("perPage", String(perPage));
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/reviews?${qs}` : "/reviews";
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageIntro kicker="Archive" title="Reviews">
        <p>A growing list. Filter by subject, then read at the pace the piece deserves.</p>
      </PageIntro>

      <div className="mt-10">
        <ReviewsToolbar
          categories={getCategories(all)}
          category={category}
          sort={sort}
          perPage={perPage}
        />
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 text-muted">No reviews match those filters yet.</p>
      ) : (
        <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((review) => (
            <ReviewCard key={review.slug} review={review} />
          ))}
        </section>
      )}

      <Pagination
        page={currentPage}
        pageCount={filtered.length === 0 ? 0 : pageCount}
        hrefForPage={hrefForPage}
      />
    </div>
  );
}
