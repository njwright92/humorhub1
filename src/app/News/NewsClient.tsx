import Image from "next/image";
import type { NewsArticle, NewsCategory } from "../lib/types";

function ArticleCard({
  article,
  priority,
}: {
  article: NewsArticle;
  priority: boolean;
}) {
  return (
    <article className="card-muted group grid h-full grid-rows-[auto_1fr] overflow-hidden transition-all hover:-translate-y-1 hover:border-amber-700 hover:shadow-xl hover:shadow-amber-900/20">
      <figure className="relative h-48 w-full">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-105"
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            quality={70}
          />
        ) : (
          <div
            className="grid h-full place-content-center bg-stone-800"
            aria-hidden="true"
          >
            📰
          </div>
        )}
        <span className="absolute top-0 right-0 rounded-bl-xl bg-amber-700 px-3 py-1 text-sm font-bold text-stone-900">
          {article.source || "News"}
        </span>
      </figure>
      <div className="grid grid-rows-[auto_1fr_auto] gap-3 p-5">
        <h2 className="line-clamp-3 text-lg leading-tight transition-colors group-hover:text-amber-700">
          {article.title}
        </h2>
        <p className="line-clamp-3 self-start text-sm text-stone-400">
          {article.description}
        </p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read full story: ${article.title}`}
          className="grid grid-flow-col place-content-center gap-1 rounded-2xl border border-stone-700 py-2.5 text-sm font-semibold text-stone-300 transition-all hover:border-amber-700 hover:bg-amber-700 hover:text-stone-900"
        >
          Read Full Story
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

export default function NewsClient({
  articles,
  error,
  selectedCategory: initialCategory,
  selectedSubcategory: initialSubcategory,
}: {
  articles: NewsArticle[];
  error?: string;
  selectedCategory: NewsCategory;
  selectedSubcategory: string;
}) {
  const selectedCategory = initialCategory;
  const selectedSubcategory = initialSubcategory;

  return (
    <>
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto mb-8 max-w-2xl rounded-2xl border border-red-500/50 bg-red-900 p-4 text-center"
        >
          <p className="font-semibold text-red-200">{error}</p>
          <a
            href={`/News?category=${selectedCategory}&subcategory=${selectedSubcategory}`}
            className="mt-2 cursor-pointer text-sm text-red-300 underline shadow-xl transition-colors hover:text-white"
          >
            Try Again
          </a>
        </div>
      )}

      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">
          News Articles
        </h2>

        {articles.length > 0 ? (
          <ul
            className="animate-slide-in grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            aria-label={`${articles.length} articles`}
          >
            {articles.map((article, index) => (
              <li key={article.uuid}>
                <ArticleCard article={article} priority={index === 0} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-20 text-xl text-stone-500">
            No articles found for this category.
          </p>
        )}
      </section>
    </>
  );
}
