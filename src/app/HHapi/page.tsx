"use client";

import React, { useState, useCallback } from "react";
import Footer from "../components/footer";
import Header from "../components/header";

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

const fetchCategoryNews = async (category: Category) => {
  try {
    const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&country=us&pageSize=5&apiKey=a45f6ec6576a496c9fe1c30f7b819207`;

    const response = await fetch(newsApiUrl);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error("Error fetching news for category:", category, error);
    throw new Error("Failed to fetch news");
  }
};

const NewsPage = () => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [fetchedArticles, setFetchedArticles] = useState<ArticlesByCategory>(
    {}
  );
  const [error, setError] = useState("");
  const [isNewsFetched, setIsNewsFetched] = useState(false);

  const handleCategoryChange = (category: Category, isChecked: boolean) => {
    setSelectedCategories((prev) =>
      isChecked ? [...prev, category] : prev.filter((cat) => cat !== category)
    );
  };

  const fetchSelectedNews = useCallback(async () => {
    setIsNewsFetched(true);
    try {
      const fetchPromises = selectedCategories.map((category) =>
        fetchCategoryNews(category)
      );
      const newsResults = await Promise.all(fetchPromises);
      const combinedResults = selectedCategories.reduce(
        (acc, category, index) => {
          acc[category] = newsResults[index] || [];
          return acc;
        },
        {} as ArticlesByCategory
      );
      setFetchedArticles(combinedResults);
    } catch (error) {
      console.error("Error fetching selected news:", error);
      setError("Failed to fetch selected news");
    }
  }, [selectedCategories]);

  const resetNews = () => {
    setSelectedCategories([]);
    setFetchedArticles({});
    setIsNewsFetched(false);
    setError("");
  };

  return (
    <>
      <Header />
      <div className="screen-container">
        {error && <p className="error-message text-zinc-200">{error}</p>}
        <h1 className="title text-zinc-200">Humor Hub News</h1>
        <section className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl drop-shadow-md">
          <p className="text-center mb-4">
            Welcome to the Humor Hub News Portal. Here you can find the latest
            headlines, comedy, politics, world news, and entertainment. Use the
            options below to select your news category of interest and enter a
            search query to narrow down your results.
          </p>
          <section className="card bg-zinc-900 text-zinc-200 p-4 rounded-xl drop-shadow-md">
            <p className="instructions text-zinc-200">
              Select your preferred news categories:
            </p>
            <div className="checkbox-container p-2">
              {categories.map((category) => (
                <label
                  key={category}
                  className="checkbox-wrapper cursor-pointer text-zinc-900"
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
              ))}
            </div>
          </section>

          <button
            onClick={fetchSelectedNews}
            className="btn inline-block bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors"
          >
            Fetch News
          </button>
          <button
            onClick={resetNews}
            className="btn inline-block bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            Reset
          </button>

          {isNewsFetched &&
            Object.keys(fetchedArticles).map((category) => (
              <section key={category} className="category-container">
                <h2 className="category-title text-zinc-200">
                  {category.charAt(0).toUpperCase() + category.slice(1)} News
                </h2>

                {fetchedArticles[category as Category]?.map(
                  (article, index) => (
                    <article key={index} className="news-item">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link text-zinc-200"
                      >
                        {article.title}
                      </a>
                      <p className="news-description text-zinc-200">
                        {article.description}
                      </p>
                    </article>
                  )
                )}
              </section>
            ))}
        </section>
      </div>

      <Footer />
    </>
  );
};

export default NewsPage;
