import { NextResponse } from "next/server";

const NEWS_API_TOKEN = process.env.NEWS_API;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all_news";
  const subcategory = searchParams.get("subcategory") || "general";

  if (!NEWS_API_TOKEN) {
    return NextResponse.json(
      { error: "Server API Token missing" },
      { status: 500 },
    );
  }

  try {
    const endpoint =
      category === "top_stories"
        ? `https://api.thenewsapi.com/v1/news/top`
        : `https://api.thenewsapi.com/v1/news/all`;

    const params = new URLSearchParams({
      api_token: NEWS_API_TOKEN,
      locale: "us,ca",
      language: "en",
      limit: "10",
      categories: subcategory,
    });

    const res = await fetch(`${endpoint}?${params.toString()}`, {
      // Cache results for 1 hour (3600 seconds) to save API credits and speed up load
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`External API error: ${res.status}`);
    }

    const data = await res.json();

    // Filter out incomplete articles
    const validArticles = data.data.filter(
      (article: any) => article.title && article.description,
    );

    return NextResponse.json({ data: validArticles });
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}
