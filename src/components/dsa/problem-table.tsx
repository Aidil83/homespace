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

interface ProblemTableProps {
  problems: Problem[];
}

export function ProblemTable({ problems }: ProblemTableProps) {
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No problems found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-10 px-4 py-3 text-left text-xs font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
              Difficulty
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
              Category
            </th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr
              key={problem.id}
              className="border-b transition-colors hover:bg-muted/30 last:border-0"
            >
              <td className="px-4 py-3">
                <StatusIcon status={problem.status} />
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dsa/${problem.slug}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {problem.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <DifficultyBadge difficulty={problem.difficulty} />
              </td>
              <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                {problem.category}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
