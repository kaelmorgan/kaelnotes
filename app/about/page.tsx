import { AuthorAvatar } from "@/components/AuthorAvatar";
import { PageIntro } from "@/components/PageIntro";
import { pageMetadata } from "@/lib/seo";
import { author } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Kael Morgan, a writer based in Singapore, on Kael Notes and the habit of looking closely.",
  path: "/about",
  image: author.image,
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex items-start gap-5 sm:gap-6">
        <AuthorAvatar size="lg" alt={author.name} />
        <div className="min-w-0 flex-1">
          <PageIntro kicker="About" title="Kael Morgan">
            <p>A writer based in Singapore.</p>
          </PageIntro>
        </div>
      </div>
      <div className="article-prose mt-10">
        <p>
          I am Kael Morgan, a writer based in Singapore. I follow the world with
          close attention and use this space to share considered views on
          subjects I find worth examining — from everyday objects to the stories
          that sit behind them.
        </p>
        <p>
          Kael Notes is built for <strong>neutral, professional reviews</strong>:
          what something is, how it holds up, and where the trade-offs are. I
          would rather be precise than loud.
        </p>
        <p>
          Travel, football, Formula 1, and esports are constant companions. I
          like to research, to compare, and to sit with a topic until I
          understand it. I believe knowledge is the surest path to
          self-reliance.
        </p>
      </div>
    </div>
  );
}
