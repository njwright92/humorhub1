import type { MetadataRoute } from "next";
import { getServerDb } from "@/app/lib/firebase-admin";
import { COLLECTIONS } from "@/app/lib/constants";

export const revalidate = 86400;
export const runtime = "nodejs";

const BASE_URL = "https://www.thehumorhub.com";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
}> = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/mic-finder", priority: 0.9, changeFrequency: "daily" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/user-agreement", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  let cityRoutes: MetadataRoute.Sitemap = [];

  try {
    const db = getServerDb();
    const snapshot = await db.collection(COLLECTIONS.cities).get();

    cityRoutes = snapshot.docs
      .map((doc) => doc.data()?.city as string | undefined)
      .filter((city): city is string => Boolean(city))
      .map((city) => ({
        url: `${BASE_URL}/mic-finder?city=${encodeURIComponent(city)}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      }));
  } catch (error) {
    console.error("Sitemap: Failed to fetch cities:", error);
  }

  return [...staticRoutes, ...cityRoutes];
}
