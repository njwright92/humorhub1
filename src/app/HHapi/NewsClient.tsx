"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import Loading from "../components/loading";
import Header from "../components/header";
import Footer from "../components/footer";

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

const SelectArrow = () => (
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
  </div>
);

export default function NewsClient() {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("all_news");
  const [selectedSubcategory, setSelectedSubcategory] = useState("general");
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true); // ← This was missing!
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
    } catch (err) {
      setError("Unable to load the latest headlines. Please try again.");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchNews(selectedCategory, selectedSubcategory);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Header />
      <main className="screen-container content-with-sidebar bg-transparent">
        <div className="text-center mb-10">
          <h1 className="title mb-4">Hub News</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Curated stories from around the world. Stay informed with the latest
            updates in{" "}
            <span className="text-amber-300 font-medium">
              {formatText(selectedSubcategory)}
            </span>
            .
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="max-w-2xl mx-auto bg-red-900/20 border border-red-500/50 p-4 rounded-lg mb-8 text-center"
          >
            <p className="text-red-200 font-medium">{error}</p>
            <button
              onClick={() => fetchNews(selectedCategory, selectedSubcategory)}
              className="mt-2 text-sm underline text-red-300 hover:text-white"
            >
              Try Again
            </button>
          </div>
        )}

        <section className="card-style bg-zinc-800/80 border border-zinc-700 w-full max-w-4xl mx-auto mb-12 shadow-xl rounded-xl p-6">
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
              className="w-full md:w-auto h-[46px] bg-zinc-700 hover:bg-zinc-600 disabled:opacity-70 text-zinc-200 font-bold rounded-lg transition-all border border-zinc-600 hover:border-zinc-500 shadow-md"
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
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
                    <div className="absolute top-0 right-0 bg-orange-300 text-zinc-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                      {article.source || "News"}
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow p-5">
                    <h2 className="text-lg font-bold text-zinc-100 leading-tight mb-3 line-clamp-3 group-hover:text-amber-400 transition-colors duration-300">
                      {article.title}
                    </h2>
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-grow">
                      {article.description}
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full py-2.5 bg-zinc-900 hover:bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg transition-all font-medium text-sm group-hover:border-amber-300/50"
                    >
                      Read Full Story <span className="ml-2">Right Arrow</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-xl">No articles found for this category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
