"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DifficultyBadge } from "./difficulty-badge";
import { ArrowLeft, Trophy, Target, Flame } from "lucide-react";

interface DifficultyBreakdown {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
}

interface CategoryProgress {
  name: string;
  slug: string;
  solved: number;
  attempted: number;
  total: number;
}

interface RecentSubmission {
  id: string;
  status: string;
  language: string;
  passedTests: number;
  totalTests: number;
  runtime: number | null;
  createdAt: string;
  problem: { title: string; slug: string; difficulty: string };
}

interface ProgressData {
  totalProblems: number;
  totalSolved: number;
  totalAttempted: number;
  difficultyBreakdown: DifficultyBreakdown;
  categories: CategoryProgress[];
  recentSubmissions: RecentSubmission[];
}

export function ProgressDashboard() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch("/api/dsa/progress");
        if (res.ok) {
          setData(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Failed to load progress.</p>;
  }

  const completionPercent =
    data.totalProblems > 0
      ? Math.round((data.totalSolved / data.totalProblems) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dsa"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Problems
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Progress</h1>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Solved
          </div>
          <p className="mt-1 text-3xl font-bold">
            {data.totalSolved}
            <span className="text-base font-normal text-muted-foreground">
              /{data.totalProblems}
            </span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4 text-blue-500" />
            Attempted
          </div>
          <p className="mt-1 text-3xl font-bold">{data.totalAttempted}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            Completion
          </div>
          <p className="mt-1 text-3xl font-bold">{completionPercent}%</p>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 font-semibold">By Difficulty</h2>
        <div className="space-y-3">
          {(["easy", "medium", "hard"] as const).map((diff) => {
            const { solved, total } = data.difficultyBreakdown[diff];
            const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
            return (
              <div key={diff} className="flex items-center gap-3">
                <DifficultyBadge difficulty={diff} className="w-16 justify-center" />
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        diff === "easy"
                          ? "bg-green-500"
                          : diff === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 text-right text-sm text-muted-foreground">
                  {solved}/{total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category progress */}
      {data.categories.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 font-semibold">By Category</h2>
          <div className="space-y-3">
            {data.categories.map((cat) => {
              const pct =
                cat.total > 0
                  ? Math.round((cat.solved / cat.total) * 100)
                  : 0;
              return (
                <div key={cat.slug} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm">{cat.name}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm text-muted-foreground">
                    {cat.solved}/{cat.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent submissions */}
      {data.recentSubmissions.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 font-semibold">Recent Submissions</h2>
          <div className="space-y-2">
            {data.recentSubmissions.map((sub) => (
              <Link
                key={sub.id}
                href={`/dsa/${sub.problem.slug}`}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-medium ${
                      sub.status === "accepted"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {sub.status === "accepted" ? "Accepted" : "Failed"}
                  </span>
                  <span>{sub.problem.title}</span>
                  <DifficultyBadge difficulty={sub.problem.difficulty} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
