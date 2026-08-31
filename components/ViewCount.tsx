"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/format";

type ViewCountProps = {
  slug: string;
  initialCount: number;
};

function storageKey(slug: string) {
  return `kaelnotes:viewed:${slug}`;
}

async function fetchViews(slug: string, method: "GET" | "POST") {
  const response = await fetch(`/api/stats/${encodeURIComponent(slug)}`, {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
    body: method === "POST" ? JSON.stringify({ action: "view" }) : undefined,
  });
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { views?: number };
  return typeof data.views === "number" ? data.views : null;
}

export function ViewCount({ slug, initialCount }: ViewCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let active = true;
    setCount(initialCount);

    const alreadyCounted =
      window.localStorage.getItem(storageKey(slug)) === "1";

    (async () => {
      if (alreadyCounted) {
        const views = await fetchViews(slug, "GET");
        if (active && views !== null) {
          setCount(views);
        }
        return;
      }

      const views = await fetchViews(slug, "POST");
      if (views === null) {
        return;
      }
      window.localStorage.setItem(storageKey(slug), "1");
      if (active) {
        setCount(views);
      }
    })();

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
