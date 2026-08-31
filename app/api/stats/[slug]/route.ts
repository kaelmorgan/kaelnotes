import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isKnownReviewSlug } from "@/lib/content";
import { getStats, incrementLikes, incrementViews } from "@/lib/stats";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const actions = new Set(["view", "like", "unlike"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAutomatedBrowser(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i.test(
    userAgent,
  );
}

function revalidateStatsPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/guides");
  revalidatePath("/search");
  revalidatePath(`/reviews/${slug}`);
  revalidatePath(`/guides/${slug}`);
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!isKnownReviewSlug(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(await getStats(slug));
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

  try {
    if (action === "view") {
      const stats = isAutomatedBrowser(request)
        ? await getStats(slug)
        : await incrementViews(slug);
      revalidateStatsPaths(slug);
      return NextResponse.json(stats);
    }

    if (action === "like") {
      const stats = await incrementLikes(slug, 1);
      revalidateStatsPaths(slug);
      return NextResponse.json(stats);
    }

    const stats = await incrementLikes(slug, -1);
    revalidateStatsPaths(slug);
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
