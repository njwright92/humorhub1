import { NextResponse } from "next/server";

const NEWS_API_TOKEN = process.env.NEWS_API;

export async function GET(request: Request) {
  if (!NEWS_API_TOKEN) {
    return NextResponse.json(
      { error: "Server API Token missing" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all_news";
  const subcategory = searchParams.get("subcategory") || "general";

  const endpoint =
    category === "top_stories"
      ? "https://api.thenewsapi.com/v1/news/top"
      : "https://api.thenewsapi.com/v1/news/all";

  const params = new URLSearchParams({
    api_token: NEWS_API_TOKEN,
    locale: "us,ca",
    language: "en",
    limit: "10",
    categories: subcategory,
  });

  try {
    const res = await fetch(`${endpoint}?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`External API error: ${res.status}`);

    const { data } = await res.json();

    return NextResponse.json({
      data: data.filter(
        (a: { title?: string; description?: string }) =>
          a.title && a.description,
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 },
    );
  }
}
