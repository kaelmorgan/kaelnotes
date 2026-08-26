import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Guides",
  description: "Longer notes and practical pieces, published when they earn their length.",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <PageIntro kicker="Guides" title="Longer pieces, when they are ready">
        <p>
          Guides will live here: slower, practical writing meant to be found and
          reused. Nothing is published yet.
        </p>
      </PageIntro>
      <p className="mt-16 rounded-xl border border-dashed border-line bg-paper-raised px-6 py-16 text-center text-muted">
        Nothing published yet.
      </p>
    </div>
  );
}
