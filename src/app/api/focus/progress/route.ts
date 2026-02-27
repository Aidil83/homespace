import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { BIOME_IDS, type BiomeId } from "@/components/focus/biomes/types";

export interface BiomeProgressData {
  biome: BiomeId;
  xp: number;
  level: number;
  collectibles: string[];
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.biomeProgress.findMany({
    where: { userId: user.id },
  });

  const progressMap: Record<string, BiomeProgressData> = {};

  for (const id of BIOME_IDS) {
    const row = rows.find((r) => r.biome === id);
    progressMap[id] = {
      biome: id,
      xp: row?.xp ?? 0,
      level: row?.level ?? 1,
      collectibles: (row?.collectibles as string[]) ?? [],
    };
  }

  return NextResponse.json(progressMap);
}
