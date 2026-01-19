import type { NewsArticle, NewsCategory } from "../types";
import { NEWS_API_DEFAULTS } from "../constants";

const NEWS_API_TOKEN = process.env.NEWS_API;

const ENDPOINTS = {
  top: "https://api.thenewsapi.com/v1/news/top",
  all: "https://api.thenewsapi.com/v1/news/all",
} as const;

interface NewsApiResponse {
  data?: Array<Record<string, unknown>>;
}

const isNewsCategory = (value?: string): value is NewsCategory =>
  value === "top_stories" || value === "all_news";

const hasRequiredFields = (
  article: Record<string, unknown>,
): article is { title: string; description: string } =>
  Boolean(article.title && article.description);

export async function fetchNewsArticles(
  category?: string,
  subcategory?: string,
): Promise<{ articles: NewsArticle[]; error?: string }> {
  if (!NEWS_API_TOKEN) {
    return { articles: [], error: "Server API token missing" };
  }

  const resolvedCategory: NewsCategory = isNewsCategory(category)
    ? category
    : "all_news";
  const resolvedSubcategory = subcategory || "general";

  const endpoint =
    resolvedCategory === "top_stories" ? ENDPOINTS.top : ENDPOINTS.all;

  const params = new URLSearchParams({
    api_token: NEWS_API_TOKEN,
    locale: NEWS_API_DEFAULTS.locale,
    language: NEWS_API_DEFAULTS.language,
    limit: NEWS_API_DEFAULTS.limit,
    categories: resolvedSubcategory,
  });

  try {
    const url = new URL(endpoint);
    url.search = params.toString();

    const response = await fetch(url, {
      next: { revalidate: 30 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const { data = [] }: NewsApiResponse = await response.json();
    const articles = data.filter(hasRequiredFields).map((article, index) => {
      const raw = article as Record<string, unknown>;
      const title = String(raw.title);
      const description = String(raw.description);
      const urlValue = raw.url ? String(raw.url) : "#";
      const uuid = raw.uuid
        ? String(raw.uuid)
        : raw.url
          ? String(raw.url)
          : `${title}-${index}`;

      return {
        uuid,
        title,
        description,
        url: urlValue,
        image_url: raw.image_url ? String(raw.image_url) : undefined,
        source: raw.source ? String(raw.source) : undefined,
      };
    });

    return { articles };
  } catch (error) {
    console.error("News fetch failed:", error);
    return { articles: [], error: "Failed to fetch news" };
  }
}
