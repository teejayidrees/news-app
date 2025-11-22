"use client";
import { clearCache } from "@/lib/cache";
import Link from "next/link";

export default function Navbar() {
  const categories = [
    { name: "World News", slug: "general" },
    { name: "Technology", slug: "technology" },
    { name: "Business", slug: "business" },
    { name: "Sports", slug: "sports" },
    { name: "Entertainment", slug: "entertainment" },
    { name: "Health", slug: "health" },
    { name: "Science", slug: "science" },
    { name: "Crypto", slug: "crypto" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with logo and search */}
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            onClick={() => clearCache()}
            className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                A
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Aheee NewsHub
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/search"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Search
            </Link>
          </div>
        </div>

        {/* Category navigation */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-3 scrollbar-hide">
          <Link
            href={`/`}
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors whitespace-nowrap">
            Home
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors whitespace-nowrap">
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
