import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**": ["./content/reviews/**/*", "./content/guides/**/*"],
  },
};

export default nextConfig;
