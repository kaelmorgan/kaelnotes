import fs from "fs";
import path from "path";
import { connection } from "next/server";
import type { ReviewSummary } from "./types";

export type ReviewStats = {
  views: number;
  likes: number;
};

const HASH_KEY = "kn:stats";

function statsFilePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "kaelnotes-stats.json");
  }
  return path.join(process.cwd(), "data", "stats.json");
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand(args: (string | number)[]) {
  const config = redisConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Stats store error ${response.status}`);
  }

  const payload = (await response.json()) as { result: unknown };
  return payload.result;
}

function parseHash(result: unknown): Record<string, ReviewStats> {
  const pairs: [string, string][] = [];

  if (Array.isArray(result)) {
    for (let i = 0; i < result.length; i += 2) {
      pairs.push([String(result[i]), String(result[i + 1] ?? "0")]);
    }
  } else if (result && typeof result === "object") {
    for (const [field, value] of Object.entries(result)) {
      pairs.push([field, String(value)]);
    }
  }

  const stats: Record<string, ReviewStats> = {};
  for (const [field, value] of pairs) {
    const separator = field.lastIndexOf(":");
    if (separator === -1) {
      continue;
    }
    const slug = field.slice(0, separator);
    const kind = field.slice(separator + 1);
    const current = stats[slug] ?? { views: 0, likes: 0 };
    const amount = Number(value) || 0;
    if (kind === "views") {
      current.views = amount;
    }
    if (kind === "likes") {
      current.likes = Math.max(0, amount);
    }
    stats[slug] = current;
  }
  return stats;
}

function readFileStats(): Record<string, ReviewStats> {
  try {
    const raw = fs.readFileSync(statsFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Record<string, Partial<ReviewStats>>;
    const stats: Record<string, ReviewStats> = {};
    for (const [slug, value] of Object.entries(parsed)) {
      stats[slug] = {
        views: Number(value.views) || 0,
        likes: Math.max(0, Number(value.likes) || 0),
      };
    }
    return stats;
  } catch {
    return {};
  }
}

let fileWriteQueue: Promise<void> = Promise.resolve();

function withFileLock<T>(fn: () => T): Promise<T> {
  const next = fileWriteQueue.then(fn, fn);
  fileWriteQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function writeFileStats(stats: Record<string, ReviewStats>) {
  const filePath = statsFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(stats, null, 2)}\n`);
}

export async function getAllStats(): Promise<Record<string, ReviewStats>> {
  await connection();
  if (redisConfig()) {
    const result = await redisCommand(["HGETALL", HASH_KEY]);
    return parseHash(result);
  }
  return readFileStats();
}

export async function getStats(slug: string): Promise<ReviewStats> {
  const all = await getAllStats();
  return all[slug] ?? { views: 0, likes: 0 };
}

export async function incrementViews(slug: string): Promise<ReviewStats> {
  if (redisConfig()) {
    await redisCommand(["HINCRBY", HASH_KEY, `${slug}:views`, 1]);
    return getStats(slug);
  }

  return withFileLock(() => {
    const stats = readFileStats();
    const current = stats[slug] ?? { views: 0, likes: 0 };
    current.views += 1;
    stats[slug] = current;
    writeFileStats(stats);
    return current;
  });
}

export async function incrementLikes(
  slug: string,
  delta: 1 | -1,
): Promise<ReviewStats> {
  if (redisConfig()) {
    await redisCommand(["HINCRBY", HASH_KEY, `${slug}:likes`, delta]);
    const next = await getStats(slug);
    if (next.likes < 0) {
      await redisCommand(["HSET", HASH_KEY, `${slug}:likes`, 0]);
      return { ...next, likes: 0 };
    }
    return next;
  }

  return withFileLock(() => {
    const stats = readFileStats();
    const current = stats[slug] ?? { views: 0, likes: 0 };
    current.likes = Math.max(0, current.likes + delta);
    stats[slug] = current;
    writeFileStats(stats);
    return current;
  });
}

export async function attachStats<T extends ReviewSummary>(reviews: T[]): Promise<T[]> {
  const stats = await getAllStats();
  return reviews.map((review) => {
    const live = stats[review.slug];
    if (!live) {
      return { ...review, viewCount: 0, likeCount: 0 };
    }
    return {
      ...review,
      viewCount: live.views,
      likeCount: live.likes,
    };
  });
}
