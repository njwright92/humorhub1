"use client";

import React, { useState, useCallback } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import { useRouter } from "next/navigation";
import { useHeadline } from "../components/headlinecontext";

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
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
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

  const handleCategoryChange = (category: Category, isChecked: boolean) => {
    setSelectedCategories((prev) =>
      isChecked ? [...prev, category] : prev.filter((cat) => cat !== category)
    );
  };

  const handleWriteJoke = (title: string, description: string) => {
    setSelectedHeadline(title);
    setSelectedDescription(description);
    router.push("/ComicBot");
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
    setExpandedArticle(null); // Reset expanded article
  };

  return (
    <>
      <Header />
      <div className="screen-container">
        {error && <p className="error-message text-zinc-200">{error}</p>}
        <h1 className="title text-3xl font-bold text-center text-zinc-200 mb-6">
          Humor Hub News
        </h1>
        <section className="card-style bg-zinc-900 text-zinc-200 p-8 rounded-xl drop-shadow-md">
          <p className="text-center mb-4">
            Welcome to the Humor Hub News Portal, your premier destination for
            staying updated with the pulse of comedy, entertainment, and much
            more. Dive into a curated selection of the latest headlines spanning
            comedy, politics, world news, and entertainment. Tailor your news
            feed by selecting categories that interest you the most and use our
            search functionality to hone in on specific topics or events.
            It&#39;s all here, designed to keep your material fresh and your
            insights sharp.
          </p>
          <section className="card p-4 rounded-xl drop-shadow-md mb-6">
            <p className="instructions">
              Stay ahead of the curve with Humor Hub News. Choose from our
              comprehensive categories: Business, Entertainment, General,
              Health, Science, Sports, and Technology. Each category is updated
              in real-time, ensuring you have access to the latest and most
              relevant 5 headlines. Whether you&rsquo;re looking for
              inspiration, aiming to inject current affairs into your routine,
              or simply staying informed, our portal is your go-to resource.
            </p>
            <p className="instructions">
              Select your preferred news categories below to begin exploring the
              latest in humor and beyond. Our dynamic updates mean you&rsquo;re
              always in the loop, ready to tackle any topic with timely,
              informed humor.
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
                <div className="flex flex-col md:flex-row justify-between items-center text-zinc-200">
                  <h2
                    className="category-title w-full text-center md:text-center mb-4 md:mb-0"
                    id="newsCategory"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} News
                  </h2>
                  <p className="w-full md:w-auto sm:mb-4 md:mb-0 md:text-right text-zinc-200 md:order-last">
                    Send this to ComicBot to get the ball rolling!
                  </p>
                  <p className="w-full md:w-auto sm:mb-4 md:mb-0 md:text-left text-zinc-200 md:order-first">
                    Click article titles to view more details.
                  </p>
                </div>

                {fetchedArticles[category as Category]?.map(
                  (article, index) => (
                    <article
                      key={index}
                      className="news-item flex flex-col md:flex-row items-start sm:items-center justify-between"
                    >
                      <div className="flex-1">
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
                      <div className="mt-4 md:mt-0 md:flex md:flex-col md:items-end">
                        <button
                          onClick={() =>
                            handleWriteJoke(article.title, article.description)
                          }
                          className="btn font-semibold py-2 px-4 rounded hover:bg-green-700 hover:text-zinc-200 transition-colors"
                          id="send-joke"
                        >
                          ComicBot&lsquo;s Take
                        </button>
                      </div>
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
