type Category = "top_stories" | "all_news";

export const NEWS_CATEGORIES = ["top_stories", "all_news"] as const;
export const NEWS_SUBCATEGORIES = [
  "general",
  "science",
  "sports",
  "business",
  "health",
  "entertainment",
  "tech",
  "politics",
  "food",
  "travel",
] as const;

const labelClass = "mb-2 text-xs sm:text-sm font-bold uppercase tracking-wide";
const selectClass =
  "input-amber border-stone-600 bg-stone-900 text-zinc-200 cursor-pointer disabled:opacity-70 hover:border-amber-700";

const formatText = (text: string) =>
  text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export default function NewsFilters({
  selectedCategory,
  selectedSubcategory,
  categories,
  subcategories,
}: {
  selectedCategory: Category;
  selectedSubcategory: string;
  categories: readonly Category[];
  subcategories: readonly string[];
}) {
  return (
    <form
      aria-labelledby="filters-heading"
      method="get"
      action="/News"
      className="card-base-2 card-dark mx-auto mb-12 w-full max-w-4xl border-amber-700 bg-stone-800/80 p-6 shadow-amber-900/10 backdrop-blur-md"
    >
      <fieldset>
        <legend id="filters-heading" className="sr-only">
          Filter News
        </legend>

        <div className="grid items-end gap-6 text-left md:grid-cols-3">
          <div className="grid">
            <label htmlFor="news-category" className={labelClass}>
              All or Top Stories
            </label>
            <select
              id="news-category"
              name="category"
              defaultValue={selectedCategory}
              className={selectClass}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {formatText(cat)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid">
            <label htmlFor="news-subcategory" className={labelClass}>
              Topic
            </label>
            <select
              id="news-subcategory"
              name="subcategory"
              defaultValue={selectedSubcategory}
              className={selectClass}
            >
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {formatText(sub)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-solid btn-stone-soft h-10 cursor-pointer border-2 border-stone-600 transition-colors hover:border-amber-700/50 disabled:opacity-70"
          >
            Search
          </button>
        </div>
      </fieldset>
    </form>
  );
}
