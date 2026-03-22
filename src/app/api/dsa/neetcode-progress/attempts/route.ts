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

  const problemId = request.nextUrl.searchParams.get("problemId");
  if (!problemId) {
    return NextResponse.json({ error: "Missing problemId" }, { status: 400 });
  }

  const attempts = await prisma.neetcodeAttempt.findMany({
    where: { userId: user.id, problemId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    attempts: attempts.map((a) => ({
      elapsedSec: a.elapsedSec,
      rating: a.rating,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
