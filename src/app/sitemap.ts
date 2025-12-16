import type { MetadataRoute } from "next";

export const revalidate = 86400;

const BASE_URL = "https://www.thehumorhub.com";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
}> = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/MicFinder", priority: 0.9, changeFrequency: "daily" },
  { path: "/News", priority: 0.8, changeFrequency: "daily" },
  { path: "/Profile", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/userAgreement", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacyPolicy", priority: 0.3, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Generate static routes
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  let cityRoutes: MetadataRoute.Sitemap = [];

  try {
    const { getDb } = await import("../../firebase.config");
    const { collection, getDocs } = await import("firebase/firestore");

    const db = await getDb();
    const snapshot = await getDocs(collection(db, "cities"));

    cityRoutes = snapshot.docs.map((doc) => ({
      url: `${BASE_URL}/MicFinder?city=${encodeURIComponent(doc.data().city)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));
  } catch (error) {
    console.error("Sitemap: Failed to fetch cities:", error);
  }

  return [...staticRoutes, ...cityRoutes];
}
