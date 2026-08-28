# Kael Notes

Personal review site for [kaelnotes.com](https://kaelnotes.com): calm, reading-focused notes by Kael Morgan.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Write a review

Add a Markdown/MDX file under `content/reviews/` with frontmatter:

```yaml
title: Your title
slug: url-handle
excerpt: One or two sentences.
category: Travel
tags:
  - example
seoTitle: Optional SEO title
seoDescription: Optional meta description
publishedAt: "2026-08-26"
```

The body of the file is the article. Restart or refresh the dev server after adding a file.

Guides will later live in `content/guides/`. That section is empty for now.

## Deploy on Vercel

1. Push this repository to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com), import the project. Framework preset: **Next.js**.
3. Leave the build command as `next build` and the output as the default.
4. Add a new `.mdx` review, commit, and redeploy — or preview the branch first.

View and like counts are stored on the server. Locally they are written to `data/stats.json`. On Vercel the filesystem is ephemeral, so add an Upstash Redis (or Vercel KV) store and set either:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`
