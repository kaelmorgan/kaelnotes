"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/format";

type ViewCountProps = {
  slug: string;
  initialCount: number;
};

const viewRequests = new Map<string, Promise<number | null>>();

function recordView(slug: string) {
  const existing = viewRequests.get(slug);
  if (existing) {
    return existing;
  }

  const request = fetch(`/api/stats/${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "view" }),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { views?: number } | null) =>
      typeof data?.views === "number" ? data.views : null,
    )
    .catch(() => null);

  viewRequests.set(slug, request);
  return request;
}

export function ViewCount({ slug, initialCount }: ViewCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let active = true;
    setCount(initialCount);

    recordView(slug).then((views) => {
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
