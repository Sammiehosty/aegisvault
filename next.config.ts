import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The production preview is served behind a platform proxy domain
  // (https://<port>-<id>.e2b.app). Server Actions validate the Origin
  // header against the request host — allow the proxy domains so
  // logins, form submissions and admin reviews are never rejected.
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.e2b.app",
        "e2b.app",
        "localhost:3000",
        "127.0.0.1:3000",
        "localhost:3100",
        "127.0.0.1:3100",
      ],
    },
  },
};

export default nextConfig;
