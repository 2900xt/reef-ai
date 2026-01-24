import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async redirects() {
    return [
      {
        source: "/reef",
        destination: "/?tool=reef",
        permanent: true,
      },
      {
        source: "/pearl",
        destination: "/?tool=pearl",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
