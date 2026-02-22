"use client";

interface Category {
  name: string;
  slug: string;
}

interface ProblemFiltersProps {
  categories: Category[];
  selectedCategory: string;
  selectedDifficulty: string;
  selectedStatus: string;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ProblemFilters({
  categories,
  selectedCategory,
  selectedDifficulty,
  selectedStatus,
  onCategoryChange,
  onDifficultyChange,
  onStatusChange,
}: ProblemFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={selectedDifficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">All Status</option>
        <option value="solved">Solved</option>
        <option value="attempted">Attempted</option>
        <option value="not_started">Not Started</option>
      </select>
    </div>
  );
}
