/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pitchsense/shared"],
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.clerk.com" },
      { protocol: "https", hostname: "pitchsense-uploads.s3.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;
