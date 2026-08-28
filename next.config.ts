import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**": ["./content/reviews/**/*"],
  },
};

export default nextConfig;
