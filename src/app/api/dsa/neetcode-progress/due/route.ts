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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = await prisma.neetcodeProgress.findMany({
    where: {
      userId: user.id,
      completed: true,
      mastered: false,
      nextReviewDate: { lte: today },
    },
    orderBy: { nextReviewDate: "asc" },
  });

  return NextResponse.json({
    due: due.map((r) => ({
      problemId: r.problemId,
      nextReviewDate: r.nextReviewDate
        ? r.nextReviewDate.toISOString().split("T")[0]
        : null,
      intervalDays: r.intervalDays,
      reviewCount: r.reviewCount,
      lastRating: r.lastRating,
      masteryStreak: r.masteryStreak,
      notes: r.notes,
    })),
  });
}
