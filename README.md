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

## Write a guide

Add a Markdown/MDX file under `content/guides/` with the same frontmatter as a review, plus an optional `faqs` list for the FAQ block and schema markup:

```yaml
seoTitle: Optional SEO title (under ~60 characters)
seoDescription: Optional meta description (under ~160 characters)
faqs:
  - question: A question a reader or model might ask
    answer: A direct answer in one or two sentences.
```

The URL is `/guides/{slug}`.

## Deploy on Vercel

1. Push this repository to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com), import the project. Framework preset: **Next.js**.
3. Leave the build command as `next build` and the output as the default.
4. Add a new `.mdx` review, commit, and redeploy — or preview the branch first.

View and like totals live in a JSON map of `slug → { views, likes }`:

- Locally: `data/stats.json`
- Production: Vercel Blob at `engagement/review-stats.json` when `BLOB_READ_WRITE_TOKEN` is set

Create a Blob store in the Vercel project so that token is injected automatically. MDX frontmatter stays at 0; live counts are overlaid when pages load. A browser records one view per review in `localStorage` (`kaelnotes:viewed:<slug>`). Likes are also per-browser (`kaelnotes:liked:<slug>`).
