import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      category: {
        select: { name: true, slug: true },
      },
      userProgress: {
        where: { userId: user.id },
        select: {
          status: true,
          attempts: true,
          lastLanguage: true,
          lastCode: true,
          solvedAt: true,
        },
      },
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  // Filter out hidden test cases for the client — only show visible ones
  const testCases = (problem.testCases as Array<{ isHidden: boolean }>).filter(
    (tc) => !tc.isHidden
  );

  return NextResponse.json({
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    description: problem.description,
    examples: problem.examples,
    constraints: problem.constraints,
    starterCode: problem.starterCode,
    hints: problem.hints,
    testCases,
    category: problem.category,
    progress: problem.userProgress[0] || null,
  });
}
