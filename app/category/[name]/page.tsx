import { fetchByCategory, sortByNewest } from "@/lib/fetchNews";
import NewsCard from "@/components/NewsCard";
import SectionTitle from "@/components/SectionTitle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

// ISR caching - revalidate every 60 seconds
export const revalidate = 60;

const VALID_CATEGORIES = [
  "general",
  "technology",
  "business",
  "sports",
  "politics",
  "entertainment",
  "health",
  "science",
  "crypto",
];

interface CategoryPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { name } = await params;
  const categoryName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    title: `${categoryName} News - Naija NewsHub`,
    description: `Latest ${categoryName.toLowerCase()} news and updates from around the world`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { name } = await params;
  const category = name.toLowerCase();

  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  let articles = [];
  let error = null;

  try {
    const data: any = await fetchByCategory(category);
    articles = sortByNewest(data.articles || []);
  } catch (err) {
    console.error(`Error fetching ${category} news:`, err);
    error = `Failed to load ${category} news`;
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionTitle
          title={`${categoryName} News`}
          subtitle={`Latest ${category} headlines and updates`}
        />

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <NewsCard
                key={`${category}-${index}-${article.url}`}
                article={article}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              No {category} news available at the moment
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
