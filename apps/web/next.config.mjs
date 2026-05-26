/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@partora/types", "@partora/music-engine"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.mzstatic.com" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    turbo: {},
  },
};

export default nextConfig;
