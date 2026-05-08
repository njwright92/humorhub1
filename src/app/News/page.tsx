import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import NewsClient from "./NewsClient";
import AuthGatePrompt from "../components/AuthGatePrompt";

import { fetchNewsArticles } from "@/app/lib/data/news";
import { getServerAuth } from "@/app/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/app/lib/auth-session";

import type { NewsCategory } from "@/app/lib/types";

import NewsFilters, {
  NEWS_CATEGORIES,
  NEWS_SUBCATEGORIES,
} from "./NewsFilters";

export const metadata: Metadata = {
  title: "Hub News | Humor Hub",
  description: "Latest comedy news and world stories.",
  alternates: { canonical: "/News" },
};

type NewsContentProps = {
  resolvedCategory: NewsCategory;
  subcategory: string;
};

type NewsPageProps = {
  searchParams?: Promise<{
    category?: string;
    subcategory?: string;
  }>;
};

function NewsHeader() {
  return (
    <header className="space-y-2">
      <h1 className="page-title">Hub News</h1>

      <p className="text-center text-stone-400 md:text-lg">
        Curated stories from around the world.
      </p>
    </header>
  );
}

function NewsSkeleton() {
  return (
    <div
      role="status"
      className="mx-auto grid w-full max-w-6xl animate-pulse gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-muted h-96 bg-stone-800/20" />
      ))}
    </div>
  );
}

async function canAccessNews() {
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
}: NewsContentProps) {
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

export default async function NewsPage({ searchParams }: NewsPageProps) {
  if (!(await canAccessNews())) {
    return (
      <main className="page-shell text-center">
        <NewsHeader />

        <AuthGatePrompt message="Sign in to view News." />
      </main>
    );
  }

  const p = searchParams ? await searchParams : undefined;

  const sub = NEWS_SUBCATEGORIES.includes(
    p?.subcategory as (typeof NEWS_SUBCATEGORIES)[number],
  )
    ? p!.subcategory!
    : "general";

  const cat: NewsCategory =
    p?.category === "top_stories" ? "top_stories" : "all_news";

  const key = `${cat}:${sub}`;

  return (
    <main className="page-shell gap-4 text-center">
      <NewsHeader />

      <NewsFilters
        selectedCategory={cat}
        selectedSubcategory={sub}
        categories={NEWS_CATEGORIES}
        subcategories={NEWS_SUBCATEGORIES}
      />

      <Suspense key={key} fallback={<NewsSkeleton />}>
        <NewsContent resolvedCategory={cat} subcategory={sub} />
      </Suspense>
    </main>
  );
}
