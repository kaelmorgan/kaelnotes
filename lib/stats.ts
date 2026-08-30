import fs from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import { connection } from "next/server";
import type { ReviewSummary } from "./types";

export type ReviewStats = {
  views: number;
  likes: number;
};

const BLOB_PATH = "engagement/review-stats.json";

function localStatsPath() {
  return path.join(process.cwd(), "data", "stats.json");
}

function useBlobStore() {
  return (
    process.env.NODE_ENV === "production" &&
    Boolean(process.env.BLOB_READ_WRITE_TOKEN)
  );
}

function emptyStats(): ReviewStats {
  return { views: 0, likes: 0 };
}

function parseStatsMap(value: unknown): Record<string, ReviewStats> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const stats: Record<string, ReviewStats> = {};
  for (const [slug, entry] of Object.entries(value as Record<string, Partial<ReviewStats>>)) {
    stats[slug] = {
      views: Number(entry?.views) || 0,
      likes: Math.max(0, Number(entry?.likes) || 0),
    };
  }
  return stats;
}

function readFileStats(): Record<string, ReviewStats> {
  try {
    const raw = fs.readFileSync(localStatsPath(), "utf8");
    return parseStatsMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeFileStats(stats: Record<string, ReviewStats>) {
  const filePath = localStatsPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(stats, null, 2)}\n`);
}

async function readBlobStats(): Promise<Record<string, ReviewStats>> {
  try {
    const result = await get(BLOB_PATH, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return {};
    }
    const text = await new Response(result.stream).text();
    return parseStatsMap(JSON.parse(text));
  } catch {
    return {};
  }
}

async function writeBlobStats(stats: Record<string, ReviewStats>) {
  await put(BLOB_PATH, JSON.stringify(stats), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
    contentType: "application/json",
  });
}

async function loadAll(): Promise<Record<string, ReviewStats>> {
  if (useBlobStore()) {
    return readBlobStats();
  }
  return readFileStats();
}

async function saveAll(stats: Record<string, ReviewStats>) {
  if (useBlobStore()) {
    await writeBlobStats(stats);
    return;
  }
  writeFileStats(stats);
}

let writeQueue: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function updateSlug(
  slug: string,
  mutate: (current: ReviewStats) => ReviewStats,
): Promise<ReviewStats> {
  return withLock(async () => {
    const all = await loadAll();
    const next = mutate(all[slug] ?? emptyStats());
    all[slug] = next;
    await saveAll(all);
    return next;
  });
}

export async function getAllStats(): Promise<Record<string, ReviewStats>> {
  return loadAll();
}

export async function getStats(slug: string): Promise<ReviewStats> {
  const all = await loadAll();
  return all[slug] ?? emptyStats();
}

export async function incrementViews(slug: string): Promise<ReviewStats> {
  return updateSlug(slug, (current) => ({
    ...current,
    views: current.views + 1,
  }));
}

export async function incrementLikes(
  slug: string,
  delta: 1 | -1,
): Promise<ReviewStats> {
  return updateSlug(slug, (current) => ({
    ...current,
    likes: Math.max(0, current.likes + delta),
  }));
}

export async function attachStats<T extends ReviewSummary>(
  reviews: T[],
): Promise<T[]> {
  await connection();
  const stats = await getAllStats();

  return reviews.map((review) => {
    const live = stats[review.slug] ?? emptyStats();
    return {
      ...review,
      viewCount: live.views,
      likeCount: live.likes,
    };
  });
}
