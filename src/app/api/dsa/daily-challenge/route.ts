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

  const today = new Date().toISOString().split("T")[0];

  const completions = await prisma.dailyChallengeCompletion.findMany({
    where: {
      userId: user.id,
      date: new Date(today),
    },
  });

  const result: Record<string, { problemId: string; elapsedSec: number }> = {};
  for (const c of completions) {
    result[c.difficulty] = { problemId: c.problemId, elapsedSec: c.elapsedSec };
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { difficulty, problemId, elapsedSec } = await request.json();

  if (!difficulty || !problemId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  const completion = await prisma.dailyChallengeCompletion.upsert({
    where: {
      userId_date_difficulty: {
        userId: user.id,
        date: new Date(today),
        difficulty,
      },
    },
    create: {
      userId: user.id,
      date: new Date(today),
      difficulty,
      problemId,
      elapsedSec: elapsedSec ?? 0,
    },
    update: {
      problemId,
      elapsedSec: elapsedSec ?? 0,
    },
  });

  return NextResponse.json(completion);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { difficulty } = await request.json();

  if (!difficulty) {
    return NextResponse.json({ error: "Missing difficulty" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  await prisma.dailyChallengeCompletion.deleteMany({
    where: {
      userId: user.id,
      date: new Date(today),
      difficulty,
    },
  });

  return NextResponse.json({ ok: true });
}
