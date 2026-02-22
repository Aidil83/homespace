import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [progress, totalProblems, submissions] = await Promise.all([
    prisma.userProblemProgress.findMany({
      where: { userId: user.id },
      include: {
        problem: {
          select: {
            difficulty: true,
            category: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.problem.count({ where: { isPublished: true } }),
    prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        language: true,
        passedTests: true,
        totalTests: true,
        runtime: true,
        createdAt: true,
        problem: {
          select: { title: true, slug: true, difficulty: true },
        },
      },
    }),
  ]);

  const solved = progress.filter((p) => p.status === "solved");
  const attempted = progress.filter((p) => p.status === "attempted");

  // Difficulty breakdown
  const difficultyBreakdown = {
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 },
  };

  // Get total problems by difficulty
  const totalByDifficulty = await prisma.problem.groupBy({
    by: ["difficulty"],
    where: { isPublished: true },
    _count: true,
  });

  for (const d of totalByDifficulty) {
    const key = d.difficulty as keyof typeof difficultyBreakdown;
    if (difficultyBreakdown[key]) {
      difficultyBreakdown[key].total = d._count;
    }
  }

  for (const s of solved) {
    const key = s.problem.difficulty as keyof typeof difficultyBreakdown;
    if (difficultyBreakdown[key]) {
      difficultyBreakdown[key].solved++;
    }
  }

  // Category breakdown
  const categoryMap = new Map<
    string,
    { name: string; slug: string; solved: number; attempted: number; total: number }
  >();

  for (const p of progress) {
    const catSlug = p.problem.category.slug;
    if (!categoryMap.has(catSlug)) {
      categoryMap.set(catSlug, {
        name: p.problem.category.name,
        slug: catSlug,
        solved: 0,
        attempted: 0,
        total: 0,
      });
    }
    const entry = categoryMap.get(catSlug)!;
    if (p.status === "solved") entry.solved++;
    else if (p.status === "attempted") entry.attempted++;
  }

  // Get total problems per category
  const categoryCounts = await prisma.problem.groupBy({
    by: ["categoryId"],
    where: { isPublished: true },
    _count: true,
  });

  const categoryDetails = await prisma.problemCategory.findMany({
    select: { id: true, name: true, slug: true },
  });

  for (const cc of categoryCounts) {
    const cat = categoryDetails.find((c) => c.id === cc.categoryId);
    if (cat) {
      if (!categoryMap.has(cat.slug)) {
        categoryMap.set(cat.slug, {
          name: cat.name,
          slug: cat.slug,
          solved: 0,
          attempted: 0,
          total: cc._count,
        });
      } else {
        categoryMap.get(cat.slug)!.total = cc._count;
      }
    }
  }

  return NextResponse.json({
    totalProblems,
    totalSolved: solved.length,
    totalAttempted: attempted.length,
    difficultyBreakdown,
    categories: Array.from(categoryMap.values()),
    recentSubmissions: submissions,
  });
}
