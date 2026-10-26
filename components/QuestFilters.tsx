"use client";

import type { Category } from "../types/quest";

export const categories: Array<Category | "All"> = [
  "All",
  "Outdoors",
  "Slow living",
  "Creative",
  "Connection",
];

type Props = {
  search: string;
  category: Category | "All";
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: Category | "All") => void;
};

export default function QuestFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: Props) {
  return (
    <div className="filters">
      <label className="search-label" htmlFor="quest-search">
        Find your next adventure
      </label>

      <input
        id="quest-search"
        type="search"
        placeholder="Try a walk, a colour, a quiet moment…"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="filter-buttons" aria-label="Quest categories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "selected" : ""}
            aria-pressed={category === item}
            onClick={() => onCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}