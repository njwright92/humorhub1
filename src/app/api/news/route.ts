import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/app/lib/types";

const NEWS_API_TOKEN = process.env.NEWS_API;
const ENDPOINTS = {
  top: "https://api.thenewsapi.com/v1/news/top",
  all: "https://api.thenewsapi.com/v1/news/all",
} as const;

interface NewsArticle {
  title: string;
  description: string;
  url?: string;
  image_url?: string;
  published_at?: string;
  source?: string;
  [key: string]: unknown;
}

interface NewsApiResponse {
  data?: Array<Partial<NewsArticle>>;
}

function json<T>(body: ApiResponse<T>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

function hasRequiredFields(
  article: Partial<NewsArticle>
): article is NewsArticle {
  return Boolean(article.title && article.description);
}

export async function GET(request: NextRequest) {
  if (!NEWS_API_TOKEN) {
    return json({ success: false, error: "Server API token missing" }, 500);
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all_news";
  const subcategory = searchParams.get("subcategory") ?? "general";

  const endpoint = category === "top_stories" ? ENDPOINTS.top : ENDPOINTS.all;
  const params = new URLSearchParams({
    api_token: NEWS_API_TOKEN,
    locale: "us,ca",
    language: "en",
    limit: "10",
    categories: subcategory,
  });

  try {
    const response = await fetch(`${endpoint}?${params}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const { data = [] }: NewsApiResponse = await response.json();
    const articles = data.filter(hasRequiredFields);

    return json({ success: true, data: articles }, 200, {
      "Cache-Control": "max-age=300",
    });
  } catch (error) {
    console.error("News fetch failed:", error);
    return json({ success: false, error: "Failed to fetch news" }, 500);
  }
}
