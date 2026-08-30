"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/format";

type ViewCountProps = {
  slug: string;
  initialCount: number;
};

const inFlight = new Map<string, Promise<number | null>>();

function storageKey(slug: string) {
  return `kaelnotes:viewed:${slug}`;
}

function loadStats(slug: string, alreadyViewed: boolean) {
  const existing = inFlight.get(slug);
  if (existing) {
    return existing;
  }

  const request = fetch(`/api/stats/${encodeURIComponent(slug)}`, {
    method: alreadyViewed ? "GET" : "POST",
    headers: alreadyViewed ? undefined : { "Content-Type": "application/json" },
    body: alreadyViewed ? undefined : JSON.stringify({ action: "view" }),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { views?: number } | null) => {
      if (!alreadyViewed) {
        window.localStorage.setItem(storageKey(slug), "1");
      }
      return typeof data?.views === "number" ? data.views : null;
    })
    .catch(() => null);

  inFlight.set(slug, request);
  return request;
}

export function ViewCount({ slug, initialCount }: ViewCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let active = true;
    setCount(initialCount);

    const alreadyViewed = window.localStorage.getItem(storageKey(slug)) === "1";
    loadStats(slug, alreadyViewed).then((views) => {
      if (active && typeof views === "number") {
        setCount(views);
      }
    });

    return () => {
      active = false;
    };
  }, [slug, initialCount]);

  return (
    <span>
      {formatCount(count)} {count === 1 ? "view" : "views"}
    </span>
  );
}
