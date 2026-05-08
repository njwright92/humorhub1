import Image from "next/image";
import Link from "next/link";
import type { NewsArticle, NewsCategory } from "../lib/types";

type ArticleCardProps = {
  article: NewsArticle;
  priority: boolean;
};

type NewsClientProps = {
  articles: NewsArticle[];
  error?: string;
  selectedCategory: NewsCategory;
  selectedSubcategory: string;
};

function ArticleCard({ article, priority }: ArticleCardProps) {
  return (
    <article className="card-muted group flex h-full flex-col transition-all hover:-translate-y-1 hover:border-amber-700 hover:shadow-xl hover:shadow-amber-700">
      <figure className="relative h-48 w-full overflow-hidden rounded-t-xl bg-stone-900">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="grid h-full place-content-center text-4xl text-stone-500 opacity-30">
            📰
          </div>
        )}

        <span className="absolute top-0 right-0 rounded-bl-xl bg-amber-700 px-3 py-1 text-xs font-bold text-stone-900">
          {article.source || "News"}
        </span>
      </figure>

      <div className="flex grow flex-col gap-3 p-5">
        <h2 className="line-clamp-2 text-lg transition-colors group-hover:text-amber-700">
          {article.title}
        </h2>

        <p className="line-clamp-3 text-sm text-stone-400">
          {article.description}
        </p>

        <div className="mt-auto pt-4">
          {article.url ? (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-amber block w-full py-2 text-sm"
            >
              Read Full Story →
            </a>
          ) : (
            <span className="block text-center text-xs font-bold text-stone-600 uppercase">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function NewsClient({
  articles,
  error,
  selectedCategory,
  selectedSubcategory,
}: NewsClientProps) {
  return (
    <div className="animate-slide-in">
      {error && (
        <div className="card-dark mx-auto mb-8 max-w-2xl border-red-900 bg-red-900/20 p-4 text-center">
          <p className="font-bold text-red-400">{error}</p>

          <Link
            href={`/News?category=${selectedCategory}&subcategory=${selectedSubcategory}`}
            className="text-sm text-red-300 underline hover:text-white"
          >
            Try Again
          </Link>
        </div>
      )}

      {articles.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <li key={a.uuid}>
              <ArticleCard article={a} priority={i === 0} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-20 text-xl text-stone-500">No articles found.</p>
      )}
    </div>
  );
}
