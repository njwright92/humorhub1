/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://maps.googleapis.com https://maps.gstatic.com https://www.google-analytics.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
  "require-trusted-types-for 'script'",
  "trusted-types nextjs nextjs#app-pages-react-hydrator google-maps-api-loader google-maps-api#html lit-html goog#html default 'allow-duplicates'",
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  compress: true,

  compiler: {
    removeConsole: true,
  },

  experimental: {
    inlineCss: true,
    // SRI adds integrity attributes to all script tags at build time
    // Browser verifies scripts have not been tampered with in transit
    // sri: {
    //   algorithm: "sha256",
    // },
    optimizePackageImports: [
      "firebase",
      "firebase-admin",
      "@tanstack/react-virtual",
      "@vis.gl/react-google-maps",
    ],
    cssChunking: "strict",
  },

  images: {
    minimumCacheTTL: 31536000,
    deviceSizes: [308, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    qualities: [70, 75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
