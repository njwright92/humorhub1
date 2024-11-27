/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async headers() {
    try {
      return [
        {
          source: "/_next/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          source: "/(.*).(js|css|png|jpg|svg|webp|woff2|html|iframe)$",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          source: "/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=0, must-revalidate",
            },
          ],
        },
        {
          source: "/(.*)",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "*",
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET,POST,PUT,DELETE,OPTIONS",
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "X-Requested-With, Content-Type, Authorization",
            },
          ],
        },
      ];
    } catch (error) {
      console.error("Error setting headers:", error);
      return [];
    }
  },

  async rewrites() {
    try {
      return [
        {
          source: "/sitemap.xml",
          destination: "/api/sitemap",
        },
      ];
    } catch (error) {
      console.error("Error setting rewrites:", error);
      return [];
    }
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thehumorhub.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
