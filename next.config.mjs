/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  transpilePackages: ["@googlemaps/js-api-loader", "firebase"],

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    optimizePackageImports: [
      "firebase",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "@emailjs/browser",
      "@googlemaps/js-api-loader",
      "@tanstack/react-virtual",
    ],
  },

  images: {
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],

    remotePatterns: [
      { protocol: "https", hostname: "thehumorhub.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "**" },
    ],
  },

  async headers() {
    return [
      {
        source:
          "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|otf|js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },

      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/__firebase/:path*",
        destination: "https://humorhub-73ff9.firebaseapp.com/:path*",
      },
      {
        source: "/firebase/:path*",
        destination: "https://www.gstatic.com/firebasejs/:path*",
      },
    ];
  },
};

export default nextConfig;
