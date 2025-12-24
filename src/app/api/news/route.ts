import { NextResponse } from "next/server";

const NEWS_API_TOKEN = process.env.NEWS_API;

const TOP_ENDPOINT = "https://api.thenewsapi.com/v1/news/top";
const ALL_ENDPOINT = "https://api.thenewsapi.com/v1/news/all";

export async function GET(request: Request): Promise<Response> {
  if (!NEWS_API_TOKEN) {
    return NextResponse.json(
      { error: "Server API Token missing" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? "all_news";
  const subcategory = url.searchParams.get("subcategory") ?? "general";

  const endpoint = category === "top_stories" ? TOP_ENDPOINT : ALL_ENDPOINT;

  const params = new URLSearchParams({
    api_token: NEWS_API_TOKEN,
    locale: "us,ca",
    language: "en",
    limit: "10",
    categories: subcategory,
  });

  try {
    const res = await fetch(`${endpoint}?${params.toString()}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`News API error: ${res.status}`);
    }

    const json = (await res.json()) as {
      data?: Array<{ title?: string; description?: string }>;
    };

    const filtered = (json.data ?? []).filter(
      (item) => item.title && item.description
    );

    return NextResponse.json(
      { data: filtered },
      { headers: { "Cache-Control": "max-age=300" } }
    );
  } catch (error) {
    console.error("[API/news] Fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
