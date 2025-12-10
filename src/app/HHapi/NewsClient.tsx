"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
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
];

const formatText = (text: string) =>
  text.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

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
        `/api/news?category=${cat}&subcategory=${sub}`,
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
    // Simple fetch on mount or change
    fetchNews(selectedCategory, selectedSubcategory);
    // Note: Scroll behavior might be annoying on category switch if not careful
    // window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, selectedSubcategory, fetchNews]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value as Category;
    startTransition(() => setSelectedCategory(newVal));
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    startTransition(() => setSelectedSubcategory(newVal));
  };

  const resetNews = () => {
    startTransition(() => {
      setSelectedCategory("all_news");
      setSelectedSubcategory("general");
    });
  };

  return (
    <>
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="max-w-2xl mx-auto bg-red-900/20 border border-red-500/50 p-4 rounded-lg mb-8 text-center"
        >
          <p className="text-red-200 font-medium">{error}</p>
          <button
            onClick={() => fetchNews(selectedCategory, selectedSubcategory)}
            className="mt-2 text-sm underline text-red-300 hover:text-white cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Filter Section */}
      <section className="bg-zinc-800/80 border border-zinc-700 w-full max-w-4xl mx-auto mb-12 shadow-xl rounded-xl p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col text-left">
            <label
              htmlFor="category-select"
              className="mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider"
            >
              Feed Type
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={isPending}
                className="w-full bg-zinc-900 text-zinc-100 border border-zinc-600 rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none cursor-pointer transition-all hover:border-zinc-500 disabled:opacity-70"
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

          <div className="flex flex-col text-left">
            <label
              htmlFor="subcategory-select"
              className="mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider"
            >
              Topic
            </label>
            <div className="relative">
              <select
                id="subcategory-select"
                value={selectedSubcategory}
                onChange={handleSubcategoryChange}
                disabled={isPending}
                className="w-full bg-zinc-900 text-zinc-100 border border-zinc-600 rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none cursor-pointer transition-all hover:border-zinc-500 disabled:opacity-70"
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
            onClick={resetNews}
            disabled={isPending}
            className="w-full md:w-auto h-[46px] bg-zinc-700 hover:bg-zinc-600 disabled:opacity-70 text-zinc-200 font-bold rounded-lg transition-all border border-zinc-600 hover:border-zinc-500 shadow-md cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <div className="w-full min-h-[60vh]">
        {isLoading ? (
          <div className="flex justify-center pt-20">
            <Loading />
          </div>
        ) : articles.length > 0 ? (
          <div
            key={`${selectedCategory}-${selectedSubcategory}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in"
          >
            {articles.map((article, index) => (
              <article
                key={article.uuid}
                className="group flex flex-col bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden hover:border-amber-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer h-full"
              >
                <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                  {article.image_url ? (
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index < 3}
                      fetchPriority={
                        index === 0 ? "high" : index < 3 ? "auto" : "low"
                      }
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600">
                      <span className="text-4xl">Newspaper</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 bg-amber-300 text-zinc-950 text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {article.source || "News"}
                  </div>
                </div>

                <div className="flex flex-col grow p-5">
                  <h2 className="text-lg font-bold text-zinc-100 leading-tight mb-3 line-clamp-3 group-hover:text-amber-300 transition-colors duration-300 font-heading">
                    {article.title}
                  </h2>
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-6 grow font-sans">
                    {article.description}
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-2.5 bg-zinc-900 hover:bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg transition-all font-medium text-sm group-hover:border-amber-300/50 underline"
                  >
                    Read Full Story
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-xl font-heading">
              No articles found for this category.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
