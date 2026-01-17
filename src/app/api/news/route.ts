import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/app/lib/types";
import { NEWS_CACHE_HEADERS } from "@/app/lib/constants";
import { fetchNewsArticles } from "@/app/lib/data/news";

function json<T>(body: ApiResponse<T>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers });
}

export async function GET(request: NextRequest) {
  // Slightly cheaper than new URL(request.url)
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") ?? "all_news";
  const subcategory = searchParams.get("subcategory") ?? "general";
  const { articles, error } = await fetchNewsArticles(category, subcategory);

  if (error) {
    return json({ success: false, error }, 500);
  }

  return json({ success: true, data: articles }, 200, NEWS_CACHE_HEADERS);
}
