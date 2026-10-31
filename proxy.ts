import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultIndexNowKey, getIndexNowKey } from "@/lib/indexnow";

function resolveKey() {
  try {
    return getIndexNowKey();
  } catch {
    return defaultIndexNowKey;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.endsWith(".txt") || pathname === "/llms.txt") {
    return NextResponse.next();
  }

  const key = resolveKey();
  if (pathname !== `/${key}.txt`) {
    return NextResponse.next();
  }

  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

export const config = {
  matcher: ["/:filename.txt"],
};
