import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // contract document uploads (Word/PDF) go through a server action
      bodySizeLimit: "12mb",
    },
  },
  images: {
    // Covers + galleries uploaded through /admin live in Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
