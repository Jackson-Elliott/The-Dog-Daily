import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cursor's browser preview uses 127.0.0.1, which Next treats as a
  // different origin from localhost and otherwise blocks /_next scripts.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Allows the downloaded/re-hosted episode photos served from Supabase Storage
    // to be referenced directly. Actual episode photos use `unoptimized` (they're
    // arbitrary re-hosted news images), this is kept for future optimized use.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
