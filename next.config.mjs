/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  swcMinify: true, // Enables faster builds with SWC-based minification

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
          source: "/(.*).(js|css|png|jpg|svg|webp|woff2)$",
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
              value: "*", // Allow all origins for testing
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
          destination: "/api/sitemap", // Points to your API route for the sitemap
        },
      ];
    } catch (error) {
      console.error("Error setting rewrites:", error);
      return [];
    }
  },

  images: {
    domains: ["thehumorhub.com"], // Replace with your image domains
    formats: ["image/avif", "image/webp"], // Enables modern image formats for optimized loading
  },
};

export default nextConfig;
