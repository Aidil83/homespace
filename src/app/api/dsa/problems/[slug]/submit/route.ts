import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { executeCode } from "@/lib/dsa/execution";

export async function POST(
  request: Request,
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
  const { code, language } = await request.json();

  if (!code || !language) {
    return NextResponse.json(
      { error: "Code and language are required" },
      { status: 400 }
    );
  }

  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: {
      id: true,
      testCases: true,
      functionName: true,
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const allTests = problem.testCases as Array<{
    input: unknown[];
    expectedOutput: unknown;
    isHidden: boolean;
  }>;

  try {
    const result = await executeCode(
      code,
      language,
      problem.functionName,
      allTests
    );

    // Save submission
    await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        language,
        code,
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        runtime: result.runtime,
        memory: result.memory,
        errorOutput: result.errorOutput,
      },
    });

    // Update user progress
    await prisma.userProblemProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
      update: {
        ...(result.status === "accepted"
          ? { status: "solved", solvedAt: new Date() }
          : {}),
        attempts: { increment: 1 },
        lastLanguage: language,
        lastCode: code,
      },
      create: {
        userId: user.id,
        problemId: problem.id,
        status: result.status === "accepted" ? "solved" : "attempted",
        attempts: 1,
        lastLanguage: language,
        lastCode: code,
        ...(result.status === "accepted" ? { solvedAt: new Date() } : {}),
      },
    });

    // Filter hidden test results before returning to client
    const clientResults = result.results.map((r) =>
      r.isHidden
        ? { ...r, actual: undefined, expected: undefined, error: undefined }
        : r
    );

    return NextResponse.json({
      ...result,
      results: clientResults,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution failed" },
      { status: 500 }
    );
  }
}
