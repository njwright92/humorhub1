"use client";

import React, { useState, useEffect } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import { useRouter } from "next/navigation";
import { useHeadline } from "../components/headlinecontext";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

type Category =
  | "business"
  | "entertainment"
  | "general"
  | "health"
  | "science"
  | "sports"
  | "technology";

const categories: Category[] = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];

type Article = {
  title: string;
  url: string;
  description: string;
};

type ArticlesByCategory = {
  [key in Category]?: Article[];
};

let NEWS_API: string | undefined = process.env.NEXT_PUBLIC_NEWS_API;

const fetchCategoryNews = async (category: Category) => {
  try {
    const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&country=us&pageSize=10&apiKey=${NEWS_API}`;
    const response = await fetch(newsApiUrl);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log(`${category} category data:`, data); // Log the data to see the structure

    const filteredArticles = data.articles.filter(
      (article: { title: string; description: string }) => {
        const title = article.title || "";
        const description = article.description || "";
        return (
          !title.includes("[Removed]") && !description.includes("[Removed]")
        );
      }
    );

    return filteredArticles;
  } catch (error) {
    console.error("Error fetching news for category:", category, error);
    throw new Error("Failed to fetch news");
  }
};

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("general");
  const [fetchedArticles, setFetchedArticles] = useState<ArticlesByCategory>(
    {}
  );
  const [error, setError] = useState("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null); // New state to track expanded articles
  const [isNewsFetched, setIsNewsFetched] = useState(false);
  const { setSelectedHeadline, setSelectedDescription } = useHeadline();
  const router = useRouter();

  const handleToggleArticle = (title: string) => {
    setExpandedArticle((prev) => (prev === title ? null : title)); // Toggle article visibility
  };

  const handleCategoryChange = async (event: { target: { value: any } }) => {
    const category = event.target.value;
    setSelectedCategory(category);
    const fetchedArticles = await fetchCategoryNews(category);
    setFetchedArticles({ [category]: fetchedArticles });
    setExpandedArticle(null); // Reset expanded article on category change
  };

  const handleWriteJoke = (title: string, description: string) => {
    setSelectedHeadline(title);
    setSelectedDescription(description);
    router.push("/ComicBot");
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsNewsFetched(false);
        const fetchedArticles = await fetchCategoryNews(selectedCategory);
        setFetchedArticles({ [selectedCategory]: fetchedArticles });
        setIsNewsFetched(true);
      } catch (error) {
        console.error(`Error fetching news for ${selectedCategory}:`, error);
        setError("Failed to fetch news");
      }
    };

    fetchNews();
  }, [selectedCategory]);

  const resetNews = () => {
    setSelectedCategory("general"); // Automatically triggers useEffect to fetch news
    setExpandedArticle(null);
    setError("");
  };

  return (
    <>
      <Header />
      <div className="screen-container">
        {error && <p className="error-message text-zinc-200">{error}</p>}
        <h1 className="title text-3xl font-bold text-center text-zinc-200 mb-6">
          Humor Hub News
        </h1>
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center p-4">
          <section className="bg-zinc-200 text-zinc-900 p-8 rounded-xl drop-shadow-md max-w-md w-full mx-2 mb-4">
            <h2 className="text-center text-2xl font-bold mb-4">
              Welcome to Humor Hub News Portal
            </h2>
            <p className="text-center mb-4 text-lg">
              Your gateway to the latest in comedy, politics, and beyond.
              Customize your news experience with targeted categories and
              dynamic search to keep your insights fresh and focused.
            </p>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="mb-4 p-2 rounded-xl shadow-lg bg-zinc text-zinc-900 w-full"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex justify-center mt-4">
              <button
                onClick={resetNews}
                className=" bg-red-500 text-zinc-200 font-semibold py-2 px-4 rounded-2xl shadow-xl hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </section>

          {isNewsFetched &&
            Object.keys(fetchedArticles).map((category) => (
              <section
                key={category}
                className="category-container mb-8 w-full"
              >
                <div className="flex flex-col md:flex-row md:items-center text-zinc-200 mb-4">
                  <h2 className="category-title text-center text-2xl font-bold mb-2 md:mb-0 w-full">
                    {category.charAt(0).toUpperCase() + category.slice(1)} News
                  </h2>
                  <p className="text-center md:text-right text-zinc-200 w-full md:w-auto md:ml-4">
                    Send this to ComicBot to get the ball rolling!
                  </p>
                </div>

                {fetchedArticles[category as Category]?.map(
                  (article, index) => (
                    <article
                      key={index}
                      className="news-item flex flex-col md:flex-row items-center justify-between bg-zinc-800 p-4 rounded-lg mb-4"
                    >
                      <div className="flex-1 flex items-center">
                        <button
                          onClick={() => handleToggleArticle(article.title)}
                          className="mr-2"
                          aria-expanded={
                            expandedArticle === article.title ? "true" : "false"
                          }
                          aria-label="Toggle article details"
                        >
                          {expandedArticle === article.title ? (
                            <ArrowUpIcon className="h-5 w-5 text-orange-500 drop-shadow-xl" />
                          ) : (
                            <ArrowDownIcon className="h-5 w-5 text-orange-500" />
                          )}
                        </button>
                        <div className="flex-grow flex flex-col items-center md:items-start">
                          <h3
                            onClick={() => handleToggleArticle(article.title)}
                            className="cursor-pointer text-zinc-400 text-xl"
                          >
                            {article.title}
                          </h3>
                          {expandedArticle === article.title && (
                            <>
                              <p className="news-description text-zinc-200">
                                {article.description}
                              </p>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="news-link text-blue-500 underline"
                              >
                                Read full article
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:flex md:flex-col md:items-end">
                        <button
                          onClick={() =>
                            handleWriteJoke(article.title, article.description)
                          }
                          className="btn font-semibold py-2 px-4 rounded hover:bg-green-700 hover:text-zinc-200 transition-colors"
                          id="send-joke"
                        >
                          ComicBot’s Take
                        </button>
                      </div>
                    </article>
                  )
                )}
              </section>
            ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewsPage;
