import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
