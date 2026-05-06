import type { NewsArticle, NewsCategory } from "../types";
import { NEWS_API_DEFAULTS } from "../constants";
import { toSafeHttpUrl } from "../utils";

const NEWS_API_TOKEN = process.env.NEWS_API;

const ENDPOINTS = {
  top: "https://api.thenewsapi.com/v1/news/top",
  all: "https://api.thenewsapi.com/v1/news/all",
} as const;

const FETCH_TIMEOUT_MS = 5000; // 5 seconds

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

  const url = new URL(endpoint);
  url.search = params.toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      next: { revalidate: 700 },
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const { data = [] }: NewsApiResponse = await response.json();

    const articles = data.filter(hasRequiredFields).map((article, index) => {
      const raw = article as Record<string, unknown>;
      const title = String(raw.title);
      const description = String(raw.description);
      const safeArticleUrl = toSafeHttpUrl(raw.url);
      const safeImageUrl = toSafeHttpUrl(raw.image_url);
      const uuid = raw.uuid
        ? String(raw.uuid)
        : (safeArticleUrl ?? `${title}-${index}`);

      return {
        uuid,
        title,
        description,
        url: safeArticleUrl,
        image_url: safeImageUrl,
        source: raw.source ? String(raw.source) : undefined,
      };
    });

    return { articles };
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        articles: [],
        error: "News took too long to load. Please try again.",
      };
    }

    console.error("News fetch failed:", error);
    return { articles: [], error: "Failed to fetch news" };
  }
}
