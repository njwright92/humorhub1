import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Received request:", request); // Log the incoming request

  const url = new URL(request.url);
  console.log("Request URL:", url); // Log the request URL

  // Extract the category and query parameters from the URL
  const category =
    url.searchParams.get("category") ||
    request.cookies.get("lastCategory") ||
    "default";
  const query = url.searchParams.get("q") || "";

  console.log("Category:", category, "Query:", query); // Log the category and query

  // Construct the API URL
  const apiKey = process.env.NEWSDATA_API_KEY;
  let apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&category=${category}`;
  if (query) {
    apiUrl += `&q=${encodeURIComponent(query)}`;
  }

  console.log("API URL:", apiUrl); // Log the API URL being requested

  try {
    // Fetch data from the external API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Log the data received from the API
    console.log("Data received:", data);

    // Create a NextResponse object with the data
    let nextResponse = NextResponse.json(data.results);
    nextResponse.cookies.set("lastCategory", category.toString());
    nextResponse.headers.set("Cache-Control", "public, max-age=3600");

    // Return the response
    return nextResponse;
  } catch (error) {
    // Log the error
    console.error("Error fetching news:", error);

    // Return an error response
    let errorResponse = new NextResponse(
      JSON.stringify({ error: "Failed to fetch news" }),
      {
        status: 500,
      }
    );

    return errorResponse;
  }
}
