import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { BIOMES, type BiomeId } from "@/components/focus/biomes/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await req.json();
  const { status, elapsed } = body;

  if (!["completed", "abandoned"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const session = await prisma.focusSession.findFirst({
    where: { id: sessionId, userId: user.id, status: "active" },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (status === "abandoned") {
    const updated = await prisma.focusSession.update({
      where: { id: sessionId },
      data: { status: "abandoned", elapsed },
    });
    return NextResponse.json({ session: updated, biomeProgress: null });
  }

  // Completed: calculate XP, pick collectible, upsert progress
  const biomeId = session.biome as BiomeId;
  const biomeMeta = BIOMES[biomeId];
  const xpEarned = Math.floor(elapsed / 60);

  // Get or create biome progress
  let progress = await prisma.biomeProgress.findUnique({
    where: { userId_biome: { userId: user.id, biome: biomeId } },
  });

  const earned = (progress?.collectibles as string[]) || [];
  const available = biomeMeta.collectibles.filter((c) => !earned.includes(c));
  const collectible =
    available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : null;

  const newXp = (progress?.xp || 0) + xpEarned;
  const newLevel = Math.floor(newXp / 100) + 1;
  const newCollectibles = collectible ? [...earned, collectible] : earned;

  progress = await prisma.biomeProgress.upsert({
    where: { userId_biome: { userId: user.id, biome: biomeId } },
    create: {
      userId: user.id,
      biome: biomeId,
      xp: xpEarned,
      level: newLevel,
      collectibles: newCollectibles,
    },
    update: {
      xp: newXp,
      level: newLevel,
      collectibles: newCollectibles,
    },
  });

  const updated = await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      elapsed,
      collectible,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    session: updated,
    biomeProgress: progress,
    xpEarned,
  });
}
