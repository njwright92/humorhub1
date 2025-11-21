"use client";

import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Script from "next/script";
import Image from "next/image"; // Good practice to have if you add images later
import Link from "next/link";
import Loading from "../components/loading";

// OPTIMIZATION: Static imports for layout stability
import Header from "../components/header";
import Footer from "../components/footer";

// --- Types ---
type Category = "top_stories" | "all_news";

type Article = {
  uuid: string;
  title: string;
  url: string;
  description: string;
  image_url?: string; // Added optional image support if API provides it
  source?: string;
};

type ArticlesByCategory = {
  [key in Category]?: Article[];
};

// --- Constants ---
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

const NEWS_API_TOKEN = process.env.NEXT_PUBLIC_NEWS_API;

export default function NewsPage() {
  // --- State ---
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("all_news");
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string>("general");
  const [fetchedArticles, setFetchedArticles] = useState<ArticlesByCategory>(
    {},
  );
  const [error, setError] = useState("");
  const [expandedArticleTitle, setExpandedArticleTitle] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Fetch Logic ---
  const fetchNews = useCallback(
    async (category: Category, subcategory: string) => {
      if (!NEWS_API_TOKEN) {
        setError("API Token is missing.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const endpoint =
          category === "top_stories"
            ? `https://api.thenewsapi.com/v1/news/top`
            : `https://api.thenewsapi.com/v1/news/all`;

        const params = new URLSearchParams({
          api_token: NEWS_API_TOKEN,
          locale: "us,ca",
          language: "en",
          limit: "10",
          categories: subcategory,
        });

        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();

        const validArticles = data.data.filter(
          (article: Article) => article.title && article.description,
        );

        setFetchedArticles({ [category]: validArticles });
        setExpandedArticleTitle(null);
      } catch (err) {
        console.error(err);
        setError(
          "Oops! We couldn't fetch the articles at the moment. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // --- Effects ---
  useEffect(() => {
    fetchNews(selectedCategory, selectedSubcategory);
  }, [selectedCategory, selectedSubcategory, fetchNews]);

  // --- Handlers ---
  const handleToggleArticle = (title: string) => {
    setExpandedArticleTitle((prev) => (prev === title ? null : title));
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedCategory(event.target.value as Category);
  };

  const handleSubcategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedSubcategory(event.target.value);
  };

  const resetNews = () => {
    setSelectedCategory("all_news");
    setSelectedSubcategory("general");
    setExpandedArticleTitle(null);
    setError("");
  };

  const formatText = (text: string) =>
    text.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <>
      <Head>
        <title>Hub News - Latest Comedy & World Stories</title>
        <meta
          name="description"
          content="Get the latest jokes, events, and comedy news with Humor Hub."
        />
      </Head>

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-WH6KKVYT8F"
      />

      <Header />

      <main className="screen-container content-with-sidebar bg-transparent">
        {/* Page Title - Styled to match Home Page */}
        <h1 className="title text-4xl md:text-6xl font-extrabold text-center mb-8 tracking-wide">
          Hub News
        </h1>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-900/50 border-2 border-red-500 p-4 rounded-xl mb-6">
            <p className="text-red-200 font-bold text-center">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
          {/* --- Controls Section (Card Style) --- */}
          <section className="card-style bg-zinc-800 p-6 rounded-xl shadow-xl w-full max-w-2xl mx-auto mb-10 border border-zinc-700">
            <h2 className="font-comic text-2xl font-bold mb-4 text-amber-300">
              Filter the Feed
            </h2>
            <p className="text-zinc-300 mb-6 text-md leading-relaxed">
              Browse top categories and search for the freshest content.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col text-left">
                <label className="mb-2 font-bold text-zinc-200 text-sm uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="bg-zinc-800 border-4 border-zinc-600 p-2 rounded-lg shadow-md text-zinc-200 focus:border-amber-300 cursor-pointer"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {formatText(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col text-left">
                <label className="mb-2 font-bold text-zinc-200 text-sm uppercase tracking-wider">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
                  className="bg-zinc-800 border-4 border-zinc-600 p-2 rounded-lg shadow-md text-zinc-200 focus:border-amber-300 cursor-pointer"
                >
                  {SUBCATEGORIES.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {formatText(subcategory)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={resetNews}
                className="px-2 py-1 bg-red-700 hover:bg-red-600 text-zinc-200 font-medium rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          </section>

          {/* --- Results Section --- */}
          {isLoading ? (
            <div className="py-10">
              <Loading />
            </div>
          ) : (
            Object.keys(fetchedArticles).map((categoryKey) => {
              const cat = categoryKey as Category;
              const articles = fetchedArticles[cat];

              if (!articles || articles.length === 0) return null;

              return (
                <section
                  key={cat}
                  className="w-full animate-slide-in"
                  aria-live="polite"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-amber-300 underline mb-4">
                      {formatText(cat)}
                    </h2>

                    <h3 className="text-2xl font-medium text-zinc-200 mt-4 mb-4">
                      {formatText(selectedSubcategory)} Headlines
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {articles.map((article, index) => (
                      <article
                        key={`${article.uuid}-${index}`}
                        className={`
                          bg-zinc-800/80 backdrop-blur-sm border-l-4 
                          ${
                            expandedArticleTitle === article.title
                              ? "border-amber-300 bg-zinc-800"
                              : "border-zinc-600"
                          }
                          p-5 rounded-r-xl shadow-md transition-all duration-300 hover:bg-zinc-700
                        `}
                      >
                        <div className="flex items-start gap-4">
                          {/* Toggle Icon */}
                          <button
                            onClick={() => handleToggleArticle(article.title)}
                            className="mt-1 text-amber-300 hover:text-amber-200 transition-colors flex-shrink-0 p-1 focus:outline-none focus:ring-2 focus:ring-amber-300 rounded"
                            aria-expanded={
                              expandedArticleTitle === article.title
                            }
                            aria-label={
                              expandedArticleTitle === article.title
                                ? "Collapse article"
                                : "Expand article"
                            }
                          >
                            {expandedArticleTitle === article.title ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-grow">
                            <h3
                              onClick={() => handleToggleArticle(article.title)}
                              className="cursor-pointer text-lg md:text-xl font-bold text-zinc-100 hover:text-amber-300 transition-colors leading-tight"
                            >
                              {article.title}
                            </h3>

                            {/* Expanded Content */}
                            {expandedArticleTitle === article.title && (
                              <div className="mt-4 pt-4 border-t border-zinc-600 animate-slide-in">
                                <p className="text-zinc-300 mb-4 leading-relaxed text-md">
                                  {article.description}
                                </p>
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn text-sm inline-block hover:scale-100"
                                >
                                  Read Full Article &rarr;
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
