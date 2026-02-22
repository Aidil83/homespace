"use client";

import Link from "next/link";
import { DifficultyBadge } from "./difficulty-badge";
import { StatusIcon } from "./status-icon";

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
  name: string;
  slug: string;
  totalProblems: number;
  solvedProblems: number;
}

interface CategoryRoadmapProps {
  problems: Problem[];
  categories: CategoryInfo[];
}

export function CategoryRoadmap({ problems, categories }: CategoryRoadmapProps) {
  const grouped = new Map<string, Problem[]>();
  for (const p of problems) {
    if (!grouped.has(p.categorySlug)) {
      grouped.set(p.categorySlug, []);
    }
    grouped.get(p.categorySlug)!.push(p);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const catProblems = grouped.get(cat.slug) || [];
        if (catProblems.length === 0) return null;

        return (
          <div
            key={cat.slug}
            className="rounded-lg border bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{cat.name}</h3>
              <span className="text-xs text-muted-foreground">
                {cat.solvedProblems}/{cat.totalProblems}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${cat.totalProblems > 0 ? (cat.solvedProblems / cat.totalProblems) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="space-y-1">
              {catProblems.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/dsa/${problem.slug}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <StatusIcon status={problem.status} />
                  <span className="flex-1 truncate">{problem.title}</span>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
