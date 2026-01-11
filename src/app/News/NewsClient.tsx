"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Loading from "../components/loading";
import dynamic from "next/dynamic";

type Category = "top_stories" | "all_news";

type Article = {
  uuid: string;
  title: string;
  url: string;
  description: string;
  image_url?: string;
  source?: string;
};

const CATEGORIES: Category[] = ["top_stories", "all_news"];
const SUBCATEGORIES = [
  "general",
  "science",
  "sports",
  "business",
  "health",
  "entertainment",
  "tech",
  "politics",
  "food",
  "travel",
] as const;

const NewsFilters = dynamic(() => import("./NewsFilters"), {
  loading: () => (
    <div
      aria-hidden="true"
      className="card-shell card-border-2 card-dark mx-auto mb-12 w-full max-w-4xl border-amber-700 bg-stone-800/80 p-6 shadow-amber-900/10 backdrop-blur-md"
    >
      <div className="grid items-end gap-6 md:grid-cols-3">
        <div className="h-10 rounded-2xl bg-stone-700" />
        <div className="h-10 rounded-2xl bg-stone-700" />
        <div className="h-10 rounded-2xl bg-stone-700" />
      </div>
    </div>
  ),
});
const SKELETON_COUNT = 6;

function ArticleCard({
  article,
  priority,
}: {
  article: Article;
  priority: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-stone-700 bg-stone-800/50 transition-all hover:-translate-y-1 hover:border-amber-700 hover:shadow-lg hover:shadow-amber-900/20">
      <figure className="relative h-48 w-full">
        {article.image_url && !imgError ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-105"
            priority={priority}
            quality={65}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="grid h-full place-content-center bg-stone-800"
            aria-hidden="true"
          >
            📰
          </div>
        )}
        <span className="absolute top-0 right-0 rounded-bl-xl bg-amber-700 px-3 py-1 text-sm font-bold text-white">
          {article.source || "News"}
        </span>
      </figure>
      <div className="grid grid-rows-[auto_1fr_auto] gap-3 p-5">
        <h2 className="line-clamp-3 text-lg leading-tight transition-colors group-hover:text-amber-700">
          {article.title}
        </h2>
        <p className="line-clamp-3 self-start text-sm text-stone-400">
          {article.description}
        </p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read full story: ${article.title}`}
          className="grid grid-flow-col place-content-center gap-1 rounded-2xl border border-stone-700 py-2.5 text-sm font-semibold text-stone-300 transition-all hover:border-amber-700 hover:bg-amber-700 hover:text-stone-900"
        >
          Read Full Story
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

export default function NewsClient() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("all_news");
  const [selectedSubcategory, setSelectedSubcategory] = useState("general");
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async (cat: Category, sub: string) => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ category: cat, subcategory: sub });
      const response = await fetch(`/api/news?${params}`);

      if (!response.ok) throw new Error("Failed to fetch");

      const json = await response.json();
      if (json.error) throw new Error(json.error);

      setArticles(json.data ?? []);
    } catch {
      setError("Unable to load the latest headlines. Please try again.");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory, selectedSubcategory);
  }, [selectedCategory, selectedSubcategory]);

  const resetNews = () => {
    setSelectedCategory("all_news");
    setSelectedSubcategory("general");
  };

  return (
    <>
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto mb-8 max-w-2xl rounded-2xl border border-red-500/50 bg-red-900 p-4 text-center"
        >
          <p className="font-semibold text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => fetchNews(selectedCategory, selectedSubcategory)}
            className="mt-2 cursor-pointer text-sm text-red-300 underline shadow-lg transition-colors hover:text-white"
          >
            Try Again
          </button>
        </div>
      )}

      <NewsFilters
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onCategoryChange={(value) => setSelectedCategory(value)}
        onSubcategoryChange={(value) => setSelectedSubcategory(value)}
        onReset={resetNews}
        isLoading={isLoading}
        categories={CATEGORIES}
        subcategories={SUBCATEGORIES}
      />

      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">
          News Articles
        </h2>

        {isLoading ? (
          <div className="grid gap-6">
            <div className="grid place-content-center pt-6" role="status">
              <Loading />
            </div>
            <ul
              className="animate-slide-in grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-label="Loading articles"
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <li key={index}>
                  <div className="grid h-full min-h-[22rem] animate-pulse grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-stone-700 bg-stone-800/50">
                    <div className="h-48 w-full bg-stone-800" />
                    <div className="grid grid-rows-[auto_1fr_auto] gap-3 p-5">
                      <div className="h-5 w-3/4 rounded-full bg-stone-700" />
                      <div className="h-12 w-full rounded-2xl bg-stone-700" />
                      <div className="h-9 w-1/2 rounded-2xl bg-stone-700" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : articles.length > 0 ? (
          <ul
            className="animate-slide-in grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            aria-label={`${articles.length} articles`}
          >
            {articles.map((article, index) => (
              <li key={article.uuid}>
                <ArticleCard article={article} priority={index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-20 text-xl text-stone-500">
            No articles found for this category.
          </p>
        )}
      </section>
    </>
  );
}
