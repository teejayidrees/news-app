module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/cache.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCache",
    ()=>clearCache,
    "getCacheStats",
    ()=>getCacheStats,
    "getCached",
    ()=>getCached,
    "setCached",
    ()=>setCached
]);
const cache = new Map();
function getCached(key) {
    const item = cache.get(key);
    if (!item) return null;
    // Check if cache has expired
    if (Date.now() - item.timestamp > item.duration) {
        cache.delete(key);
        return null;
    }
    return item.data;
}
function setCached(key, data, duration = 60000) {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        duration
    });
}
function clearCache() {
    cache.clear();
}
function getCacheStats() {
    return {
        size: cache.size,
        keys: Array.from(cache.keys())
    };
}
}),
"[project]/lib/fetchNews.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Import two helper functions that manage in-memory caching.
// getCached(key)  → returns cached data if still valid
// setCached(key, data, ttl) → stores data in cache with an expiry time
__turbopack_context__.s([
    "fetchByCategory",
    ()=>fetchByCategory,
    "fetchNews",
    ()=>fetchNews,
    "fetchTopHeadlines",
    ()=>fetchTopHeadlines,
    "getArticleByTitle",
    ()=>getArticleByTitle,
    "searchNews",
    ()=>searchNews,
    "sortByNewest",
    ()=>sortByNewest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cache.js [app-route] (ecmascript)");
;
// Base URL of the NewsAPI service.
// NEWS_API_BASE can come from environment variables, otherwise defaults to NewsAPI's v2 endpoint.
const NEWS_API_BASE = process.env.NEWS_API_BASE || "https://newsapi.org/v2";
// API Key for authenticating NewsAPI requests.
// Must be stored in environment variables for security.
const NEWS_API_KEY = process.env.NEWS_API_KEY;
async function fetchNews(endpoint, params = {}) {
    // Build a unique cache key using endpoint + parameters
    // Example key: "top-headlines-{"country":"ng"}"
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    // ---------------------------------------------------
    // 1️⃣ CHECK CACHE FIRST
    // ---------------------------------------------------
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCached"])(cacheKey);
    if (cached) {
        console.log("[Cache Hit]", cacheKey);
        return cached; // instantly return cached data
    }
    // ---------------------------------------------------
    // 2️⃣ BUILD FULL API URL WITH QUERY PARAMETERS
    // ---------------------------------------------------
    const queryParams = new URLSearchParams({
        ...params,
        apiKey: NEWS_API_KEY
    });
    const url = `${NEWS_API_BASE}/${endpoint}?${queryParams}`;
    try {
        console.log("[API Call]", endpoint, params, url);
        // Make the actual request to NewsAPI
        // `next: { revalidate: 60 }` → Next.js ISR will cache the response for 60 seconds
        const response = await fetch(url, {
            next: {
                revalidate: 60
            }
        });
        // ---------------------------------------------------
        // 3️⃣ HANDLE API ERRORS (including rate limit 429)
        // ---------------------------------------------------
        if (!response.ok) {
            // NewsAPI returns 429 when too many requests are sent
            if (response.status === 429) {
                console.warn("[Rate Limited] Attempting to use stale cache");
                // If cached data exists, return it instead of failing
                const staleCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCached"])(cacheKey);
                if (staleCache) return staleCache;
            }
            // Throw generic error for other API failures
            throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
        }
        // ---------------------------------------------------
        // 4️⃣ PARSE DATA
        // ---------------------------------------------------
        const data = await response.json();
        // ---------------------------------------------------
        // 5️⃣ SAVE NEW DATA IN CACHE (TTL = 60 seconds)
        // ---------------------------------------------------
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setCached"])(cacheKey, data, 60000);
        return data;
    } catch (error) {
        console.error("[Fetch Error]", error);
        // If API call failed (network issue, API down...), use stale cache
        const staleCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCached"])(cacheKey);
        if (staleCache) {
            console.log("[Using Stale Cache]", cacheKey);
            return staleCache;
        }
        // No cache available → rethrow error
        throw error;
    }
}
async function fetchTopHeadlines(country = "ng", category = null) {
    // If no category is supplied → fetch a LOT of Nigerian news
    if (!category) {
        return fetchNews("everything", {
            q: "Nigeria",
            language: "en",
            sortBy: "publishedAt",
            pageSize: 100
        });
    }
    // If a category IS supplied → use the proper endpoint
    return fetchNews("top-headlines", {
        country,
        category,
        pageSize: 100
    });
}
async function fetchByCategory(category) {
    // Dedicated handling for crypto queries
    if (category === "crypto") {
        return fetchNews("everything", {
            q: "crypto",
            sortBy: "publishedAt",
            language: "en"
        });
    }
    // Standard category-based headlines
    return fetchNews("top-headlines", {
        category,
        language: "en"
    });
}
async function searchNews(query) {
    return fetchNews("everything", {
        q: query,
        sortBy: "publishedAt",
        language: "en"
    });
}
async function getArticleByTitle(title) {
    // Search the exact phrase by adding quotes
    const data = await searchNews(`${title}`);
    if (!data.articles || data.articles.length === 0) {
        return null;
    }
    // Try to find article with exact title match
    const article = data.articles.find((a)=>a.title === title);
    // If no exact match exists, return first result as fallback
    return article || data.articles[0];
}
function sortByNewest(articles) {
    if (!articles || !Array.isArray(articles)) return [];
    return articles.sort((a, b)=>{
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB - dateA; // newest first
    });
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetchNews$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fetchNews.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    if (!query) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Search query is required"
        }, {
            status: 400
        });
    }
    try {
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetchNews$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchNews"])(query);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        console.error("Search API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to search news"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__65e54469._.js.map