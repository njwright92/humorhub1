"use client";

import React, { useState, useEffect } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import { useRouter } from "next/navigation";
import { useHeadline } from "../components/headlinecontext";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import Loading from "../components/loading";

type Category = "top_stories" | "all_news";

const categories: Category[] = ["top_stories", "all_news"];
const subcategories = [
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

type Article = {
  title: string;
  url: string;
  description: string;
};

type ArticlesByCategory = {
  [key in Category]?: Article[];
};

let NEWS_API_TOKEN: string | undefined = process.env.NEXT_PUBLIC_NEWS_API;

const fetchCategoryNews = async (category: Category, subcategory: string) => {
  try {
    const requestOptions = {
      method: "GET",
    };

    const params = {
      api_token: NEWS_API_TOKEN,
      locale: "us,ca",
      language: "en",
      limit: "10",
      categories: subcategory,
    };

    const query = Object.keys(params)
      .map(
        (k) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(
            params[k as keyof typeof params] as string
          )}`
      )
      .join("&");

    let endpoint = "";

    switch (category) {
      case "top_stories":
        endpoint = `https://api.thenewsapi.com/v1/news/top`;
        break;
      case "all_news":
      default:
        endpoint = `https://api.thenewsapi.com/v1/news/all`;
        break;
    }

    const response = await fetch(`${endpoint}?${query}`, requestOptions);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();

    return data.data.filter(
      (article: Article) => article.title && article.description
    ); // Filter out articles without titles or descriptions
  } catch (error) {
    console.error("Error fetching news for category:", category, error);
    throw new Error("Failed to fetch news");
  }
};

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("all_news");
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string>("general");
  const [fetchedArticles, setFetchedArticles] = useState<ArticlesByCategory>(
    {}
  );
  const [error, setError] = useState("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedHeadline, setSelectedDescription } = useHeadline();
  const router = useRouter();

  const handleToggleArticle = (title: string) => {
    setExpandedArticle((prev) => (prev === title ? null : title));
  };

  const handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const category = event.target.value as Category;
    setSelectedCategory(category);
    fetchNews(category, selectedSubcategory);
  };

  const handleSubcategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const subcategory = event.target.value;
    setSelectedSubcategory(subcategory);
    fetchNews(selectedCategory, subcategory);
  };

  const fetchNews = async (category: Category, subcategory: string) => {
    setIsLoading(true);
    try {
      const fetchedArticles = await fetchCategoryNews(category, subcategory);
      setFetchedArticles({ [category]: fetchedArticles });
      setExpandedArticle(null);
    } catch (error) {
      console.error("Error while fetching articles:", error);
      setError("Failed to fetch articles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteJoke = (title: string, description: string) => {
    setSelectedHeadline(title);
    setSelectedDescription(description);
    router.push("/ComicBot");
  };

  useEffect(() => {
    fetchNews(selectedCategory, selectedSubcategory);
  }, [selectedCategory, selectedSubcategory]);

  const resetNews = () => {
    setSelectedCategory("all_news");
    setSelectedSubcategory("general");
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
            <div className="mb-4 w-full">
              <label className="block mb-2">Choose Category:</label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="mb-4 p-2 rounded-xl shadow-lg bg-zinc text-zinc-900 w-full"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 w-full">
              <label className="block mb-2">Choose Subcategory:</label>
              <select
                value={selectedSubcategory}
                onChange={handleSubcategoryChange}
                className="mb-4 p-2 rounded-xl shadow-lg bg-zinc text-zinc-900 w-full"
              >
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
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
          {isLoading ? (
            <Loading />
          ) : (
            Object.keys(fetchedArticles).map((category) => (
              <section
                key={category}
                className="category-container mb-8 w-full"
              >
                <div className="flex flex-col text-zinc-200 mb-4 md:flex-row md:items-center">
                  <div className="flex-grow">
                    <h2 className="category-title text-center text-3xl font-bold mb-2 w-full">
                      {category.replace("_", " ").toUpperCase()}
                    </h2>
                    <h3 className="text-center text-xl font-bold mb-2 w-full underline underline-offset-4 decoration-orange-500 decoration-[0.125rem]">
                      {selectedSubcategory.charAt(0).toUpperCase() +
                        selectedSubcategory.slice(1)}{" "}
                      News
                    </h3>
                  </div>
                  <p className="text-center md:text-right text-zinc-200 w-full md:w-auto mt-4 md:mt-0">
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
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewsPage;
