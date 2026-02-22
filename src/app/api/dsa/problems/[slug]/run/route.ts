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
      testCases: true,
      functionName: true,
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  // Only run visible test cases for "Run"
  const visibleTests = (
    problem.testCases as Array<{
      input: unknown[];
      expectedOutput: unknown;
      isHidden: boolean;
    }>
  ).filter((tc) => !tc.isHidden);

  try {
    const result = await executeCode(
      code,
      language,
      problem.functionName,
      visibleTests
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution failed" },
      { status: 500 }
    );
  }
}
