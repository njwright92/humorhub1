import type { Metadata } from "next";
import { Suspense } from "react";
import NewsClient from "./NewsClient";
import { fetchNewsArticles } from "@/app/lib/data/news";
import type { NewsCategory } from "@/app/lib/types";
import NewsFilters, {
  NEWS_CATEGORIES,
  NEWS_SUBCATEGORIES,
} from "./NewsFilters";

export const metadata: Metadata = {
  title: "Hub News - Latest Comedy & World Stories | Humor Hub",
  description:
    "Get the latest jokes, events, and comedy news along with top stories from around the world with Humor Hub.",
  alternates: {
    canonical: "https://www.thehumorhub.com/News",
  },
  openGraph: {
    title: "Hub News - Latest Comedy & World Stories",
    description: "Curated news and stories for the comedy community.",
    url: "https://www.thehumorhub.com/News",
    siteName: "Humor Hub",
    type: "website",
  },
};

function NewsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading news"
      className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="card-muted grid h-72 animate-pulse grid-rows-[auto_1fr] gap-4 p-4"
        >
          <div className="h-32 rounded-2xl bg-stone-700" />
          <div className="grid gap-2">
            <div className="h-4 w-3/4 rounded-2xl bg-stone-700" />
            <div className="h-4 w-5/6 rounded-2xl bg-stone-700" />
            <div className="h-4 w-2/3 rounded-2xl bg-stone-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function NewsContent({
  resolvedCategory,
  subcategory,
}: {
  resolvedCategory: NewsCategory;
  subcategory: string;
}) {
  const { articles, error } = await fetchNewsArticles(
    resolvedCategory,
    subcategory
  );
  return (
    <NewsClient
      articles={articles}
      error={error}
      selectedCategory={resolvedCategory}
      selectedSubcategory={subcategory}
    />
  );
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; subcategory?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const category = resolvedParams?.category;
  const subcategory = resolvedParams?.subcategory ?? "general";
  const resolvedCategory: NewsCategory =
    category === "top_stories" ? "top_stories" : "all_news";

  return (
    <main className="page-shell gap-4 text-center">
      <h1 className="page-title">Hub News</h1>
      <p className="text-sm text-stone-300 md:text-lg">
        Curated stories from around the world. Stay informed with the latest
        updates.
      </p>
      <NewsFilters
        selectedCategory={resolvedCategory}
        selectedSubcategory={subcategory}
        categories={NEWS_CATEGORIES}
        subcategories={NEWS_SUBCATEGORIES}
      />
      <Suspense fallback={<NewsSkeleton />}>
        <NewsContent
          resolvedCategory={resolvedCategory}
          subcategory={subcategory}
        />
      </Suspense>
    </main>
  );
}
