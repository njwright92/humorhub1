"use client";

import React, { useState } from "react";
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
};

type ArticlesByCategory = {
  [key in Category]?: Article[];
};

const NewsPage = () => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [articlesByCategory, setArticlesByCategory] =
    useState<ArticlesByCategory>({});
  const [error, setError] = useState("");
  const [isNewsFetched, setIsNewsFetched] = useState(false);

  const handleCategoryChange = (category: Category, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category)
      );
    }
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
      setError("Failed to fetch news");
    }
  };

  const fetchSelectedNews = async () => {
    setIsNewsFetched(true);
    try {
      const newsPromises = selectedCategories.map((category) =>
        fetchCategoryNews(category)
      );
      const newsResults = await Promise.all(newsPromises);
      const combinedResults = selectedCategories.reduce(
        (acc, category, index) => {
          acc[category] = newsResults[index] || []; // Handle categories with no news or errors
          return acc;
        },
        {} as ArticlesByCategory
      );
      setArticlesByCategory(combinedResults);
    } catch (error) {
      console.error("Error fetching selected news:", error);
      setError("Failed to fetch selected news");
    }
  };

  const resetNews = () => {
    setSelectedCategories([]);
    setArticlesByCategory({});
    setIsNewsFetched(false); // Reset the fetched state
    setError("");
  };

  return (
    <div>
      <Header />
      <div className="screen-container">
        {error && <p className="error-message">{error}</p>}
        <h1 className="title">News Page</h1>
        <div className="card-style">
          <p className="text-center mb-4">
            Welcome to the Humor Hub News Portal. Here you can find the latest
            headlines, comedy, politics, world news, and entertainment. Use the
            options below to select your news category of interest and enter a
            search query to narrow down your results.
          </p>
          <div className="card">
            <p className="instructions">
              Select your preferred news categories:
            </p>
            <div className="checkbox-container">
              {categories.map((category) => (
                <div key={category} className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedCategories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                  <label className="cursor-pointer">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button onClick={fetchSelectedNews} className="btn">
            Fetch News
          </button>
          <button onClick={resetNews} className="btn">
            Reset
          </button>

          {isNewsFetched &&
            selectedCategories.map((category) => (
              <div key={category} className="category-container">
                <h2 className="category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)} News
                </h2>
                <div className="category-content">
                  {articlesByCategory[category]?.map((article, index) => (
                    <div key={index} className="news-item">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link"
                      >
                        {article.title}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewsPage;
