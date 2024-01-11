"use client";

import React, { useState } from "react";
import Footer from "../components/footer";
import Header from "../components/header";

// Define the type for articles
type Article = {
  title: string;
  content: string;
  // Add other relevant properties here
};

const NewsPage: React.FC = () => {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]); // Use the Article type for state

  const fetchNews = async () => {
    const response = await fetch(
      `/api/news/${category}?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    setArticles(data);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchNews();
  };

  return (
    <>
      <Header />
      <div className="screen-container">
        <h1 className="title">News Page</h1>
        <div className="card-style">
          <p className="text-center mb-4">
            Welcome to the Humor Hub News Portal. Here you can find the latest
            headlines, comedy, politics, world news, and entertainment. Use the
            options below to select your news category of interest and enter a
            search query to narrow down your results.
          </p>
          <form
            className="flex flex-col md:flex-row justify-center items-center gap-4 p-4"
            onSubmit={handleSubmit}
          >
            <select
              id="category"
              name="category"
              className="flex-grow md:flex-grow-0"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled selected>
                Select Category
              </option>
              <option value="news">Latest News</option>
              <option value="comedy">Comedy</option>
              <option value="politics">Politics</option>
              <option value="world">World News</option>
              <option value="entertainment">Entertainment</option>
            </select>

            <input
              id="searchQuery"
              name="query"
              className="flex-grow md:flex-grow-0"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Query"
            />

            <button className="btn" type="submit">
              Fetch News
            </button>
          </form>
          <div className="news-container">
            {articles.map((article, index) => (
              <div key={index} className="news-article">
                <h3 className="article-title">{article.title}</h3>
                <p className="article-content">{article.content}</p>
                {/* Other article details */}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewsPage;
