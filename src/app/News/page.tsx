import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import NewsClient from "./NewsClient";
import AuthGatePrompt from "../components/AuthGatePrompt";
import { fetchNewsArticles } from "@/app/lib/data/news";
import type { NewsCategory } from "@/app/lib/types";
import { getServerAuth } from "@/app/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth-session";
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

function NewsHeader() {
  return (
    <>
      <h1 className="page-title">Hub News</h1>
      <p className="text-sm text-stone-300 md:text-lg">
        Curated stories from around the world. Stay informed with the latest
        updates.
      </p>
    </>
  );
}

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

async function canAccessNews(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return false;

  try {
    await getServerAuth().verifySessionCookie(sessionCookie);
    return true;
  } catch {
    return false;
  }
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
    subcategory,
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
  const hasAccess = await canAccessNews();

  if (!hasAccess) {
    return (
      <main className="page-shell gap-4 text-center">
        <NewsHeader />
        <AuthGatePrompt message="Please sign in to view the Hub News." />
      </main>
    );
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const category = resolvedParams?.category;
  const requestedSubcategory = resolvedParams?.subcategory;
  const subcategory = NEWS_SUBCATEGORIES.includes(
    requestedSubcategory as (typeof NEWS_SUBCATEGORIES)[number],
  )
    ? requestedSubcategory!
    : "general";
  const resolvedCategory: NewsCategory =
    category === "top_stories" ? "top_stories" : "all_news";
  const newsKey = `${resolvedCategory}:${subcategory}`;

  return (
    <main className="page-shell gap-4 text-center">
      <NewsHeader />
      <NewsFilters
        key={`filters:${newsKey}`}
        selectedCategory={resolvedCategory}
        selectedSubcategory={subcategory}
        categories={NEWS_CATEGORIES}
        subcategories={NEWS_SUBCATEGORIES}
      />
      <Suspense key={newsKey} fallback={<NewsSkeleton />}>
        <NewsContent
          resolvedCategory={resolvedCategory}
          subcategory={subcategory}
        />
      </Suspense>
    </main>
  );
}
