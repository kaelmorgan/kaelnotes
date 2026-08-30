import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { ReviewCard } from "@/components/ReviewCard";
import { getGuideSummaries } from "@/lib/content";
import { pageUrl } from "@/lib/site";
import { attachStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

const title = "Guides";
const description =
  "Longer notes on how Kael Notes writes: why a neutral professional review matters, and how to read practical reviews without the hype.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl("/guides") },
  openGraph: {
    type: "website",
    title,
    description,
    url: pageUrl("/guides"),
    siteName: "Kael Notes",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default async function GuidesPage() {
  const guides = await attachStats(getGuideSummaries());

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <PageIntro kicker="Guides" title="Guides for professional, neutral reviews">
        <p>
          Longer pieces on method and judgement — written so a reader, a search
          engine, and a language model can all see the working.
        </p>
      </PageIntro>

      {guides.length === 0 ? (
        <p className="mt-16 rounded-xl border border-dashed border-line bg-paper-raised px-6 py-16 text-center text-muted">
          Nothing published yet.
        </p>
      ) : (
        <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <ReviewCard
              key={guide.slug}
              review={guide}
              href={`/guides/${guide.slug}`}
            />
          ))}
        </section>
      )}
    </div>
  );
}
