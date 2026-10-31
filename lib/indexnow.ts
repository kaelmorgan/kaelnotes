import { pageUrl, siteUrl } from "@/lib/site";

/** Default key for this site; override with INDEXNOW_KEY per deployment. */
export const defaultIndexNowKey = "cdf9ec529628bd35a87d54a64cf6f25d";

export function getIndexNowKey() {
  const key = (process.env.INDEXNOW_KEY ?? defaultIndexNowKey).trim();
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    throw new Error(
      "INDEXNOW_KEY must be 8–128 characters (letters, digits, hyphens only).",
    );
  }
  return key;
}

export function indexNowKeyFileUrl(key = getIndexNowKey()) {
  return pageUrl(`/${key}.txt`);
}

export function indexNowHost() {
  return new URL(siteUrl).host;
}

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;

export type IndexNowSubmitResult = {
  ok: boolean;
  status: number;
  submitted: number;
  endpoint: string;
};

export async function submitToIndexNow(
  urlList: string[],
  options: { key?: string } = {},
): Promise<IndexNowSubmitResult> {
  const key = options.key ?? getIndexNowKey();
  const host = indexNowHost();
  const keyLocation = indexNowKeyFileUrl(key);

  if (urlList.length === 0) {
    return {
      ok: true,
      status: 200,
      submitted: 0,
      endpoint: INDEXNOW_ENDPOINT,
    };
  }

  if (urlList.length > MAX_URLS_PER_REQUEST) {
    throw new Error(
      `IndexNow accepts at most ${MAX_URLS_PER_REQUEST} URLs per request.`,
    );
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation,
      urlList,
    }),
  });

  return {
    ok: response.ok,
    status: response.status,
    submitted: urlList.length,
    endpoint: INDEXNOW_ENDPOINT,
  };
}

export function isIndexNowSubmitAuthorized(request: Request) {
  const secret =
    process.env.INDEXNOW_SUBMIT_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) {
    return true;
  }

  return request.headers.get("x-indexnow-secret") === secret;
}
