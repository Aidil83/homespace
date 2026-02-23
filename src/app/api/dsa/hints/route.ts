import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { generateHint } from "@/lib/dsa/gemini";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, code, language, previousAiHints, testResults } =
    await request.json();

  if (!slug || !code || !language) {
    return NextResponse.json(
      { error: "slug, code, and language are required" },
      { status: 400 }
    );
  }

  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      hints: true,
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  try {
    const hint = await generateHint({
      problemTitle: problem.title,
      problemDescription: problem.description,
      userCode: code,
      language,
      staticHints: (problem.hints as string[]) || [],
      previousAiHints: previousAiHints || [],
      testResults: testResults || null,
    });

    return NextResponse.json({ hint });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate hint",
      },
      { status: 500 }
    );
  }
}
