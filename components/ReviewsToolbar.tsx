import Link from "next/link";
import type { ReviewSort } from "@/lib/content";

type ReviewsToolbarProps = {
  categories: string[];
  category?: string;
  sort: ReviewSort;
  perPage: number;
};

const sortOptions: { value: ReviewSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "views", label: "Most viewed" },
  { value: "likes", label: "Most liked" },
];

const pageSizes = [6, 9, 12, 24];

function hrefFor(next: {
  category?: string;
  sort: ReviewSort;
  perPage: number;
}) {
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.sort !== "latest") params.set("sort", next.sort);
  if (next.perPage !== 9) params.set("perPage", String(next.perPage));
  const query = params.toString();
  return query ? `/reviews?${query}` : "/reviews";
}

export function ReviewsToolbar({
  categories,
  category,
  sort,
  perPage,
}: ReviewsToolbarProps) {
  return (
    <div className="flex flex-col gap-5">
      <form
        action="/reviews"
        method="get"
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 font-sans text-xs tracking-wide text-muted uppercase">
          Category
          <select
            name="category"
            defaultValue={category ?? ""}
            className="rounded-md border border-line bg-paper-raised px-3 py-2 text-sm text-ink normal-case"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-40 flex-1 flex-col gap-1.5 font-sans text-xs tracking-wide text-muted uppercase">
          Sort
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-md border border-line bg-paper-raised px-3 py-2 text-sm text-ink normal-case"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-32 flex-col gap-1.5 font-sans text-xs tracking-wide text-muted uppercase">
          Per page
          <select
            name="perPage"
            defaultValue={String(perPage)}
            className="rounded-md border border-line bg-paper-raised px-3 py-2 text-sm text-ink normal-case"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-ink px-4 py-2 font-sans text-sm text-paper-raised hover:bg-accent"
        >
          Apply
        </button>
      </form>
      {(category || sort !== "latest") && (
        <p className="font-sans text-sm text-muted">
          <Link href={hrefFor({ sort: "latest", perPage })} className="underline-offset-2 hover:text-ink hover:underline">
            Clear filters
          </Link>
        </p>
      )}
    </div>
  );
}
