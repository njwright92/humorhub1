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
    qualities: [70, 75],
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com https://www.google.com https://apis.google.com https://*.firebaseapp.com https://*.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.firebaseio.com https://*.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.emailjs.com wss://*.firebaseio.com https://vercel.live https://*.vercel-insights.com",
              "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
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
