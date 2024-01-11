"use client";

import React, { useState } from "react";

// Define the type for articles
type Article = {
  title: string;
  content: string;
  // Add other relevant properties here
};

const NewsPage: React.FC = () => {
  const [category, setCategory] = useState("news");
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
    <div>
      <form onSubmit={handleSubmit}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="news">Latest News</option>
          <option value="comedy">Comedy</option>
          <option value="politics">Politics</option>
          <option value="world">World News</option>
          <option value="entertainment">Entertainment</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Query"
        />
        <button type="submit">Fetch News</button>
      </form>

      <div>
        {articles.map((article, index) => (
          <div key={index}>
            <h3>{article.title}</h3>
            <p>{article.content}</p>
            {/* Other article details */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
