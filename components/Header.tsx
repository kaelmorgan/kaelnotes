import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          aria-label="Kael Notes home"
          className="shrink-0 rounded-sm outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Logo />
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
