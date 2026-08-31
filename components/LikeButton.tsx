"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/format";

type LikeButtonProps = {
  slug: string;
  initialCount: number;
};

function storageKey(slug: string) {
  return `kaelnotes:liked:${slug}`;
}

export function LikeButton({ slug, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    const storedLiked = window.localStorage.getItem(storageKey(slug)) === "1";
    setLiked(storedLiked);
    setCount(initialCount);

    if (!storedLiked || initialCount > 0) {
      return;
    }

    fetch(`/api/stats/${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then(async (data: { likes?: number } | null) => {
        if (!active) {
          return;
        }
        if (typeof data?.likes === "number" && data.likes > 0) {
          setCount(data.likes);
          return;
        }
        const response = await fetch(`/api/stats/${encodeURIComponent(slug)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "like" }),
        });
        if (!response.ok) {
          return;
        }
        const next = (await response.json()) as { likes?: number };
        if (active && typeof next.likes === "number") {
          setCount(next.likes);
        }
      })
      .catch(() => {
        // Keep the last known count if the request fails.
      });

    return () => {
      active = false;
    };
  }, [slug, initialCount]);

  async function toggle() {
    if (pending) {
      return;
    }

    const nextLiked = !liked;
    setPending(true);
    setLiked(nextLiked);
    setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)));
    window.localStorage.setItem(storageKey(slug), nextLiked ? "1" : "0");

    try {
      const response = await fetch(`/api/stats/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextLiked ? "like" : "unlike" }),
      });
      if (!response.ok) {
        throw new Error("Could not update like");
      }
      const data = (await response.json()) as { likes: number };
      setCount(data.likes);
    } catch {
      setLiked(!nextLiked);
      setCount((current) => Math.max(0, current + (nextLiked ? -1 : 1)));
      window.localStorage.setItem(storageKey(slug), nextLiked ? "0" : "1");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-sans text-sm transition-colors ${
        liked
          ? "border-accent bg-accent-soft text-accent"
          : "border-line bg-paper-raised text-muted hover:border-accent hover:text-ink"
      }`}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      {formatCount(count)} {count === 1 ? "like" : "likes"}
    </button>
  );
}
