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
  const problemId = searchParams.get("problemId");
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20") || 20, 1), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0") || 0, 0);

  const where: Prisma.SubmissionWhereInput = { userId: user.id };
  if (problemId) {
    where.problemId = problemId;
  }

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      language: true,
      code: true,
      status: true,
      passedTests: true,
      totalTests: true,
      runtime: true,
      memory: true,
      createdAt: true,
      problem: {
        select: { title: true, slug: true, difficulty: true },
      },
    },
  });

  return NextResponse.json(submissions);
}
