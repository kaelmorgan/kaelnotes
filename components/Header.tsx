import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-sans text-[0.95rem] font-semibold tracking-[0.14em] text-ink uppercase"
        >
          Kael Notes
        </Link>
        <form action="/search" method="get" className="ml-auto w-full max-w-xs">
          <label className="sr-only" htmlFor="site-search">
            Search reviews
          </label>
          <input
            id="site-search"
            type="search"
            name="q"
            placeholder="Search reviews"
            className="w-full rounded-full border border-line bg-paper-raised px-4 py-2 font-sans text-sm text-ink outline-none placeholder:text-muted/80 focus:border-accent"
          />
        </form>
      </div>
    </header>
  );
}
