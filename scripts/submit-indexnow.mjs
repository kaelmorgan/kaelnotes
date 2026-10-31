#!/usr/bin/env node

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kaelnotes.com").replace(
  /\/$/,
  "",
);
const key = (process.env.INDEXNOW_KEY ?? "cdf9ec529628bd35a87d54a64cf6f25d").trim();
const secret =
  process.env.INDEXNOW_SUBMIT_SECRET?.trim() || process.env.CRON_SECRET?.trim();

async function urlsFromSitemap() {
  const response = await fetch(`${siteUrl}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`Could not fetch sitemap (${response.status})`);
  }
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

async function submitDirect(urlList) {
  const host = new URL(siteUrl).host;
  const keyLocation = `${siteUrl}/${key}.txt`;
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow API ${response.status}: ${body || response.statusText}`);
  }

  console.log(`Submitted ${urlList.length} URL(s) to IndexNow for ${host}.`);
}

async function submitViaApi(urlList) {
  const response = await fetch(`${siteUrl}/api/indexnow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls: urlList }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? `API ${response.status}`);
  }

  console.log(
    `Submitted ${payload.submitted ?? urlList.length} URL(s) via ${siteUrl}/api/indexnow.`,
  );
}

const urlList = await urlsFromSitemap();
if (urlList.length === 0) {
  console.error("No URLs found in sitemap.");
  process.exit(1);
}

if (secret) {
  await submitViaApi(urlList);
} else {
  await submitDirect(urlList);
}
