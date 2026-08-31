import fs from "fs";
import path from "path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { connection } from "next/server";
import type { ReviewSummary } from "./types";

export type ReviewStats = {
  views: number;
  likes: number;
};

type StatsSnapshot = {
  stats: Record<string, ReviewStats>;
  etag?: string;
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
  for (const [slug, entry] of Object.entries(
    value as Record<string, Partial<ReviewStats>>,
  )) {
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

async function readBlobByAccess(access: "public" | "private") {
  const result = await get(BLOB_PATH, { access, useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }
  const text = await new Response(result.stream).text();
  return {
    stats: parseStatsMap(JSON.parse(text)),
    etag: result.blob.etag,
  } satisfies StatsSnapshot;
}

async function readBlobSnapshot(): Promise<StatsSnapshot> {
  try {
    return (await readBlobByAccess("public")) ?? { stats: {} };
  } catch {
    try {
      return (await readBlobByAccess("private")) ?? { stats: {} };
    } catch {
      return { stats: {} };
    }
  }
}

async function writeBlobStats(stats: Record<string, ReviewStats>, etag?: string) {
  await put(BLOB_PATH, JSON.stringify(stats), {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    contentType: "application/json",
    ...(etag ? { ifMatch: etag } : {}),
  });
}

async function loadAll(): Promise<Record<string, ReviewStats>> {
  if (useBlobStore()) {
    const snapshot = await readBlobSnapshot();
    return snapshot.stats;
  }
  return readFileStats();
}

async function saveAll(stats: Record<string, ReviewStats>) {
  if (useBlobStore()) {
    await writeBlobStats(stats);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN. Create a Blob store in the Vercel project.",
    );
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
    if (useBlobStore()) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const snapshot = await readBlobSnapshot();
        const next = mutate(snapshot.stats[slug] ?? emptyStats());
        snapshot.stats[slug] = next;
        try {
          await writeBlobStats(snapshot.stats, snapshot.etag);
          return next;
        } catch (error) {
          if (error instanceof BlobPreconditionFailedError) {
            continue;
          }
          throw error;
        }
      }
      throw new Error("Could not update stats");
    }

    const all = readFileStats();
    const next = mutate(all[slug] ?? emptyStats());
    all[slug] = next;
    writeFileStats(all);
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
