type Category = "top_stories" | "all_news";

const labelClass = "mb-2 text-xs sm:text-sm font-bold uppercase tracking-wide";
const selectClass =
  "input-amber border-stone-600 bg-stone-900 text-zinc-200 cursor-pointer disabled:opacity-70";

const formatText = (text: string) =>
  text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export default function NewsFilters({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  onReset,
  isLoading,
  categories,
  subcategories,
}: {
  selectedCategory: Category;
  selectedSubcategory: string;
  onCategoryChange: (value: Category) => void;
  onSubcategoryChange: (value: string) => void;
  onReset: () => void;
  isLoading: boolean;
  categories: readonly Category[];
  subcategories: readonly string[];
}) {
  return (
    <form
      aria-labelledby="filters-heading"
      onSubmit={(e) => e.preventDefault()}
      className="card-shell card-border-2 card-dark mx-auto mb-12 w-full max-w-4xl border-amber-700 bg-stone-800/80 p-6 shadow-amber-900/10 backdrop-blur-md"
    >
      <fieldset disabled={isLoading}>
        <legend id="filters-heading" className="sr-only">
          Filter News
        </legend>

        <div className="grid items-end gap-6 text-left md:grid-cols-3">
          <div className="grid">
            <label htmlFor="news-category" className={labelClass}>
              Feed Type
            </label>
            <select
              id="news-category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as Category)}
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
              value={selectedSubcategory}
              onChange={(e) => onSubcategoryChange(e.target.value)}
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
            type="reset"
            onClick={onReset}
            className="btn-solid btn-stone-soft h-10 cursor-pointer border-2 border-stone-600 transition-colors hover:border-amber-700/50 disabled:opacity-70"
          >
            Reset Filters
          </button>
        </div>
      </fieldset>
    </form>
  );
}
