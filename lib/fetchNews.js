// Import two helper functions that manage in-memory caching.
// getCached(key)  → returns cached data if still valid
// setCached(key, data, ttl) → stores data in cache with an expiry time
import { getCached, setCached } from "./cache";

// Base URL of the NewsAPI service.
// NEWS_API_BASE can come from environment variables, otherwise defaults to NewsAPI's v2 endpoint.
const NEWS_API_BASE =
  process.env.NEXT_PUBLIC_NEWS_API_BASE || "https://newsapi.org/v2";

// API Key for authenticating NewsAPI requests.
// Must be stored in environment variables for security.
const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

/**
 * Core function to fetch news from NewsAPI with caching support.
 * This ensures:
 *   - Reduced API usage → prevents hitting rate limits
 *   - Faster responses → because cached data loads instantly
 *
 * @param {string} endpoint - NewsAPI endpoint like "top-headlines" or "everything"
 * @param {Object} params - Query parameters to attach to the request
 * @returns {Promise<Object>} - Parsed JSON response from NewsAPI
 */
export async function fetchNews(endpoint, params = {}) {
  // Build a unique cache key using endpoint + parameters
  // Example key: "top-headlines-{"country":"ng"}"
  const cacheKey = `${endpoint}-${JSON.stringify(params)}`;

  // ---------------------------------------------------
  // 1️⃣ CHECK CACHE FIRST
  // ---------------------------------------------------
  const cached = getCached(cacheKey);
  if (cached) {
    console.log("[Cache Hit]", cacheKey);
    return cached; // instantly return cached data
  }

  // ---------------------------------------------------
  // 2️⃣ BUILD FULL API URL WITH QUERY PARAMETERS
  // ---------------------------------------------------
  const queryParams = new URLSearchParams({
    ...params,
    apiKey: NEWS_API_KEY, // attach API key to every request
  });

  const url = `${NEWS_API_BASE}/${endpoint}?${queryParams}`;

  try {
    console.log("[API Call]", endpoint, params, url);

    // Make the actual request to NewsAPI
    // `next: { revalidate: 60 }` → Next.js ISR will cache the response for 60 seconds
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    // ---------------------------------------------------
    // 3️⃣ HANDLE API ERRORS (including rate limit 429)
    // ---------------------------------------------------
    if (!response.ok) {
      // NewsAPI returns 429 when too many requests are sent
      if (response.status === 429) {
        console.warn("[Rate Limited] Attempting to use stale cache");

        // If cached data exists, return it instead of failing
        const staleCache = getCached(cacheKey);
        if (staleCache) return staleCache;
      }

      // Throw generic error for other API failures
      throw new Error(
        `NewsAPI error: ${response.status} ${response.statusText}`
      );
    }

    // ---------------------------------------------------
    // 4️⃣ PARSE DATA
    // ---------------------------------------------------
    const data = await response.json();

    // ---------------------------------------------------
    // 5️⃣ SAVE NEW DATA IN CACHE (TTL = 60 seconds)
    // ---------------------------------------------------
    setCached(cacheKey, data, 60000);

    return data;
  } catch (error) {
    console.error("[Fetch Error]", error);

    // If API call failed (network issue, API down...), use stale cache
    const staleCache = getCached(cacheKey);
    if (staleCache) {
      console.log("[Using Stale Cache]", cacheKey);
      return staleCache;
    }

    // No cache available → rethrow error
    throw error;
  }
}

/**
 * Fetch top headlines for a specific country and optional category.
 *
 * @param {string} country - ISO country code (default: "ng" for Nigeria)
 * @param {string|null} category - News category like "sports", "tech", etc.
 */
// export async function fetchTopHeadlines(country = "ng", category = null) {
//   const params = { country };
//   if (category) params.category = category; // optional

//   return fetchNews("top-headlines", params);
// }
export async function fetchTopHeadlines(country = "ng", category = null) {
  // If no category is supplied → fetch a LOT of Nigerian news
  if (!category) {
    return fetchNews("everything", {
      q: "Nigeria", // broad Nigeria search
      language: "en",
      sortBy: "publishedAt",
      pageSize: 100, // maximum allowed
    });
  }

  // If a category IS supplied → use the proper endpoint
  return fetchNews("top-headlines", {
    country,
    category,
    pageSize: 100,
  });
}

/**
 * Fetch news based on category.
 * Uses two logic paths:
 *   - If category is "crypto", use /everything because top-headlines doesn't support it well.
 *   - Otherwise use /top-headlines.
 *
 * @param {string} category - e.g., "sports", "business", "crypto"
 */
export async function fetchByCategory(category) {
  // Dedicated handling for crypto queries
  if (category === "crypto") {
    return fetchNews("everything", {
      q: "crypto",
      sortBy: "publishedAt",
      language: "en",
    });
  }

  // Standard category-based headlines
  return fetchNews("top-headlines", {
    category,
    language: "en",
  });
}

/**
 * Search for articles by text query.
 *
 * @param {string} query - Search keywords
 */
export async function searchNews(query) {
  return fetchNews("everything", {
    q: query,
    sortBy: "publishedAt",
    language: "en",
  });
}

/**
 * Find a specific article by its title.
 * This is mainly used when you click a news card and want the full article content.
 *
 * @param {string} title - Exact article title
 */
export async function getArticleByTitle(title) {
  // Search the exact phrase by adding quotes
  const data = await searchNews(`${title}`);

  if (!data.articles || data.articles.length === 0) {
    return null;
  }

  // Try to find article with exact title match
  const article = data.articles.find((a) => a.title === title);

  // If no exact match exists, return first result as fallback
  return article || data.articles[0];
}

/**
 * Sort articles from newest → oldest.
 *
 * @param {Array} articles - List of article objects
 */
export function sortByNewest(articles) {
  if (!articles || !Array.isArray(articles)) return [];

  return articles.sort((a, b) => {
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    return dateB - dateA; // newest first
  });
}
