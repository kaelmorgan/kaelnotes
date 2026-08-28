import type { MetadataRoute } from "next";
import { pageUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai"],
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: pageUrl("/sitemap.xml"),
    host: pageUrl("/").replace(/^https?:\/\//, ""),
  };
}
