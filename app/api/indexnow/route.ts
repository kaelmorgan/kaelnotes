import { NextResponse } from "next/server";
import {
  getIndexNowKey,
  indexNowKeyFileUrl,
  isIndexNowSubmitAuthorized,
  submitToIndexNow,
} from "@/lib/indexnow";
import { getAllIndexableUrls } from "@/lib/sitemap-urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = getIndexNowKey();
  return NextResponse.json({
    keyFile: indexNowKeyFileUrl(key),
    urlCount: getAllIndexableUrls().length,
  });
}

export async function POST(request: Request) {
  if (!isIndexNowSubmitAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let urlList: string[] | undefined;
  try {
    const body = (await request.json()) as { urls?: string[] };
    if (Array.isArray(body.urls) && body.urls.length > 0) {
      urlList = body.urls;
    }
  } catch {
    // Empty body: submit full sitemap.
  }

  const urls = urlList ?? getAllIndexableUrls();

  try {
    const result = await submitToIndexNow(urls);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "IndexNow API rejected the submission",
          status: result.status,
          submitted: result.submitted,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      submitted: result.submitted,
      status: result.status,
      endpoint: result.endpoint,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "IndexNow submission failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
