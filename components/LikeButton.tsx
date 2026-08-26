"use client";

import { useSyncExternalStore } from "react";
import { formatCount } from "@/lib/format";

type LikeButtonProps = {
  slug: string;
  initialCount: number;
};

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function storageKey(slug: string) {
  return `kaelnotes:liked:${slug}`;
}

function isLiked(slug: string) {
  return window.localStorage.getItem(storageKey(slug)) === "1";
}

export function LikeButton({ slug, initialCount }: LikeButtonProps) {
  const liked = useSyncExternalStore(
    subscribe,
    () => isLiked(slug),
    () => false,
  );

  const count = initialCount + (liked ? 1 : 0);

  function toggle() {
    window.localStorage.setItem(storageKey(slug), liked ? "0" : "1");
    emit();
  }

  return (
    <button
      type="button"
      onClick={toggle}
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
