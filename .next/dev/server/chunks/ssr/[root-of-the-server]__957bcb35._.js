module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/article/[id]/loading.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/article/[id]/loading.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/cache.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/fetchNews.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cache.js [app-rsc] (ecmascript)");
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
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCached"])(cacheKey);
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
                const staleCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCached"])(cacheKey);
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
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setCached"])(cacheKey, data, 60000);
        return data;
    } catch (error) {
        console.error("[Fetch Error]", error);
        // If API call failed (network issue, API down...), use stale cache
        const staleCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCached"])(cacheKey);
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
"[project]/app/article/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ArticlePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetchNews$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fetchNews.js [app-rsc] (ecmascript)");
;
;
;
;
;
async function ArticlePage({ params }) {
    const { id } = await params;
    const title = decodeURIComponent(id);
    const article = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetchNews$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getArticleByTitle"])(title);
    console.log(article);
    if (!article) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    // Format date
    const formatDate = (dateString)=>{
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto px-4 py-8 max-w-4xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                className: "inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4 mr-1",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M15 19l-7-7 7-7"
                        }, void 0, false, {
                            fileName: "[project]/app/article/[id]/page.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/article/[id]/page.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    "Back to Home"
                ]
            }, void 0, true, {
                fileName: "[project]/app/article/[id]/page.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full",
                                        children: article.source.name
                                    }, void 0, false, {
                                        fileName: "[project]/app/article/[id]/page.tsx",
                                        lineNumber: 56,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                        className: "text-sm text-muted-foreground",
                                        children: formatDate(article.publishedAt)
                                    }, void 0, false, {
                                        fileName: "[project]/app/article/[id]/page.tsx",
                                        lineNumber: 59,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/article/[id]/page.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight",
                                children: article.title
                            }, void 0, false, {
                                fileName: "[project]/app/article/[id]/page.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-8",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    src: article.urlToImage || "/placeholder.svg",
                                    alt: article.title,
                                    fill: true,
                                    priority: true,
                                    className: "object-cover",
                                    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                }, void 0, false, {
                                    fileName: "[project]/app/article/[id]/page.tsx",
                                    lineNumber: 69,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/article/[id]/page.tsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/article/[id]/page.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "prose prose-lg max-w-none dark:prose-invert",
                        children: [
                            article.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xl text-muted-foreground leading-relaxed mb-6",
                                children: article.description
                            }, void 0, false, {
                                fileName: "[project]/app/article/[id]/page.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-foreground leading-relaxed mb-8",
                                children: article.content ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: article.content.split("[")[0]
                                }, void 0, false, {
                                    fileName: "[project]/app/article/[id]/page.tsx",
                                    lineNumber: 89,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Click the button below to read the full story."
                                }, void 0, false, {
                                    fileName: "[project]/app/article/[id]/page.tsx",
                                    lineNumber: 91,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/article/[id]/page.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-muted/50 rounded-lg border border-border mt-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center sm:text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold text-foreground mb-1",
                                                children: "Read the full story"
                                            }, void 0, false, {
                                                fileName: "[project]/app/article/[id]/page.tsx",
                                                lineNumber: 97,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-muted-foreground",
                                                children: [
                                                    "Continue reading at ",
                                                    article.source.name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/article/[id]/page.tsx",
                                                lineNumber: 100,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/article/[id]/page.tsx",
                                        lineNumber: 96,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: article.url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors w-full sm:w-auto",
                                        children: [
                                            "Read Full Article",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4 ml-2",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/article/[id]/page.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/article/[id]/page.tsx",
                                                lineNumber: 110,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/article/[id]/page.tsx",
                                        lineNumber: 104,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/article/[id]/page.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/article/[id]/page.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/article/[id]/page.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/article/[id]/page.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/article/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/article/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__957bcb35._.js.map