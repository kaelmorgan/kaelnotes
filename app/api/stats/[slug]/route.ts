import { NextResponse } from "next/server";
import { isKnownReviewSlug } from "@/lib/content";
import { getStats, incrementLikes, incrementViews } from "@/lib/stats";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const actions = new Set(["view", "like", "unlike"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieName(kind: "v" | "l", slug: string) {
  return `kn_${kind}_${slug}`;
}

function hasCookie(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) {
    return false;
  }
  return header.split(";").some((part) => part.trim().startsWith(`${name}=`));
}

function withViewerFloor(
  stats: { views: number; likes: number },
  viewed: boolean,
  liked: boolean,
) {
  return {
    views: viewed ? Math.max(stats.views, 1) : stats.views,
    likes: liked ? Math.max(stats.likes, 1) : stats.likes,
  };
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!isKnownReviewSlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const stats = await getStats(slug);
  return NextResponse.json(
    withViewerFloor(
      stats,
      hasCookie(request, cookieName("v", slug)),
      hasCookie(request, cookieName("l", slug)),
    ),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!isKnownReviewSlug(slug)) {
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

  const viewed = hasCookie(request, cookieName("v", slug));
  const liked = hasCookie(request, cookieName("l", slug));

  if (action === "view") {
    const stats = viewed ? await getStats(slug) : await incrementViews(slug);
    const response = NextResponse.json(withViewerFloor(stats, true, liked));
    response.cookies.set(cookieName("v", slug), "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  }

  if (action === "like") {
    const stats = liked ? await getStats(slug) : await incrementLikes(slug, 1);
    const response = NextResponse.json(withViewerFloor(stats, viewed, true));
    response.cookies.set(cookieName("l", slug), "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  }

  const stats = liked ? await incrementLikes(slug, -1) : await getStats(slug);
  const response = NextResponse.json(withViewerFloor(stats, viewed, false));
  response.cookies.set(cookieName("l", slug), "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
