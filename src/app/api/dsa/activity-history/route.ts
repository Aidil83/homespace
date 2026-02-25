import { NextRequest, NextResponse } from "next/server";
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
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "20") || 20, 1),
    50
  );

  const today = new Date().toISOString().split("T")[0];

  const [dailyCompletions, neetcodeCompletions] = await Promise.all([
    prisma.dailyChallengeCompletion.findMany({
      where: {
        userId: user.id,
        date: { lt: new Date(today) },
      },
      orderBy: { date: "desc" },
      take: limit,
      select: {
        date: true,
        difficulty: true,
        problemId: true,
        elapsedSec: true,
      },
    }),
    prisma.neetcodeProgress.findMany({
      where: {
        userId: user.id,
        completed: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        problemId: true,
        elapsedSec: true,
        updatedAt: true,
      },
    }),
  ]);

  const activities = [
    ...dailyCompletions.map((c) => ({
      type: "daily" as const,
      date: c.date.toISOString().split("T")[0],
      problemId: c.problemId,
      difficulty: c.difficulty,
      elapsedSec: c.elapsedSec,
    })),
    ...neetcodeCompletions.map((c) => ({
      type: "neetcode" as const,
      date: c.updatedAt.toISOString().split("T")[0],
      problemId: c.problemId,
      difficulty: "",
      elapsedSec: c.elapsedSec,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);

  return NextResponse.json({ activities });
}
