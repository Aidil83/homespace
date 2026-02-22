import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const status = searchParams.get("status");

  const where: Prisma.ProblemWhereInput = { isPublished: true };

  if (category) {
    where.category = { slug: category };
  }
  if (difficulty) {
    where.difficulty = difficulty;
  }

  const problems = await prisma.problem.findMany({
    where,
    orderBy: [
      { category: { sortOrder: "asc" } },
      { sortOrder: "asc" },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      sortOrder: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      userProgress: {
        where: { userId: user.id },
        select: { status: true },
      },
    },
  });

  let result = problems.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    sortOrder: p.sortOrder,
    category: p.category.name,
    categorySlug: p.category.slug,
    status: p.userProgress[0]?.status || "not_started",
  }));

  // Filter by user progress status if requested
  if (status) {
    result = result.filter((p) => p.status === status);
  }

  return NextResponse.json(result);
}
