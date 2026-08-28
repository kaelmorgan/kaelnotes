import type { ReactNode } from "react";
import Link from "next/link";
import { AuthorAvatar } from "@/components/AuthorAvatar";
import { author } from "@/lib/site";

type AuthorBylineProps = {
  size?: "sm" | "md";
  linked?: boolean;
  children?: ReactNode;
};

export function AuthorByline({
  size = "md",
  linked = true,
  children,
}: AuthorBylineProps) {
  const compact = size === "sm";
  const nameClass = `font-sans font-medium text-ink ${
    compact ? "text-xs" : "text-sm"
  }`;

  const portrait = <AuthorAvatar size={size} />;
  const name = linked ? (
    <Link href={author.url} className={`${nameClass} hover:text-accent`}>
      {author.name}
    </Link>
  ) : (
    <p className={nameClass}>{author.name}</p>
  );

  return (
    <div className={`flex min-w-0 items-center ${compact ? "gap-2" : "gap-3"}`}>
      {linked ? (
        <Link
          href={author.url}
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`About ${author.name}`}
        >
          {portrait}
        </Link>
      ) : (
        portrait
      )}
      <div className="min-w-0">
        {name}
        {children ? (
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-muted ${
              compact ? "mt-0 text-xs" : "mt-0.5 text-sm"
            }`}
          >
            {children}
          </div>
        ) : (
          <p className="font-sans text-xs text-muted">
            {author.role}, {author.location}
          </p>
        )}
      </div>
    </div>
  );
}
