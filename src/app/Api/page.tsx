import functions from 'firebase-functions';
import axios from 'axios';

const fetchNewsData = async (category: string, query = '') => {
  const apiKey = "pub_36319493a646ff640130c77a7d91c0e4d9e9f"; // Replace with your actual API key
  let url = `https://newsdata.io/api/1/news?apikey=${apiKey}&category=${category}`;

  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  try {
    const response = await axios.get(url);
    return response.data.results; // Process and return the data as needed
  } catch (error) {
    console.error("Error fetching news:", error);
    // Handle errors appropriately
    return null;
  }
};

exports.latestNews = functions.https.onRequest(async (req: { query: { q: string; }; }, res: { json: (arg0: any) => void; }) => {
  // You can get query parameters from req.query
  const query = req.query.q as string; // Example: getting a search query
  const news = await fetchNewsData('news', query);
  res.json(news);
});

exports.comedyNews = functions.https.onRequest(async (req: { query: { q: string; }; }, res: { json: (arg0: any) => void; }) => {
  const query = req.query.q as string;
  const news = await fetchNewsData('comedy', query);
  res.json(news);
});

exports.politicsNews = functions.https.onRequest(async (req: { query: { q: string; }; }, res: { json: (arg0: any) => void; }) => {
  const query = req.query.q as string;
  const news = await fetchNewsData('politics', query);
  res.json(news);
});

exports.worldNews = functions.https.onRequest(async (req: { query: { q: string; }; }, res: { json: (arg0: any) => void; }) => {
  const query = req.query.q as string;
  const news = await fetchNewsData('world', query);
  res.json(news);
});

exports.entertainmentNews = functions.https.onRequest(async (req: { query: { q: string; }; }, res: { json: (arg0: any) => void; }) => {
  const query = req.query.q as string;
  const news = await fetchNewsData('entertainment', query);
  res.json(news);
});

