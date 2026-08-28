import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { ReviewComment } from "./types";

export type { ReviewComment };

const NAME_MAX = 80;
const BODY_MAX = 2000;
const LIST_PREFIX = "kn:comments:";

function commentsFilePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "kaelnotes-comments.json");
  }
  return path.join(process.cwd(), "data", "comments.json");
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
    throw new Error(`Comments store error ${response.status}`);
  }

  const payload = (await response.json()) as { result: unknown };
  return payload.result;
}

function listKey(slug: string) {
  return `${LIST_PREFIX}${slug}`;
}

function parseComment(value: unknown): ReviewComment | null {
  if (!value) {
    return null;
  }

  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const record = parsed as Partial<ReviewComment>;
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.body !== "string" ||
    typeof record.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    name: record.name,
    body: record.body,
    createdAt: record.createdAt,
  };
}

function readFileComments(): Record<string, ReviewComment[]> {
  try {
    const raw = fs.readFileSync(commentsFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const comments: Record<string, ReviewComment[]> = {};
    for (const [slug, value] of Object.entries(parsed)) {
      if (!Array.isArray(value)) {
        continue;
      }
      comments[slug] = value
        .map((item) => parseComment(item))
        .filter((item): item is ReviewComment => item !== null);
    }
    return comments;
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

function writeFileComments(comments: Record<string, ReviewComment[]>) {
  const filePath = commentsFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(comments, null, 2)}\n`);
}

export function sanitizeCommentInput(input: {
  name?: unknown;
  body?: unknown;
}): { name: string; body: string } | { error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";

  if (!name) {
    return { error: "Please add your name." };
  }
  if (name.length > NAME_MAX) {
    return { error: `Name must be ${NAME_MAX} characters or fewer.` };
  }
  if (!body) {
    return { error: "Please write a comment." };
  }
  if (body.length > BODY_MAX) {
    return { error: `Comment must be ${BODY_MAX} characters or fewer.` };
  }

  return { name, body };
}

export async function getComments(slug: string): Promise<ReviewComment[]> {
  if (redisConfig()) {
    const result = await redisCommand(["LRANGE", listKey(slug), 0, -1]);
    if (!Array.isArray(result)) {
      return [];
    }
    return result
      .map((item) => parseComment(item))
      .filter((item): item is ReviewComment => item !== null);
  }

  return readFileComments()[slug] ?? [];
}

export async function addComment(
  slug: string,
  input: { name: string; body: string },
): Promise<ReviewComment> {
  const comment: ReviewComment = {
    id: randomUUID(),
    name: input.name,
    body: input.body,
    createdAt: new Date().toISOString(),
  };

  if (redisConfig()) {
    await redisCommand(["RPUSH", listKey(slug), JSON.stringify(comment)]);
    return comment;
  }

  return withFileLock(() => {
    const all = readFileComments();
    const existing = all[slug] ?? [];
    all[slug] = [...existing, comment];
    writeFileComments(all);
    return comment;
  });
}
