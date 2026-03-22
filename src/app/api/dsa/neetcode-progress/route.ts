import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { computeNextReview, type Rating } from "@/lib/spaced-repetition";

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

  const result: Record<
    string,
    {
      elapsedSec: number;
      completed: boolean;
      lastRating: number | null;
      intervalDays: number;
      reviewCount: number;
      nextReviewDate: string | null;
      mastered: boolean;
      masteryStreak: number;
      notes: string | null;
    }
  > = {};

  for (const r of rows) {
    result[r.problemId] = {
      elapsedSec: r.elapsedSec,
      completed: r.completed,
      lastRating: r.lastRating,
      intervalDays: r.intervalDays,
      reviewCount: r.reviewCount,
      nextReviewDate: r.nextReviewDate
        ? r.nextReviewDate.toISOString().split("T")[0]
        : null,
      mastered: r.mastered,
      masteryStreak: r.masteryStreak,
      notes: r.notes,
    };
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
      lastRating: null,
      intervalDays: 0,
      reviewCount: 0,
      nextReviewDate: null,
      mastered: false,
      masteryStreak: 0,
      notes: null,
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

  const { problemId, elapsedSec, completed, rating, notes, skip } = await request.json();

  if (!problemId) {
    return NextResponse.json({ error: "Missing problemId" }, { status: 400 });
  }

  // "I know this" — mark mastered, no review
  if (skip && completed) {
    const progress = await prisma.neetcodeProgress.upsert({
      where: { userId_problemId: { userId: user.id, problemId } },
      create: {
        userId: user.id,
        problemId,
        elapsedSec: elapsedSec ?? 0,
        completed: true,
        mastered: true,
        notes: notes ?? null,
      },
      update: {
        elapsedSec: elapsedSec ?? 0,
        completed: true,
        mastered: true,
        nextReviewDate: null,
        notes: notes ?? undefined,
      },
    });
    await prisma.neetcodeAttempt.create({
      data: { userId: user.id, problemId, elapsedSec: elapsedSec ?? 0, rating: null },
    });
    return NextResponse.json(progress);
  }

  // Rating provided — compute spaced repetition
  if (rating && completed) {
    const validRatings: Rating[] = [1, 2, 3, 4, 5];
    if (!validRatings.includes(rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const existing = await prisma.neetcodeProgress.findUnique({
      where: { userId_problemId: { userId: user.id, problemId } },
    });

    const reviewState = computeNextReview(
      rating as Rating,
      existing?.intervalDays ?? 0,
      existing?.reviewCount ?? 0,
      existing?.masteryStreak ?? 0
    );

    const progress = await prisma.neetcodeProgress.upsert({
      where: { userId_problemId: { userId: user.id, problemId } },
      create: {
        userId: user.id,
        problemId,
        elapsedSec: elapsedSec ?? 0,
        completed: true,
        lastRating: rating,
        intervalDays: reviewState.intervalDays,
        reviewCount: reviewState.reviewCount,
        nextReviewDate: new Date(reviewState.nextReviewDate),
        mastered: reviewState.mastered,
        masteryStreak: reviewState.masteryStreak,
        notes: notes ?? null,
      },
      update: {
        elapsedSec: elapsedSec ?? 0,
        completed: true,
        lastRating: rating,
        intervalDays: reviewState.intervalDays,
        reviewCount: reviewState.reviewCount,
        nextReviewDate: new Date(reviewState.nextReviewDate),
        mastered: reviewState.mastered,
        masteryStreak: reviewState.masteryStreak,
        notes: notes ?? undefined,
      },
    });
    await prisma.neetcodeAttempt.create({
      data: { userId: user.id, problemId, elapsedSec: elapsedSec ?? 0, rating },
    });

    return NextResponse.json(progress);
  }

  // No rating — backward compatible (just save elapsed/completed)
  const progress = await prisma.neetcodeProgress.upsert({
    where: { userId_problemId: { userId: user.id, problemId } },
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

  // Log attempt when marking complete without rating
  if (completed) {
    await prisma.neetcodeAttempt.create({
      data: { userId: user.id, problemId, elapsedSec: elapsedSec ?? 0, rating: null },
    });
  }

  return NextResponse.json(progress);
}
