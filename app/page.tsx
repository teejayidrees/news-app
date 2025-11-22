import { fetchTopHeadlines, sortByNewest } from "@/lib/fetchNews";
import NewsCard from "@/components/NewsCard";
import SectionTitle from "@/components/SectionTitle";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ISR caching - revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  let foreignNews = [];
  let error = null;

  try {
    // Fetch US/Foreign headlines
    const foreignData: any = await fetchTopHeadlines("us");
    foreignNews = sortByNewest(foreignData.articles || []);
  } catch (err) {
    console.error("Error fetching foreign news:", err);
    if (!error) error = "Failed to load foreign news";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Stay Informed with the Latest News
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get breaking news from Nigeria and around the world, updated in
            real-time
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Foreign Headlines Section */}
        <section className="mb-12">
          <SectionTitle
            title="Nigeria News"
            subtitle="Headlines and breaking news from Nigeria"
          />

          {foreignNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foreignNews.map((article, index) => (
                <NewsCard
                  key={`us-${index}-${article.url}`}
                  article={article}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                No world news available at the moment
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
