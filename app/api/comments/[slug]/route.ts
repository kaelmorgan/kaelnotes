import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isKnownReviewSlug } from "@/lib/content";
import {
  addComment,
  getComments,
  sanitizeCommentInput,
} from "@/lib/comments";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cooldownCookie(slug: string) {
  return `kn_c_${slug}`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!isKnownReviewSlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ comments: await getComments(slug) });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!isKnownReviewSlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let payload: { name?: unknown; body?: unknown; website?: unknown };
  try {
    payload = (await request.json()) as {
      name?: unknown;
      body?: unknown;
      website?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  const jar = await cookies();
  if (jar.get(cooldownCookie(slug))) {
    return NextResponse.json(
      { error: "Please wait a moment before posting another comment." },
      { status: 429 },
    );
  }

  const sanitized = sanitizeCommentInput(payload);
  if ("error" in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  const comment = await addComment(slug, sanitized);
  const response = NextResponse.json({ comment });
  response.cookies.set(cooldownCookie(slug), "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 20,
    path: "/",
  });
  return response;
}
