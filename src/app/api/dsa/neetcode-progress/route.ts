import { NextRequest, NextResponse } from "next/server";
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

  const rows = await prisma.neetcodeProgress.findMany({
    where: { userId: user.id },
  });

  const result: Record<string, { elapsedSec: number; completed: boolean }> = {};
  for (const r of rows) {
    result[r.problemId] = { elapsedSec: r.elapsedSec, completed: r.completed };
  }

  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemIds } = await request.json();

  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    return NextResponse.json({ error: "Missing problemIds" }, { status: 400 });
  }

  await prisma.neetcodeProgress.updateMany({
    where: {
      userId: user.id,
      problemId: { in: problemIds },
    },
    data: {
      completed: false,
      elapsedSec: 0,
    },
  });

  return NextResponse.json({ reset: problemIds.length });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId, elapsedSec, completed } = await request.json();

  if (!problemId) {
    return NextResponse.json({ error: "Missing problemId" }, { status: 400 });
  }

  const progress = await prisma.neetcodeProgress.upsert({
    where: {
      userId_problemId: {
        userId: user.id,
        problemId,
      },
    },
    create: {
      userId: user.id,
      problemId,
      elapsedSec: elapsedSec ?? 0,
      completed: completed ?? false,
    },
    update: {
      elapsedSec: elapsedSec ?? 0,
      completed: completed ?? false,
    },
  });

  return NextResponse.json(progress);
}
