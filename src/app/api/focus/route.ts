import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { BIOME_IDS, DURATION_OPTIONS } from "@/components/focus/biomes/types";

const VALID_DURATIONS = DURATION_OPTIONS.map((d) => d.seconds);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { biome, duration } = body;

  if (!BIOME_IDS.includes(biome)) {
    return NextResponse.json({ error: "Invalid biome" }, { status: 400 });
  }

  if (!VALID_DURATIONS.includes(duration)) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const session = await prisma.focusSession.create({
    data: {
      userId: user.id,
      biome,
      duration,
      status: "active",
    },
  });

  return NextResponse.json(session);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") || "20");

  const sessions = await prisma.focusSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
  });

  return NextResponse.json(sessions);
}
