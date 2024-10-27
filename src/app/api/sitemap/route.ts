import { NextResponse } from "next/server";
import { db } from "../../../../firebase.config"; // Import Firebase configuration
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions

// Function to generate the sitemap dynamically
export const GET = async () => {
  // Reference to the "cities" collection in Firestore
  const citiesRef = collection(db, "cities");
  const cityDocs = await getDocs(citiesRef);

  // Map Firestore documents to URL entries
  const cityUrls = cityDocs.docs.map((doc) => {
    const city = doc.data().city;
    return {
      loc: `https://www.thehumorhub.com/MicFinder?city=${encodeURIComponent(
        city
      )}`,
      lastmod: "2024-09-02", // Last modified date; update as needed
      priority: "0.9",
    };
  });

  // Define static URLs for other pages
  const staticUrls = [
    {
      loc: "https://www.thehumorhub.com/",
      lastmod: "2024-09-02",
      priority: "1.0",
    },
    {
      loc: "https://www.thehumorhub.com/ComicBot",
      lastmod: "2024-09-02",
      priority: "0.8",
    },
    {
      loc: "https://www.thehumorhub.com/Jokepad",
      lastmod: "2024-09-02",
      priority: "0.8",
    },
    {
      loc: "https://www.thehumorhub.com/HHapi",
      lastmod: "2024-09-02",
      priority: "0.7",
    },
    {
      loc: "https://www.thehumorhub.com/Profile",
      lastmod: "2024-09-02",
      priority: "0.7",
    },
    {
      loc: "https://www.thehumorhub.com/contact",
      lastmod: "2024-09-02",
      priority: "0.6",
    },
    {
      loc: "https://www.thehumorhub.com/about",
      lastmod: "2024-09-02",
      priority: "0.6",
    },
    {
      loc: "https://www.thehumorhub.com/userAgreement",
      lastmod: "2024-09-02",
      priority: "0.4",
    },
    {
      loc: "https://www.thehumorhub.com/privacyPolicy",
      lastmod: "2024-09-02",
      priority: "0.4",
    },
  ];

  // Combine static and dynamic URLs into a single list
  const allUrls = [...staticUrls, ...cityUrls];

  // Generate XML format for the sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allUrls
        .map(
          ({ loc, lastmod, priority }) => `
          <url>
            <loc>${loc}</loc>
            <lastmod>${lastmod}</lastmod>
            <priority>${priority}</priority>
          </url>
        `
        )
        .join("")}
    </urlset>`;

  // Respond with XML content
  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
