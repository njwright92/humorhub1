import type { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.thehumorhub.com";

  const staticRoutes = [
    "",
    "/MicFinder",
    "/HHapi",
    "/Profile",
    "/contact",
    "/about",
    "/userAgreement",
    "/privacyPolicy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let cityRoutes: MetadataRoute.Sitemap = [];

  try {
    const citiesRef = collection(db, "cities");
    const snapshot = await getDocs(citiesRef);

    cityRoutes = snapshot.docs.map((doc) => {
      const city = doc.data().city;
      return {
        url: `${baseUrl}/MicFinder?city=${encodeURIComponent(city)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      };
    });
  } catch (error) {
    console.error("Failed to generate city sitemap:", error);
  }

  return [...staticRoutes, ...cityRoutes];
}
