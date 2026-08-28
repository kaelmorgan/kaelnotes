"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReviewComment } from "@/lib/types";
import { formatCount } from "@/lib/format";

type CommentSectionProps = {
  slug: string;
  initialComments: ReviewComment[];
};

function formatCommentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function CommentSection({ slug, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const heading = useMemo(() => {
    const count = comments.length;
    if (count === 0) {
      return "Comments";
    }
    return `${formatCount(count)} ${count === 1 ? "comment" : "comments"}`;
  }, [comments.length]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body, website }),
      });
      const data = (await response.json()) as {
        comment?: ReviewComment;
        error?: string;
      };
      if (!response.ok || !data.comment) {
        throw new Error(data.error ?? "Could not post comment");
      }
      setComments((current) => [...current, data.comment!]);
      setBody("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not post comment",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="font-sans text-xs tracking-[0.16em] text-accent uppercase">
        {heading}
      </h2>
      <p className="mt-3 font-sans text-sm text-muted">
        Leave a considered note. Comments are public.
      </p>

      {comments.length === 0 ? (
        <p className="mt-8 text-muted">No comments yet.</p>
      ) : (
        <ol className="mt-8 space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="border-b border-line pb-6 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-sans text-sm font-medium text-ink">
                  {comment.name}
                </p>
                <time
                  dateTime={comment.createdAt}
                  className="font-sans text-xs text-muted"
                >
                  {formatCommentDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink">
                {comment.body}
              </p>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={onSubmit} className="relative mt-10">
        <div className="grid gap-4">
          <label className="grid gap-1.5 font-sans text-sm">
            <span className="text-muted">Name</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              autoComplete="name"
              className="rounded-md border border-line bg-paper-raised px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label>
              Website
              <input
                type="text"
                name="website"
                value={website}
                tabIndex={-1}
                autoComplete="off"
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>
          </div>
          <label className="grid gap-1.5 font-sans text-sm">
            <span className="text-muted">Comment</span>
            <textarea
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={2000}
              required
              rows={5}
              className="resize-y rounded-md border border-line bg-paper-raised px-3 py-2 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>
        </div>
        {error ? (
          <p className="mt-3 font-sans text-sm text-accent" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-4 inline-flex items-center rounded-full border border-accent bg-accent px-4 py-2 font-sans text-sm text-paper-raised transition-opacity disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post comment"}
        </button>
      </form>
    </section>
  );
}
