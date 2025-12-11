"use client";

import { useState, useEffect, useCallback, useTransition, memo } from "react";
import Image from "next/image";
import Loading from "../components/loading";
import { SelectArrow } from "../lib/utils";

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

const formatText = (text: string) =>
  text.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

// Shared styles
const selectClass =
  "w-full appearance-none rounded-lg border-2 border-zinc-600 bg-zinc-900 px-4 py-3 text-zinc-100 transition-all hover:border-zinc-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/50 disabled:opacity-70";

const labelClass =
  "mb-2 text-xs font-bold uppercase tracking-wider text-amber-300";

// Memoized Article Card
const ArticleCard = memo(function ArticleCard({
  article,
  priority,
}: {
  article: Article;
  priority: boolean;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800/50 transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-900/20">
      <figure className="relative h-48 w-full overflow-hidden bg-zinc-900">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-4xl text-zinc-600"
            aria-hidden="true"
          >
            📰
          </div>
        )}
        <span className="absolute top-0 right-0 rounded-bl-lg bg-amber-300 px-3 py-1 text-xs font-bold text-zinc-950">
          {article.source || "News"}
        </span>
      </figure>

      <div className="flex grow flex-col p-5">
        <h2 className="font-heading mb-3 line-clamp-3 text-lg leading-tight font-bold text-zinc-100 transition-colors group-hover:text-amber-300">
          {article.title}
        </h2>
        <p className="mb-6 line-clamp-3 grow text-sm text-zinc-400">
          {article.description}
        </p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:border-amber-300 hover:bg-amber-300 hover:text-zinc-950"
        >
          Read Full Story
          <span className="ml-1" aria-hidden="true">
            →
          </span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </article>
  );
});

export default function NewsClient() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("all_news");
  const [selectedSubcategory, setSelectedSubcategory] = useState("general");
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchNews = useCallback(async (cat: Category, sub: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/news?category=${cat}&subcategory=${sub}`
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const json = await response.json();
      if (json.error) throw new Error(json.error);

      setArticles(json.data || []);
    } catch {
      setError("Unable to load the latest headlines. Please try again.");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(selectedCategory, selectedSubcategory);
  }, [selectedCategory, selectedSubcategory, fetchNews]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => setSelectedCategory(e.target.value as Category));
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => setSelectedSubcategory(e.target.value));
  };

  const resetNews = () => {
    startTransition(() => {
      setSelectedCategory("all_news");
      setSelectedSubcategory("general");
    });
  };

  return (
    <>
      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-500/50 bg-red-900/20 p-4 text-center"
        >
          <p className="font-semibold text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => fetchNews(selectedCategory, selectedSubcategory)}
            className="mt-2 text-sm text-red-300 underline transition-colors hover:text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Filters */}
      <form
        aria-labelledby="filters-heading"
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto mb-12 w-full max-w-4xl rounded-xl border-2 border-amber-300/20 bg-zinc-800/80 p-6 shadow-xl shadow-amber-900/10 backdrop-blur-sm"
      >
        <fieldset disabled={isPending}>
          <legend id="filters-heading" className="sr-only">
            Filter News
          </legend>

          <div className="grid items-end gap-6 text-left md:grid-cols-3">
            <div className="flex flex-col">
              <label htmlFor="news-category" className={labelClass}>
                Feed Type
              </label>
              <div className="relative">
                <select
                  id="news-category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className={selectClass}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatText(cat)}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="news-subcategory" className={labelClass}>
                Topic
              </label>
              <div className="relative">
                <select
                  id="news-subcategory"
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
                  className={selectClass}
                >
                  {SUBCATEGORIES.map((sub) => (
                    <option key={sub} value={sub}>
                      {formatText(sub)}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </div>
            </div>

            <button
              type="reset"
              onClick={resetNews}
              className="h-[46px] rounded-lg border-2 border-zinc-600 bg-zinc-700 font-bold text-zinc-200 shadow-md transition-all hover:border-amber-300/50 hover:bg-zinc-600 disabled:opacity-70"
            >
              Reset Filters
            </button>
          </div>
        </fieldset>
      </form>

      {/* Results */}
      <section
        aria-labelledby="results-heading"
        aria-busy={isLoading}
        className="min-h-[60vh] w-full"
      >
        <h2 id="results-heading" className="sr-only">
          News Articles
        </h2>

        {isLoading ? (
          <div
            className="flex justify-center pt-20"
            role="status"
            aria-label="Loading articles"
          >
            <Loading />
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
          <p className="font-heading py-20 text-center text-xl text-zinc-500">
            No articles found for this category.
          </p>
        )}
      </section>
    </>
  );
}
