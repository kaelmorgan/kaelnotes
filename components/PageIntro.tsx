import type { ReactNode } from "react";

type PageIntroProps = {
  kicker?: string;
  title: string;
  children?: ReactNode;
};

export function PageIntro({ kicker, title, children }: PageIntroProps) {
  return (
    <header className="mx-auto w-full max-w-3xl">
      {kicker ? (
        <p className="font-sans text-xs tracking-[0.16em] text-accent uppercase">
          {kicker}
        </p>
      ) : null}
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {children ? (
        <div className="mt-5 text-lg leading-relaxed text-muted">{children}</div>
      ) : null}
    </header>
  );
}
