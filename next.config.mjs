/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,

  compiler: {
    removeConsole: true,
  },

  experimental: {
    inlineCss: true,

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
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // We keep unsafe-inline because Next.js needs it without a Nonce
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://maps.googleapis.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:", // Simplified: Allows all secure connections
              "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
              // THIS FIXES THE TRUSTED TYPES WARNING
              "require-trusted-types-for 'script'",
              "trusted-types nextjs nextjs#app-pages-react-hydrator default *",
            ].join("; "),
          },
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
