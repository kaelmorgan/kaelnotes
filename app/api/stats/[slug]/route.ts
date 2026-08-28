import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getReviewBySlug } from "@/lib/content";
import { getStats, incrementLikes, incrementViews } from "@/lib/stats";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const actions = new Set(["view", "like", "unlike"]);

function cookieName(kind: "v" | "l", slug: string) {
  return `kn_${kind}_${slug}`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!getReviewBySlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(await getStats(slug));
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!getReviewBySlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let action: string;
  try {
    const body = (await request.json()) as { action?: string };
    action = body.action ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!actions.has(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const jar = await cookies();

  if (action === "view") {
    if (!jar.get(cookieName("v", slug))) {
      const stats = await incrementViews(slug);
      const response = NextResponse.json(stats);
      response.cookies.set(cookieName("v", slug), "1", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
      return response;
    }
    return NextResponse.json(await getStats(slug));
  }

  const liked = Boolean(jar.get(cookieName("l", slug)));

  if (action === "like") {
    const stats = liked ? await getStats(slug) : await incrementLikes(slug, 1);
    const response = NextResponse.json(stats);
    response.cookies.set(cookieName("l", slug), "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  }

  const stats = liked ? await incrementLikes(slug, -1) : await getStats(slug);
  const response = NextResponse.json(stats);
  response.cookies.set(cookieName("l", slug), "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
