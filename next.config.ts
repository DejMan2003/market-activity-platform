import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: process.env.GITHUB_ACTIONS ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
