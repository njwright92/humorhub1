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

type Category = "top_stories" | "all_news";

type NewsFiltersProps = {
  selectedCategory: Category;
  selectedSubcategory: string;
  categories: readonly Category[];
  subcategories: readonly string[];
};

export default function NewsFilters({
  selectedCategory,
  selectedSubcategory,
  categories,
  subcategories,
}: NewsFiltersProps) {
  const fmt = (t: string) =>
    t.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <form
      method="get"
      action="/News"
      className="card-dark mx-auto mb-12 w-full max-w-4xl border-amber-700/50"
    >
      <fieldset className="grid items-end gap-6 text-left md:grid-cols-3">
        <legend className="sr-only">Filters</legend>

        <div>
          <label htmlFor="cat" className="form-label mb-1 block text-center">
            Feed
          </label>

          <select
            id="cat"
            name="category"
            defaultValue={selectedCategory}
            className="field-dark cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {fmt(c)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sub" className="form-label mb-1 block text-center">
            Topic
          </label>

          <select
            id="sub"
            name="subcategory"
            defaultValue={selectedSubcategory}
            className="field-dark cursor-pointer"
          >
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {fmt(s)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary py-3">
          Search
        </button>
      </fieldset>
    </form>
  );
}
