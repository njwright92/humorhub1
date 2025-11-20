"use client";

import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Script from "next/script";
import Loading from "../components/loading";

// OPTIMIZATION: Static imports for layout stability
import Header from "../components/header";
import Footer from "../components/footer";

// --- Types ---
type Category = "top_stories" | "all_news";

type Article = {
  uuid: string; // API provides UUID
  title: string;
  url: string;
  description: string;
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

// Access token directly (Client Side)
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
  // Wrapped in useCallback to ensure stability
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

        // Construct Query Params
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

        // Filter out bad data
        const validArticles = data.data.filter(
          (article: Article) => article.title && article.description,
        );

        setFetchedArticles({ [category]: validArticles });
        setExpandedArticleTitle(null); // Reset expanded view on new fetch
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

  // Helper to capitalize text
  const formatText = (text: string) =>
    text.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <>
      <Head>
        <title>
          Hub News - Access the Latest stories in all news categories
        </title>
        <meta
          name="description"
          content="Integrate with Humor Hub's API to get the latest jokes, events, and comedy news."
        />
        <meta
          name="keywords"
          content="Humor Hub API, comedy API, jokes API, comedy content"
        />
        <link rel="canonical" href="https://www.thehumorhub.com/HHapi" />
        <meta
          property="og:title"
          content="Humor Hub API - Access the Latest Comedy Content"
        />
        <meta
          property="og:description"
          content="Integrate with Humor Hub's API to get the latest jokes, events, and comedy news."
        />
        <meta property="og:url" content="https://www.thehumorhub.com/HHapi" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.thehumorhub.com/images/og-image-hhapi.jpg"
        />
      </Head>

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-WH6KKVYT8F"
      />

      <Header />

      <div className="screen-container content-with-sidebar">
        {error && (
          <p className="error-message text-red-400 text-center mb-4 font-bold">
            {error}
          </p>
        )}

        <h1 className="title text-3xl font-bold text-center text-zinc-200 mb-6">
          Hub News
        </h1>

        <div className="min-h-screen bg-zinc-900 flex flex-col items-center p-4">
          {/* --- Controls Section --- */}
          <section className="bg-zinc-200 text-zinc-900 p-8 rounded-xl drop-shadow-md max-w-md w-full mx-2 mb-4">
            <h2 className="text-center text-2xl font-bold mb-4">
              Welcome to the News Hub!
            </h2>
            <p className="text-center mb-4 text-lg">
              Get real time News, and more with the news hub. Browse top
              categories and search for the freshest content.
            </p>

            <div className="mb-4 w-full">
              <label className="block mb-2 font-semibold">
                Choose Category:
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="mb-4 p-2 rounded-xl shadow-lg bg-white text-zinc-900 w-full outline-none"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatText(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 w-full">
              <label className="block mb-2 font-semibold">
                Choose Subcategory:
              </label>
              <select
                value={selectedSubcategory}
                onChange={handleSubcategoryChange}
                className="mb-4 p-2 rounded-xl shadow-lg bg-white text-zinc-900 w-full outline-none"
              >
                {SUBCATEGORIES.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {formatText(subcategory)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={resetNews}
                className="bg-red-500 text-zinc-200 font-semibold py-2 px-4 rounded-2xl shadow-xl hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </section>

          {/* --- Results Section --- */}
          {isLoading ? (
            <Loading />
          ) : (
            Object.keys(fetchedArticles).map((categoryKey) => {
              const cat = categoryKey as Category;
              const articles = fetchedArticles[cat];

              if (!articles || articles.length === 0) return null;

              return (
                <section
                  key={cat}
                  className="category-container mb-8 w-full max-w-4xl"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-zinc-100 mb-2">
                      {formatText(cat)}
                    </h2>
                    <h3 className="text-xl font-bold text-zinc-300 underline underline-offset-4 decoration-orange-500 decoration-[0.125rem]">
                      {formatText(selectedSubcategory)} News
                    </h3>
                  </div>

                  {articles.map((article, index) => (
                    <article
                      key={`${article.uuid}-${index}`}
                      className="news-item flex flex-col md:flex-row items-start justify-between bg-zinc-800 p-4 rounded-lg mb-4 transition-colors hover:bg-zinc-750"
                    >
                      <div className="flex-1 flex items-start w-full">
                        <button
                          onClick={() => handleToggleArticle(article.title)}
                          className="mr-3 mt-1 flex-shrink-0"
                          aria-expanded={expandedArticleTitle === article.title}
                          aria-label="Toggle article details"
                        >
                          {expandedArticleTitle === article.title ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-orange-500 drop-shadow-xl"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 4l-7 7h4v6h6v-6h4l-7-7z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-orange-500"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 20l7-7h-4v-6h-6v6h-4l7 7z" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-grow flex flex-col">
                          <h3
                            onClick={() => handleToggleArticle(article.title)}
                            className="cursor-pointer text-zinc-300 text-xl font-semibold hover:text-orange-400 transition-colors"
                          >
                            {article.title}
                          </h3>

                          {expandedArticleTitle === article.title && (
                            <div className="mt-3 animate-fade-in-down">
                              <p className="news-description text-zinc-200 mb-2 leading-relaxed">
                                {article.description}
                              </p>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="news-link text-blue-400 hover:text-blue-300 underline"
                              >
                                Read full article
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
