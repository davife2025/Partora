/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@partora/types", "@partora/music-engine"],

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.mzstatic.com" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },

  // Performance
  compress: true,
  poweredByHeader: false,

  // Headers for security + caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"          },
          { key: "X-Frame-Options",            value: "DENY"             },
          { key: "X-XSS-Protection",           value: "1; mode=block"    },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "microphone=(self), camera=()" },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/icons/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },

  // Webpack optimizations
  webpack(config) {
    // Reduce bundle size — tree-shake lodash etc
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },

  experimental: {
    optimizeCss: true,
    turbo: {},
  },
};

export default nextConfig;
