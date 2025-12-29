/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  compiler: {
    removeConsole: true,
  },

  experimental: {
    optimizePackageImports: [
      "firebase",
      "@tanstack/react-virtual",
      "@vis.gl/react-google-maps",
      "@emailjs/browser",
    ],
    cssChunking: true,
  },

  images: {
    minimumCacheTTL: 31536000,
    deviceSizes: [308, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    qualities: [65, 70, 75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/MicFinder",
        destination: "/mic-finder",
        permanent: true,
      },
      {
        source: "/privacyPolicy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/userAgreement",
        destination: "/user-agreement",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
