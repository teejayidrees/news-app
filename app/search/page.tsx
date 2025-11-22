"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import NewsCard from "@/components/NewsCard"
import SectionTitle from "@/components/SectionTitle"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(query)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query) {
      handleSearch(query)
    }
  }, [query])

  const handleSearch = async (q: string) => {
    if (!q.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)

      if (!response.ok) {
        throw new Error("Failed to search news")
      }

      const data = await response.json()

      // Sort by newest
      const sorted = (data.articles || []).sort((a: any, b: any) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })

      setArticles(sorted)
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to search news. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery)}`)
      handleSearch(searchQuery)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SectionTitle title="Search News" subtitle="Find articles on any topic" />

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news..."
                className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Searching...</p>
          </div>
        )}

        {!loading && query && articles.length > 0 && (
          <>
            <p className="text-muted-foreground mb-6">
              Found {articles.length} results for "{query}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article: any, index) => (
                <NewsCard key={`search-${index}-${article.url}`} article={article} />
              ))}
            </div>
          </>
        )}

        {!loading && query && articles.length === 0 && (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">No results found for "{query}". Try different keywords.</p>
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">Enter a search term to find news articles</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
