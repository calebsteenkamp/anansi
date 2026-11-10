import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exact additional development hostnames only; does not relax Server Action CSRF.
  allowedDevOrigins: (process.env.ANANSI_DEV_HOSTS ?? "").split(",").map(host => host.trim()).filter(Boolean),
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
