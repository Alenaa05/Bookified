import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    }
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
      {
        protocol: 'https',
        hostname: 'k5bf7rcfi0jnbqdi.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lspfdyhgsrgsxcju.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;