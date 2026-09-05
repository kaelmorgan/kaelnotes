import { PageIntro } from "@/components/PageIntro";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description: "What Kael Notes is, what gets reviewed, and how the work is approached.",
  path: "/faq",
});

const faqs = [
  {
    question: "What is Kael Notes?",
    answer:
      "A reading-focused site for neutral, professional reviews of everyday subjects, with occasional longer guides. It is written by Kael Morgan from Singapore.",
  },
  {
    question: "What do you review?",
    answer:
      "Whatever earns a second look: travel, football, Formula 1, esports, and ordinary things that sit in daily life. The beat is curiosity, not a product calendar.",
  },
  {
    question: "How do you stay neutral?",
    answer:
      "By showing the working. A review should describe the thing, test it in ordinary conditions, and name the trade-offs. Preference is allowed; unexamined preference is not.",
  },
  {
    question: "Is the archive complete?",
    answer:
      "No. The first proper reviews are still being written. The site is live so the work has a home when it is ready.",
  },
  {
    question: "Why publish guides as well as reviews?",
    answer:
      "Reviews are close readings of a particular experience. Guides explain the standard behind them — starting with why a neutral, professional review matters.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <PageIntro kicker="FAQ" title="Questions, briefly answered" />
      <dl className="mt-12 divide-y divide-line border-y border-line">
        {faqs.map((item) => (
          <div key={item.question} className="py-8">
            <dt className="text-xl font-semibold tracking-tight">
              {item.question}
            </dt>
            <dd className="mt-3 text-lg leading-relaxed text-muted">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
