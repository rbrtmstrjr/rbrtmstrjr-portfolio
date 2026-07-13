import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // contract document uploads (Word/PDF) go through a server action
      bodySizeLimit: "12mb",
    },
  },
  images: {
    // allow higher-fidelity variants for project screenshots (default is 75)
    qualities: [75, 90],
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
