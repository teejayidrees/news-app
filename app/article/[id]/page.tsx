import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleByTitle } from "@/lib/fetchNews";

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const title = decodeURIComponent(id);
  const article = await getArticleByTitle(title);
  console.log(article);
  if (!article) {
    notFound();
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Home
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
              {article.source.name}
            </span>
            <time className="text-sm text-muted-foreground">
              {formatDate(article.publishedAt)}
            </time>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-8">
            <Image
              src={article.urlToImage || "/placeholder.svg"}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          {article.description && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              {article.description}
            </p>
          )}

          <div className="text-foreground leading-relaxed mb-8">
            {article.content ? (
              <p>{article.content.split("[")[0]}</p>
            ) : (
              <p>Click the button below to read the full story.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-muted/50 rounded-lg border border-border mt-8">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-foreground mb-1">
                Read the full story
              </h3>
              <p className="text-sm text-muted-foreground">
                Continue reading at {article.source.name}
              </p>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors w-full sm:w-auto">
              Read Full Article
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
