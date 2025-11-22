import Image from "next/image";
import Link from "next/link";

interface NewsCardProps {
  article: {
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    source: {
      name: string;
    };
  };
}

export default function NewsCard({ article }: NewsCardProps) {
  const articleId = encodeURIComponent(article.title);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    // Same calendar day
    if (date.toDateString() === now.toDateString()) {
      if (diffInSeconds < 60) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      return `${diffInHours}h ago`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Older
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <article className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/article/${articleId}`}>
        <div className="relative w-full h-48">
          <Image
            src={article.urlToImage || "/placeholder.svg"}
            alt={article.title || "News article"}
            fill
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary">
            {article.source.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(article.publishedAt)}
          </span>
        </div>

        <Link href={`/article/${articleId}`}>
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>

        {article.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {article.description}
          </p>
        )}

        <Link
          href={`/article/${articleId}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline">
          Read More
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
