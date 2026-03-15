import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  async rewrites() {
    return [
      {
        source: "/paper",
        destination: "/paper/index.html",
      },
      {
        source: "/paper/",
        destination: "/paper/index.html",
      },
    ];
  },
};

export default nextConfig;
