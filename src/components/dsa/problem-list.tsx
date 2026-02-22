"use client";

import { useEffect, useState } from "react";
import { ProblemTable } from "./problem-table";
import { ProblemFilters } from "./problem-filters";
import { CategoryRoadmap } from "./category-roadmap";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  categorySlug: string;
  status: string;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  totalProblems: number;
  solvedProblems: number;
}

export function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "roadmap">("roadmap");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [problemsRes, categoriesRes] = await Promise.all([
          fetch("/api/dsa/problems"),
          fetch("/api/dsa/categories"),
        ]);

        if (problemsRes.ok) {
          setProblems(await problemsRes.json());
        }
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProblems = problems.filter((p) => {
    if (selectedCategory && p.categorySlug !== selectedCategory) return false;
    if (selectedDifficulty && p.difficulty !== selectedDifficulty) return false;
    if (selectedStatus && p.status !== selectedStatus) return false;
    return true;
  });

  const totalSolved = problems.filter((p) => p.status === "solved").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DSA Problems</h1>
          <p className="text-sm text-muted-foreground">
            {totalSolved} / {problems.length} solved
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <button
            onClick={() => setView("roadmap")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "roadmap" ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "table" ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProblemFilters
        categories={categories}
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
        selectedStatus={selectedStatus}
        onCategoryChange={setSelectedCategory}
        onDifficultyChange={setSelectedDifficulty}
        onStatusChange={setSelectedStatus}
      />

      {/* Content */}
      {view === "table" ? (
        <ProblemTable problems={filteredProblems} />
      ) : (
        <CategoryRoadmap problems={filteredProblems} categories={categories} />
      )}
    </div>
  );
}
