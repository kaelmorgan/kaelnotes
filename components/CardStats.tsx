"use client";

import { useEffect, useState } from "react";
import { formatCount } from "@/lib/format";

type CardStatsProps = {
  slug: string;
  views: number;
  likes: number;
};

export function CardStats({ slug, views, likes }: CardStatsProps) {
  const [stats, setStats] = useState({ views, likes });

  useEffect(() => {
    setStats({ views, likes });

    let active = true;
    fetch(`/api/stats/${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { views?: number; likes?: number } | null) => {
        if (
          active &&
          data &&
          typeof data.views === "number" &&
          typeof data.likes === "number"
        ) {
          setStats({ views: data.views, likes: data.likes });
        }
      })
      .catch(() => {
        // Keep the server-rendered counts if the request fails.
      });

    return () => {
      active = false;
    };
  }, [slug, views, likes]);

  return (
    <span>
      {formatCount(stats.views)} views · {formatCount(stats.likes)} likes
    </span>
  );
}
