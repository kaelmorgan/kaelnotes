import Link from "next/link";

type PaginationProps = {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
};

export function Pagination({ page, pageCount, hrefForPage }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-3 font-sans text-sm"
    >
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} className="text-muted hover:text-ink">
          Previous
        </Link>
      ) : (
        <span className="text-line">Previous</span>
      )}
      <span className="text-muted">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefForPage(page + 1)} className="text-muted hover:text-ink">
          Next
        </Link>
      ) : (
        <span className="text-line">Next</span>
      )}
    </nav>
  );
}
